const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { requireHouseholdMember, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimated_duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive number (minutes)')
];

// @route   GET /api/tasks/:householdId
// @desc    Get all tasks for a household
// @access  Private (household members)
router.get('/:householdId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { status, assigned_to, category_id, page = 1, limit = 50 } = req.query;

  let whereConditions = ['t.household_id = $1'];
  let queryParams = [householdId];
  let paramCount = 1;

  // Add filters
  if (status) {
    paramCount++;
    whereConditions.push(`t.status = $${paramCount}`);
    queryParams.push(status);
  }

  if (assigned_to) {
    paramCount++;
    whereConditions.push(`t.assigned_to = $${paramCount}`);
    queryParams.push(assigned_to);
  }

  if (category_id) {
    paramCount++;
    whereConditions.push(`t.category_id = $${paramCount}`);
    queryParams.push(category_id);
  }

  // If user is a member (not owner/co_manager), only show their tasks
  if (req.user.role === 'member') {
    paramCount++;
    whereConditions.push(`t.assigned_to = $${paramCount}`);
    queryParams.push(req.user.memberId);
  }

  const offset = (page - 1) * limit;
  
  const tasksResult = await query(`
    SELECT t.*,
           tc.name as category_name, tc.color as category_color,
           hm_assigned.name as assigned_to_name,
           hm_created.name as created_by_name,
           ARRAY_AGG(
             CASE 
               WHEN tp.id IS NOT NULL 
               THEN json_build_object('id', tp.id, 'url', tp.url, 'type', tp.type, 'uploaded_at', tp.uploaded_at)
               ELSE NULL
             END
           ) FILTER (WHERE tp.id IS NOT NULL) as photos
    FROM tasks t
    LEFT JOIN task_categories tc ON t.category_id = tc.id
    LEFT JOIN household_members hm_assigned ON t.assigned_to = hm_assigned.id
    LEFT JOIN household_members hm_created ON t.created_by = hm_created.id
    LEFT JOIN task_photos tp ON t.id = tp.task_id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY t.id, tc.name, tc.color, hm_assigned.name, hm_created.name
    ORDER BY 
      CASE t.status 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `, [...queryParams, limit, offset]);

  // Get total count
  const countResult = await query(`
    SELECT COUNT(*) as total
    FROM tasks t
    WHERE ${whereConditions.join(' AND ')}
  `, queryParams);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.json({
    tasks: tasksResult.rows,
    pagination: {
      current_page: parseInt(page),
      total_pages: totalPages,
      total_items: total,
      items_per_page: parseInt(limit),
      has_next: page < totalPages,
      has_prev: page > 1
    }
  });
}));

// @route   GET /api/tasks/:householdId/:taskId
// @desc    Get single task
// @access  Private (household members)
router.get('/:householdId/:taskId', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId, taskId } = req.params;

  const taskResult = await query(`
    SELECT t.*,
           tc.name as category_name, tc.color as category_color, tc.icon as category_icon,
           hm_assigned.name as assigned_to_name, hm_assigned.email as assigned_to_email,
           hm_created.name as created_by_name,
           tt.name as template_name
    FROM tasks t
    LEFT JOIN task_categories tc ON t.category_id = tc.id
    LEFT JOIN household_members hm_assigned ON t.assigned_to = hm_assigned.id
    LEFT JOIN household_members hm_created ON t.created_by = hm_created.id
    LEFT JOIN task_templates tt ON t.template_id = tt.id
    WHERE t.id = $1 AND t.household_id = $2
  `, [taskId, householdId]);

  if (taskResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found'
    });
  }

  const task = taskResult.rows[0];

  // Check permissions - members can only view their own tasks
  if (req.user.role === 'member' && task.assigned_to !== req.user.memberId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You can only view your own tasks'
    });
  }

  // Get task photos
  const photosResult = await query(
    'SELECT * FROM task_photos WHERE task_id = $1 ORDER BY uploaded_at DESC',
    [taskId]
  );

  task.photos = photosResult.rows;

  res.json({ task });
}));

// @route   POST /api/tasks/:householdId
// @desc    Create new task
// @access  Private (owners and co_managers)
router.post('/:householdId', [requireHouseholdMember, authorize('owner', 'co_manager'), taskValidation], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input',
      details: errors.array()
    });
  }

  const { householdId } = req.params;
  const {
    title,
    description,
    category_id,
    template_id,
    assigned_to,
    priority = 'medium',
    due_date,
    estimated_duration,
    points_reward = 0,
    requires_photos = false,
    location,
    recurring_pattern
  } = req.body;

  const taskResult = await query(`
    INSERT INTO tasks (
      household_id, title, description, category_id, template_id,
      assigned_to, created_by, priority, due_date, estimated_duration,
      points_reward, requires_photos, location, recurring_pattern
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [
    householdId, title, description, category_id, template_id,
    assigned_to, req.user.memberId, priority, due_date, estimated_duration,
    points_reward, requires_photos, location, recurring_pattern
  ]);

  const task = taskResult.rows[0];

  // Create notification for assigned member
  if (assigned_to && assigned_to !== req.user.memberId) {
    await query(`
      INSERT INTO notifications (household_id, recipient_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      householdId,
      assigned_to,
      'task_assigned',
      'Nouvelle tâche assignée',
      `Une nouvelle tâche "${title}" vous a été assignée.`,
      JSON.stringify({ task_id: task.id, task_title: title })
    ]);
  }

  res.status(201).json({
    message: 'Task created successfully',
    task
  });
}));

// @route   PUT /api/tasks/:householdId/:taskId
// @desc    Update task
// @access  Private (owners, co_managers, or assigned member for status updates)
router.put('/:householdId/:taskId', [requireHouseholdMember, taskValidation], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input',
      details: errors.array()
    });
  }

  const { householdId, taskId } = req.params;
  const updates = req.body;

  // Get current task
  const currentTaskResult = await query(
    'SELECT * FROM tasks WHERE id = $1 AND household_id = $2',
    [taskId, householdId]
  );

  if (currentTaskResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found'
    });
  }

  const currentTask = currentTaskResult.rows[0];

  // Check permissions
  const canEditAll = ['owner', 'co_manager'].includes(req.user.role);
  const isAssigned = currentTask.assigned_to === req.user.memberId;
  const statusOnlyUpdate = Object.keys(updates).length === 1 && 'status' in updates;

  if (!canEditAll && !(isAssigned && statusOnlyUpdate)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You can only update the status of tasks assigned to you'
    });
  }

  // If member is completing task, check if photos are required
  if (updates.status === 'completed' && currentTask.requires_photos) {
    const photosResult = await query(
      'SELECT COUNT(*) as count FROM task_photos WHERE task_id = $1 AND type = $2',
      [taskId, 'after']
    );

    if (parseInt(photosResult.rows[0].count) === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'This task requires completion photos before it can be marked as completed'
      });
    }
  }

  // Build update query
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

  // Add completed_at timestamp if status is completed
  if (updates.status === 'completed') {
    paramCount++;
    updateFields.push(`completed_at = $${paramCount}`);
    updateValues.push(new Date());
  }

  // Add updated_at
  paramCount++;
  updateFields.push(`updated_at = $${paramCount}`);
  updateValues.push(new Date());

  // Add WHERE conditions
  updateValues.push(taskId, householdId);

  const taskResult = await query(`
    UPDATE tasks 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount + 1} AND household_id = $${paramCount + 2}
    RETURNING *
  `, updateValues);

  const updatedTask = taskResult.rows[0];

  // Award points if task completed
  if (updates.status === 'completed' && currentTask.status !== 'completed' && currentTask.assigned_to) {
    await query(`
      UPDATE member_points 
      SET total_points = total_points + $1,
          monthly_points = monthly_points + $1,
          updated_at = NOW()
      WHERE household_id = $2 AND member_id = $3
    `, [currentTask.points_reward || 0, householdId, currentTask.assigned_to]);
  }

  res.json({
    message: 'Task updated successfully',
    task: updatedTask
  });
}));

// @route   DELETE /api/tasks/:householdId/:taskId
// @desc    Delete task
// @access  Private (owners and co_managers only)
router.delete('/:householdId/:taskId', [requireHouseholdMember, authorize('owner', 'co_manager')], asyncHandler(async (req, res) => {
  const { householdId, taskId } = req.params;

  const result = await query(
    'DELETE FROM tasks WHERE id = $1 AND household_id = $2 RETURNING id',
    [taskId, householdId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found'
    });
  }

  res.json({
    message: 'Task deleted successfully'
  });
}));

// @route   GET /api/tasks/:householdId/categories
// @desc    Get task categories for household
// @access  Private (household members)
router.get('/:householdId/categories', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const categoriesResult = await query(
    'SELECT * FROM task_categories WHERE household_id = $1 ORDER BY name',
    [householdId]
  );

  res.json({
    categories: categoriesResult.rows
  });
}));

// @route   GET /api/tasks/:householdId/templates
// @desc    Get task templates for household
// @access  Private (household members)
router.get('/:householdId/templates', requireHouseholdMember, asyncHandler(async (req, res) => {
  const { householdId } = req.params;

  const templatesResult = await query(`
    SELECT tt.*, tc.name as category_name, tc.color as category_color
    FROM task_templates tt
    LEFT JOIN task_categories tc ON tt.category_id = tc.id
    WHERE tt.household_id = $1 OR tt.is_public = true
    ORDER BY tt.name
  `, [householdId]);

  res.json({
    templates: templatesResult.rows
  });
}));

// @route   GET /api/tasks/:householdId/statistics
// @desc    Get task statistics for household
// @access  Private (owners and co_managers)
router.get('/:householdId/statistics', [requireHouseholdMember, authorize('owner', 'co_manager')], asyncHandler(async (req, res) => {
  const { householdId } = req.params;
  const { period = '7d' } = req.query;

  let dateFilter = '';
  if (period === '7d') {
    dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
  } else if (period === '30d') {
    dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
  } else if (period === '90d') {
    dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
  }

  // Task status statistics
  const statusStatsResult = await query(`
    SELECT status, COUNT(*) as count
    FROM tasks 
    WHERE household_id = $1 ${dateFilter}
    GROUP BY status
  `, [householdId]);

  // Tasks by member
  const memberStatsResult = await query(`
    SELECT hm.name, COUNT(t.id) as task_count, 
           AVG(t.actual_duration) as avg_duration,
           SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_count
    FROM household_members hm
    LEFT JOIN tasks t ON hm.id = t.assigned_to ${dateFilter.replace('created_at', 't.created_at')}
    WHERE hm.household_id = $1 AND hm.status = 'active'
    GROUP BY hm.id, hm.name
    ORDER BY completed_count DESC
  `, [householdId]);

  // Tasks by category
  const categoryStatsResult = await query(`
    SELECT tc.name, tc.color, COUNT(t.id) as task_count
    FROM task_categories tc
    LEFT JOIN tasks t ON tc.id = t.category_id ${dateFilter.replace('created_at', 't.created_at')}
    WHERE tc.household_id = $1
    GROUP BY tc.id, tc.name, tc.color
    ORDER BY task_count DESC
  `, [householdId]);

  res.json({
    period,
    status_stats: statusStatsResult.rows,
    member_stats: memberStatsResult.rows,
    category_stats: categoryStatsResult.rows
  });
}));

module.exports = router;