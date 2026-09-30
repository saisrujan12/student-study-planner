const mongoose = require('mongoose');
const StudyTask = require('../models/StudyTask');

/**
 * Validate that a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/tasks
 * Create a new study task
 */
const createTask = async (req, res, next) => {
  try {
    const { title, subject, description, priority, dueDate, estimatedMinutes } = req.body;

    const task = await StudyTask.create({
      title,
      subject,
      description,
      priority,
      dueDate,
      estimatedMinutes,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks
 * List tasks with optional filters and sorting
 * Query params: priority, subject, completed, sort
 */
const getTasks = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by priority
    if (req.query.priority) {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (validPriorities.includes(req.query.priority)) {
        filter.priority = req.query.priority;
      }
    }

    // Filter by subject (case-insensitive)
    if (req.query.subject) {
      filter.subject = new RegExp(`^${req.query.subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    // Filter by completed
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }

    // Determine sort order
    let sort = { dueDate: 1 }; // default: nearest deadline first
    if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'priority') {
      // High > Medium > Low
      sort = { priority: -1, dueDate: 1 };
    } else if (req.query.sort === 'deadline') {
      sort = { dueDate: 1 };
    }

    const tasks = await StudyTask.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
const getTask = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }

    const task = await StudyTask.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Update a task
 */
const updateTask = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }

    // Prevent direct manipulation of completedAt through update
    const updateData = { ...req.body };
    delete updateData.completedAt;

    const task = await StudyTask.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // If completed is being set to false, clear completedAt
    if (updateData.completed === false) {
      updateData.completedAt = null;
    }

    const updatedTask = await StudyTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id/complete
 * Toggle task completion
 */
const completeTask = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }

    const task = await StudyTask.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Toggle completion
    if (task.completed) {
      // Reopen task
      task.completed = false;
      task.completedAt = null;
    } else {
      // Mark complete
      task.completed = true;
      task.completedAt = new Date();
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }

    const task = await StudyTask.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await StudyTask.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  completeTask,
  deleteTask,
};
