const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authorization header provided'
      });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and get user info
    const userResult = await query(
      'SELECT u.*, hm.id as member_id, hm.household_id, hm.role, h.name as household_name FROM users u LEFT JOIN household_members hm ON u.email = hm.email LEFT JOIN households h ON hm.household_id = h.id WHERE u.id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found'
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      householdId: decoded.householdId,
      memberId: decoded.memberId,
      ...userResult.rows[0]
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Household ownership check
const requireHouseholdOwner = async (req, res, next) => {
  try {
    const householdId = req.params.householdId || req.body.householdId;
    
    if (!householdId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Household ID required'
      });
    }

    const result = await query(
      'SELECT owner_id FROM households WHERE id = $1',
      [householdId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Household not found'
      });
    }

    if (result.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only household owners can perform this action'
      });
    }

    next();
  } catch (err) {
    console.error('Household ownership check error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Authorization failed'
    });
  }
};

// Household member check
const requireHouseholdMember = async (req, res, next) => {
  try {
    const householdId = req.params.householdId || req.body.householdId;
    
    if (!householdId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Household ID required'
      });
    }

    // Check if user is household owner or member
    const ownerResult = await query(
      'SELECT owner_id FROM households WHERE id = $1',
      [householdId]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Household not found'
      });
    }

    // User is household owner
    if (ownerResult.rows[0].owner_id === req.user.id) {
      return next();
    }

    // Check if user is household member
    const memberResult = await query(
      'SELECT id FROM household_members WHERE household_id = $1 AND email = $2 AND status = $3',
      [householdId, req.user.email, 'active']
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied - not a household member'
      });
    }

    next();
  } catch (err) {
    console.error('Household member check error:', err);
    res.status(500).json({
      error: 'Server error',
      message: 'Authorization failed'
    });
  }
};

module.exports = {
  authMiddleware,
  authorize,
  requireHouseholdOwner,
  requireHouseholdMember
};