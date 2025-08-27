const express = require('express');
const { requireHouseholdMember } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/shopping/:householdId/lists
// @desc    Get shopping lists
// @access  Private (household members)
router.get('/:householdId/lists', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const listsResult = await query(`
    SELECT sl.*, hm.name as created_by_name,
           COUNT(sli.id) as total_items,
           COUNT(CASE WHEN sli.is_purchased = true THEN 1 END) as purchased_items,
           SUM(sli.estimated_price) as estimated_total
    FROM shopping_lists sl
    LEFT JOIN household_members hm ON sl.created_by = hm.id
    LEFT JOIN shopping_list_items sli ON sl.id = sli.list_id
    WHERE sl.household_id = $1
    GROUP BY sl.id, hm.name
    ORDER BY sl.created_at DESC
  `, [householdId]);

  res.json({
    lists: listsResult.rows
  });
}));

// @route   POST /api/shopping/:householdId/lists
// @desc    Create a new shopping list
// @access  Private (household members)
router.post('/:householdId/lists', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Shopping list name is required'
    });
  }

  const result = await query(`
    INSERT INTO shopping_lists (household_id, name, description, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [householdId, name, description || null, req.user.memberId]);

  res.status(201).json({
    message: 'Shopping list created successfully',
    list: result.rows[0]
  });
}));

// @route   POST /api/shopping/:householdId/lists/:listId/items
// @desc    Add item to shopping list
// @access  Private (household members)
router.post('/:householdId/lists/:listId/items', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId, listId } = req.params;
  const { name, quantity = 1, unit, category, estimated_price, notes } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Item name is required'
    });
  }

  const result = await query(`
    INSERT INTO shopping_list_items (list_id, name, quantity, unit, category, estimated_price, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [listId, name, quantity, unit, category, estimated_price, notes]);

  res.status(201).json({
    message: 'Item added successfully',
    item: result.rows[0]
  });
}));

// @route   PUT /api/shopping/:householdId/lists/:listId/items/:itemId
// @desc    Update shopping list item
// @access  Private (household members)
router.put('/:householdId/lists/:listId/items/:itemId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const updates = req.body;

  const updateFields = [];
  const updateValues = [];
  let paramCount = 0;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      paramCount++;
      updateFields.push(`${key} = $${paramCount}`);
      updateValues.push(value);
    }
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'No valid fields to update'
    });
  }

  updateValues.push(itemId);

  const result = await query(`
    UPDATE shopping_list_items 
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount + 1}
    RETURNING *
  `, updateValues);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Item not found'
    });
  }

  res.json({
    message: 'Item updated successfully',
    item: result.rows[0]
  });
}));

module.exports = router;