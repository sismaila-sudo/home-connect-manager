const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const userResult = await query(`
    SELECT u.id, u.email, u.name, u.phone, u.avatar_url, u.subscription_type, u.created_at,
           hm.household_id, hm.role, h.name as household_name
    FROM users u
    LEFT JOIN household_members hm ON u.email = hm.email AND hm.status = 'active'
    LEFT JOIN households h ON hm.household_id = h.id
    WHERE u.id = $1
  `, [req.user.id]);

  if (userResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found'
    });
  }

  const user = userResult.rows[0];
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      subscription_type: user.subscription_type,
      created_at: user.created_at,
      household: user.household_id ? {
        id: user.household_id,
        name: user.household_name,
        role: user.role
      } : null
    }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { name, phone } = req.body;
  const updates = {};
  
  if (name) updates.name = name;
  if (phone) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No valid fields to update'
    });
  }

  const updateFields = [];
  const updateValues = [];
  let paramCount = 0;

  for (const [key, value] of Object.entries(updates)) {
    paramCount++;
    updateFields.push(`${key} = $${paramCount}`);
    updateValues.push(value);
  }

  updateValues.push(req.user.id);

  const userResult = await query(`
    UPDATE users 
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount + 1}
    RETURNING id, email, name, phone, avatar_url, subscription_type
  `, updateValues);

  res.json({
    message: 'Profile updated successfully',
    user: userResult.rows[0]
  });
}));

module.exports = router;