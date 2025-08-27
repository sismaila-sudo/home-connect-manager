const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register new user and create household
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input',
      details: errors.array()
    });
  }

  const { email, password, name, phone, householdName } = req.body;

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      error: 'User Exists',
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user and household in transaction
  const result = await transaction(async (client) => {
    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, name, phone, subscription_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, subscription_type, created_at`,
      [email, hashedPassword, name, phone, 'free']
    );

    const user = userResult.rows[0];

    // Create household
    const householdResult = await client.query(
      `INSERT INTO households (owner_id, name, currency, timezone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, currency, timezone, created_at`,
      [user.id, householdName || `${name}'s Household`, 'EUR', 'Europe/Paris']
    );

    const household = householdResult.rows[0];

    // Add user as household owner member
    const memberResult = await client.query(
      `INSERT INTO household_members (household_id, name, email, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, role`,
      [household.id, name, email, phone, 'owner', 'active']
    );

    const member = memberResult.rows[0];

    // Create default task categories
    const categories = [
      { name: 'Ménage', color: '#EF4444', icon: 'cleaning' },
      { name: 'Cuisine', color: '#F97316', icon: 'cooking' },
      { name: 'Jardinage', color: '#22C55E', icon: 'gardening' },
      { name: 'Maintenance', color: '#3B82F6', icon: 'maintenance' },
      { name: 'Courses', color: '#8B5CF6', icon: 'shopping' }
    ];

    for (const category of categories) {
      await client.query(
        `INSERT INTO task_categories (household_id, name, color, icon)
         VALUES ($1, $2, $3, $4)`,
        [household.id, category.name, category.color, category.icon]
      );
    }

    // Create default budget categories
    const budgetCategories = [
      { name: 'Alimentation', color: '#EF4444', icon: 'food' },
      { name: 'Ménage', color: '#3B82F6', icon: 'cleaning' },
      { name: 'Maintenance', color: '#F97316', icon: 'maintenance' },
      { name: 'Loisirs', color: '#8B5CF6', icon: 'entertainment' }
    ];

    for (const category of budgetCategories) {
      await client.query(
        `INSERT INTO budget_categories (household_id, name, color, icon)
         VALUES ($1, $2, $3, $4)`,
        [household.id, category.name, category.color, category.icon]
      );
    }

    // Initialize member points
    await client.query(
      `INSERT INTO member_points (household_id, member_id, total_points, monthly_points, level)
       VALUES ($1, $2, $3, $4, $5)`,
      [household.id, member.id, 0, 0, 1]
    );

    return { user, household, member };
  });

  // Generate JWT token
  const token = generateToken({
    userId: result.user.id,
    email: result.user.email,
    role: result.member.role,
    householdId: result.household.id,
    memberId: result.member.id
  });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      phone: result.user.phone,
      subscription_type: result.user.subscription_type
    },
    household: {
      id: result.household.id,
      name: result.household.name,
      currency: result.household.currency,
      role: result.member.role
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user with household info
  const userResult = await query(`
    SELECT u.*, 
           hm.id as member_id, hm.household_id, hm.role,
           h.name as household_name, h.currency, h.timezone
    FROM users u
    LEFT JOIN household_members hm ON u.email = hm.email AND hm.status = 'active'
    LEFT JOIN households h ON hm.household_id = h.id
    WHERE u.email = $1
  `, [email]);

  if (userResult.rows.length === 0) {
    return res.status(400).json({
      error: 'Invalid Credentials',
      message: 'Invalid email or password'
    });
  }

  const user = userResult.rows[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(400).json({
      error: 'Invalid Credentials',
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role || 'owner',
    householdId: user.household_id,
    memberId: user.member_id
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      subscription_type: user.subscription_type
    },
    household: user.household_id ? {
      id: user.household_id,
      name: user.household_name,
      currency: user.currency,
      timezone: user.timezone,
      role: user.role
    } : null
  });
}));

// @route   POST /api/auth/login-member
// @desc    Login with member code
// @access  Public
router.post('/login-member', asyncHandler(async (req, res) => {
  const { loginCode } = req.body;

  if (!loginCode) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Login code is required'
    });
  }

  // Find member by login code
  const memberResult = await query(`
    SELECT hm.*, h.name as household_name, h.currency, h.timezone, h.owner_id
    FROM household_members hm
    JOIN households h ON hm.household_id = h.id
    WHERE hm.login_code = $1 AND hm.status = 'active'
  `, [loginCode]);

  if (memberResult.rows.length === 0) {
    return res.status(400).json({
      error: 'Invalid Credentials',
      message: 'Invalid login code'
    });
  }

  const member = memberResult.rows[0];

  // Generate JWT token
  const token = generateToken({
    userId: null, // Members don't have user accounts
    email: member.email,
    role: member.role,
    householdId: member.household_id,
    memberId: member.id
  });

  res.json({
    message: 'Login successful',
    token,
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role
    },
    household: {
      id: member.household_id,
      name: member.household_name,
      currency: member.currency,
      timezone: member.timezone,
      role: member.role
    }
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.id) {
    // Full user account
    const userResult = await query(`
      SELECT u.*, 
             hm.id as member_id, hm.household_id, hm.role,
             h.name as household_name, h.currency, h.timezone
      FROM users u
      LEFT JOIN household_members hm ON u.email = hm.email AND hm.status = 'active'
      LEFT JOIN households h ON hm.household_id = h.id
      WHERE u.id = $1
    `, [req.user.id]);

    const user = userResult.rows[0];
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        subscription_type: user.subscription_type,
        avatar_url: user.avatar_url
      },
      household: user.household_id ? {
        id: user.household_id,
        name: user.household_name,
        currency: user.currency,
        timezone: user.timezone,
        role: user.role
      } : null
    });
  } else {
    // Member-only account
    const memberResult = await query(`
      SELECT hm.*, h.name as household_name, h.currency, h.timezone
      FROM household_members hm
      JOIN households h ON hm.household_id = h.id
      WHERE hm.id = $1 AND hm.status = 'active'
    `, [req.user.memberId]);

    const member = memberResult.rows[0];
    
    res.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        avatar_url: member.avatar_url
      },
      household: {
        id: member.household_id,
        name: member.household_name,
        currency: member.currency,
        timezone: member.timezone,
        role: member.role
      }
    });
  }
}));

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authMiddleware, asyncHandler(async (req, res) => {
  // Generate new token
  const token = generateToken({
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role,
    householdId: req.user.householdId,
    memberId: req.user.memberId
  });

  res.json({
    message: 'Token refreshed successfully',
    token
  });
}));

module.exports = router;