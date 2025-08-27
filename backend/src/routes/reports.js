const express = require('express');
const { requireHouseholdMember } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/reports/:householdId
// @desc    Get reports for household
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { status, category, page = 1, limit = 20 } = req.query;

  let whereConditions = ['r.household_id = $1'];
  let queryParams = [householdId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    whereConditions.push(`r.status = $${paramCount}`);
    queryParams.push(status);
  }

  if (category) {
    paramCount++;
    whereConditions.push(`r.category = $${paramCount}`);
    queryParams.push(category);
  }

  const offset = (page - 1) * limit;

  const reportsResult = await query(`
    SELECT r.*, 
           hm_reported.name as reported_by_name,
           hm_assigned.name as assigned_to_name,
           ARRAY_AGG(
             CASE 
               WHEN rp.id IS NOT NULL 
               THEN json_build_object('id', rp.id, 'url', rp.url, 'caption', rp.caption)
               ELSE NULL
             END
           ) FILTER (WHERE rp.id IS NOT NULL) as photos
    FROM reports r
    LEFT JOIN household_members hm_reported ON r.reported_by = hm_reported.id
    LEFT JOIN household_members hm_assigned ON r.assigned_to = hm_assigned.id
    LEFT JOIN report_photos rp ON r.id = rp.report_id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY r.id, hm_reported.name, hm_assigned.name
    ORDER BY r.created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `, [...queryParams, limit, offset]);

  res.json({
    reports: reportsResult.rows
  });
}));

// @route   POST /api/reports/:householdId
// @desc    Create a new report
// @access  Private (household members)
router.post('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { title, description, category, priority, location } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Report title and description are required'
    });
  }

  const result = await query(`
    INSERT INTO reports (household_id, title, description, category, priority, location, reported_by, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [householdId, title, description, category || 'general', priority || 'medium', location, req.user.memberId, 'open']);

  res.status(201).json({
    message: 'Report created successfully',
    report: result.rows[0]
  });
}));

// @route   PUT /api/reports/:householdId/:reportId
// @desc    Update report status
// @access  Private (household members)
router.put('/:householdId/:reportId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId, reportId } = req.params;
  const { status, assigned_to, notes } = req.body;

  const updates = {};
  if (status) updates.status = status;
  if (assigned_to) updates.assigned_to = assigned_to;
  if (notes) updates.notes = notes;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
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

  updateValues.push(reportId, householdId);

  const result = await query(`
    UPDATE reports 
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount + 1} AND household_id = $${paramCount + 2}
    RETURNING *
  `, updateValues);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Report not found'
    });
  }

  res.json({
    message: 'Report updated successfully',
    report: result.rows[0]
  });
}));

module.exports = router;