const express = require('express');
const { requireHouseholdMember } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/recipes/:householdId
// @desc    Get recipes for household
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { search, cuisine_type, difficulty, dietary_tags, page = 1, limit = 20 } = req.query;

  let whereConditions = ['(r.household_id = $1 OR r.is_public = true)'];
  let queryParams = [householdId];
  let paramCount = 1;

  if (search) {
    paramCount++;
    whereConditions.push(`(r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`);
    queryParams.push(`%${search}%`);
  }

  if (cuisine_type) {
    paramCount++;
    whereConditions.push(`r.cuisine_type = $${paramCount}`);
    queryParams.push(cuisine_type);
  }

  if (difficulty) {
    paramCount++;
    whereConditions.push(`r.difficulty = $${paramCount}`);
    queryParams.push(difficulty);
  }

  if (dietary_tags) {
    paramCount++;
    whereConditions.push(`r.dietary_tags && $${paramCount}`);
    queryParams.push(dietary_tags.split(','));
  }

  const offset = (page - 1) * limit;

  const recipesResult = await query(`
    SELECT r.*, hm.name as created_by_name
    FROM recipes r
    LEFT JOIN household_members hm ON r.created_by = hm.id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY r.created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `, [...queryParams, limit, offset]);

  const countResult = await query(`
    SELECT COUNT(*) as total FROM recipes r WHERE ${whereConditions.join(' AND ')}
  `, queryParams);

  const total = parseInt(countResult.rows[0].total);

  res.json({
    recipes: recipesResult.rows,
    pagination: {
      current_page: parseInt(page),
      total_pages: Math.ceil(total / limit),
      total_items: total,
      items_per_page: parseInt(limit)
    }
  });
}));

// @route   POST /api/recipes/:householdId
// @desc    Create a new recipe
// @access  Private (household members)
router.post('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { name, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cuisine_type, dietary_tags } = req.body;

  if (!name || !ingredients || !instructions) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Recipe name, ingredients, and instructions are required'
    });
  }

  const result = await query(`
    INSERT INTO recipes (household_id, name, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cuisine_type, dietary_tags, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    householdId,
    name,
    description,
    JSON.stringify(ingredients),
    JSON.stringify(instructions),
    prep_time || null,
    cook_time || null,
    servings || 4,
    difficulty || 'medium',
    cuisine_type || null,
    dietary_tags || null,
    req.user.memberId
  ]);

  res.status(201).json({
    message: 'Recipe created successfully',
    recipe: result.rows[0]
  });
}));

module.exports = router;