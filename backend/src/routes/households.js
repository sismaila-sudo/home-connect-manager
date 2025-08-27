const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireHouseholdOwner, requireHouseholdMember, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate random login code
const generateLoginCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @route   GET /api/households/:householdId
// @desc    Get household details
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const householdResult = await query(`
    SELECT h.*, u.name as owner_name, u.email as owner_email
    FROM households h
    JOIN users u ON h.owner_id = u.id
    WHERE h.id = $1
  `, [householdId]);

  if (householdResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Household not found'
    });
  }

  res.json({
    household: householdResult.rows[0]
  });
}));

// @route   GET /api/households/:householdId/members
// @desc    Get household members
// @access  Private (household members)
router.get('/:householdId/members', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const membersResult = await query(`
    SELECT hm.*, mp.total_points, mp.level,
           COUNT(t.id) as total_tasks,
           COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
    FROM household_members hm
    LEFT JOIN member_points mp ON hm.id = mp.member_id
    LEFT JOIN tasks t ON hm.id = t.assigned_to
    WHERE hm.household_id = $1 AND hm.status = 'active'
    GROUP BY hm.id, mp.total_points, mp.level
    ORDER BY 
      CASE hm.role 
        WHEN 'owner' THEN 1 
        WHEN 'co_manager' THEN 2 
        WHEN 'member' THEN 3 
        WHEN 'guest' THEN 4 
      END, 
      hm.name
  `, [householdId]);

  res.json({
    members: membersResult.rows
  });
}));

// @route   POST /api/households/:householdId/members
// @desc    Add new member to household
// @access  Private (owners and co_managers)
router.post('/:householdId/members', [
  requireHouseholdMember,
  authorize('owner', 'co_manager'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('role').isIn(['co_manager', 'member', 'guest']).withMessage('Invalid role'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { householdId } = req.params;
  const { name, email, phone, role } = req.body;

  // Generate unique login code
  let loginCode;
  let isUnique = false;
  while (!isUnique) {
    loginCode = generateLoginCode();
    const existingCode = await query(
      'SELECT id FROM household_members WHERE login_code = $1',
      [loginCode]
    );
    if (existingCode.rows.length === 0) {
      isUnique = true;
    }
  }

  const memberResult = await query(`
    INSERT INTO household_members (household_id, name, email, phone, role, login_code, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [householdId, name, email, phone, role, loginCode, 'active']);

  const member = memberResult.rows[0];

  // Initialize member points
  await query(`
    INSERT INTO member_points (household_id, member_id, total_points, monthly_points, level)
    VALUES ($1, $2, 0, 0, 1)
  `, [householdId, member.id]);

  res.status(201).json({
    message: 'Member added successfully',
    member: {
      ...member,
      total_points: 0,
      level: 1
    }
  });
}));

// @route   PUT /api/households/:householdId/members/:memberId
// @desc    Update household member
// @access  Private (owners and co_managers)
router.put('/:householdId/members/:memberId', [
  requireHouseholdMember,
  authorize('owner', 'co_manager'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['co_manager', 'member', 'guest']).withMessage('Invalid role'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { householdId, memberId } = req.params;
  const updates = req.body;

  // Check if member exists
  const memberCheck = await query(
    'SELECT id, role FROM household_members WHERE id = $1 AND household_id = $2',
    [memberId, householdId]
  );

  if (memberCheck.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Member not found'
    });
  }

  // Don't allow changing owner role
  if (memberCheck.rows[0].role === 'owner') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Cannot modify household owner'
    });
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];
  let paramCount = 0;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== 'login_code') {
      paramCount++;
      updateFields.push(`${key} = $${paramCount}`);
      updateValues.push(value);
    }
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No valid fields to update'
    });
  }

  updateValues.push(memberId, householdId);

  const memberResult = await query(`
    UPDATE household_members 
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount + 1} AND household_id = $${paramCount + 2}
    RETURNING *
  `, updateValues);

  res.json({
    message: 'Member updated successfully',
    member: memberResult.rows[0]
  });
}));

// @route   DELETE /api/households/:householdId/members/:memberId
// @desc    Remove member from household
// @access  Private (owners only)
router.delete('/:householdId/members/:memberId', [
  requireHouseholdOwner
], asyncHandler(async (req, res) => {
  const { householdId, memberId } = req.params;

  // Check if member exists and is not owner
  const memberCheck = await query(
    'SELECT id, role FROM household_members WHERE id = $1 AND household_id = $2',
    [memberId, householdId]
  );

  if (memberCheck.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Member not found'
    });
  }

  if (memberCheck.rows[0].role === 'owner') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Cannot remove household owner'
    });
  }

  // Soft delete by setting status to inactive
  await query(
    'UPDATE household_members SET status = $1, updated_at = NOW() WHERE id = $2 AND household_id = $3',
    ['inactive', memberId, householdId]
  );

  res.json({
    message: 'Member removed successfully'
  });
}));

// @route   PUT /api/households/:householdId/settings
// @desc    Update household settings
// @access  Private (owners only)
router.put('/:householdId/settings', [
  requireHouseholdOwner,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('timezone').optional().isLength({ min: 1 }).withMessage('Timezone is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }

  const { householdId } = req.params;
  const { name, address, currency, timezone, settings } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (address !== undefined) updates.address = address;
  if (currency) updates.currency = currency;
  if (timezone) updates.timezone = timezone;
  if (settings) updates.settings = JSON.stringify(settings);

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

  updateValues.push(householdId);

  const householdResult = await query(`
    UPDATE households 
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount + 1}
    RETURNING *
  `, updateValues);

  res.json({
    message: 'Household settings updated successfully',
    household: householdResult.rows[0]
  });
}));

// @route   GET /api/households/:householdId/dashboard
// @desc    Get dashboard data
// @access  Private (household members)
router.get('/:householdId/dashboard', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  // Task statistics
  const taskStatsResult = await query(`
    SELECT 
      COUNT(*) as total_tasks,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
      COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks
    FROM tasks
    WHERE household_id = $1
  `, [householdId]);

  // Active members count
  const memberCountResult = await query(
    'SELECT COUNT(*) as active_members FROM household_members WHERE household_id = $1 AND status = $2',
    [householdId, 'active']
  );

  // Recent tasks
  const recentTasksResult = await query(`
    SELECT t.*, hm.name as assigned_to_name, tc.name as category_name, tc.color as category_color
    FROM tasks t
    LEFT JOIN household_members hm ON t.assigned_to = hm.id
    LEFT JOIN task_categories tc ON t.category_id = tc.id
    WHERE t.household_id = $1
    ORDER BY t.created_at DESC
    LIMIT 10
  `, [householdId]);

  // Budget summary (if expenses exist)
  const budgetSummaryResult = await query(`
    SELECT 
      SUM(amount) as total_expenses,
      COUNT(*) as expense_count
    FROM expenses
    WHERE household_id = $1 AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)
  `, [householdId]);

  res.json({
    task_stats: taskStatsResult.rows[0],
    member_count: parseInt(memberCountResult.rows[0].active_members),
    recent_tasks: recentTasksResult.rows,
    budget_summary: budgetSummaryResult.rows[0]
  });
}));

module.exports = router;