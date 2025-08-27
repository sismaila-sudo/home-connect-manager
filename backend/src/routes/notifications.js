const express = require('express');
const { requireHouseholdMember } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/notifications/:householdId
// @desc    Get notifications for user
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { is_read, limit = 50 } = req.query;

  let whereConditions = ['household_id = $1', 'recipient_id = $2'];
  let queryParams = [householdId, req.user.memberId];
  let paramCount = 2;

  if (is_read !== undefined) {
    paramCount++;
    whereConditions.push(`is_read = $${paramCount}`);
    queryParams.push(is_read === 'true');
  }

  const notificationsResult = await query(`
    SELECT * FROM notifications 
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY sent_at DESC
    LIMIT $${paramCount + 1}
  `, [...queryParams, limit]);

  res.json({
    notifications: notificationsResult.rows
  });
}));

// @route   PUT /api/notifications/:householdId/:notificationId/read
// @desc    Mark notification as read
// @access  Private (household members)
router.put('/:householdId/:notificationId/read', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId, notificationId } = req.params;

  const result = await query(`
    UPDATE notifications 
    SET is_read = true, read_at = NOW()
    WHERE id = $1 AND household_id = $2 AND recipient_id = $3
    RETURNING *
  `, [notificationId, householdId, req.user.memberId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Notification not found'
    });
  }

  res.json({
    message: 'Notification marked as read',
    notification: result.rows[0]
  });
}));

module.exports = router;