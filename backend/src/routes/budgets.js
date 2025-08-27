const express = require('express');
const { requireHouseholdMember } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/budgets/:householdId
// @desc    Get budgets for household
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const budgetsResult = await query(`
    SELECT b.*, bc.name as category_name, bc.color as category_color,
           COALESCE(SUM(e.amount), 0) as spent_amount
    FROM budgets b
    LEFT JOIN budget_categories bc ON b.category_id = bc.id
    LEFT JOIN expenses e ON bc.id = e.category_id 
      AND e.expense_date >= b.start_date 
      AND (b.end_date IS NULL OR e.expense_date <= b.end_date)
    WHERE b.household_id = $1
    GROUP BY b.id, bc.name, bc.color
    ORDER BY b.created_at DESC
  `, [householdId]);

  res.json({
    budgets: budgetsResult.rows
  });
}));

// @route   POST /api/budgets/:householdId
// @desc    Create a new budget
// @access  Private (owners and co_managers)
router.post('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { name, amount, category_id, start_date, end_date, description } = req.body;

  if (!name || !amount) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Budget name and amount are required'
    });
  }

  const result = await query(`
    INSERT INTO budgets (household_id, name, amount, category_id, start_date, end_date, description, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [householdId, name, amount, category_id, start_date, end_date, description, req.user.memberId]);

  res.status(201).json({
    message: 'Budget created successfully',
    budget: result.rows[0]
  });
}));

// @route   POST /api/budgets/:householdId/expenses
// @desc    Add expense to budget
// @access  Private (household members)
router.post('/:householdId/expenses', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { amount, description, category_id, expense_date, receipt_url } = req.body;

  if (!amount || !description) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Amount and description are required'
    });
  }

  const result = await query(`
    INSERT INTO expenses (household_id, amount, description, category_id, expense_date, receipt_url, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [householdId, amount, description, category_id, expense_date || new Date(), receipt_url, req.user.memberId]);

  res.status(201).json({
    message: 'Expense added successfully',
    expense: result.rows[0]
  });
}));

module.exports = router;