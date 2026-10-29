const Task = require('../models/Task');
const { processUploadedFiles, deleteAttachmentFile } = require('../utils/storage');

// @desc    Get all tasks for logged-in user with filters
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { q, status, priority, from, to, date, sort } = req.query;

    const filter = { user: req.user._id };

    // Search query (title + description)
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter
    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      filter.status = status;
    }

    // Priority filter
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    // Date range filters (from / to on dueDate)
    if (from || to) {
      filter.dueDate = {};
      if (from) {
        filter.dueDate.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = toDate;
      }
    }

    // Single Date filter (Today's Tasks & Calendar active tasks)
    // Matches if:
    // (startDate <= endOfDay && dueDate >= startOfDay)
    // OR (dueDate between startOfDay and endOfDay)
    // OR (startDate between startOfDay and endOfDay)
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      const dateMatchConditions = [
        // Spanning range: starts before/on today and ends on/after today
        {
          startDate: { $lte: endOfDay },
          dueDate: { $gte: startOfDay },
        },
        // Due on date
        {
          dueDate: { $gte: startOfDay, $lte: endOfDay },
        },
        // Starts on date
        {
          startDate: { $gte: startOfDay, $lte: endOfDay },
        },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: dateMatchConditions }];
        delete filter.$or;
      } else {
        filter.$or = dateMatchConditions;
      }
    }

    // Sorting
    let sortQuery = { order: 1, createdAt: -1 };
    if (sort) {
      if (sort === 'dueDateAsc') sortQuery = { dueDate: 1, createdAt: -1 };
      else if (sort === 'dueDateDesc') sortQuery = { dueDate: -1, createdAt: -1 };
      else if (sort === 'priorityDesc') sortQuery = { priority: -1, createdAt: -1 };
      else if (sort === 'priorityAsc') sortQuery = { priority: 1, createdAt: -1 };
      else if (sort === 'titleAsc') sortQuery = { title: 1 };
    }

    const tasks = await Task.find(filter).sort(sortQuery);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task statistics for Home page cards
// @route   GET /api/tasks/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [activeCount, pendingInProgressCount, completedCount] = await Promise.all([
      // Active = all tasks not completed
      Task.countDocuments({ user: userId, status: { $ne: 'completed' } }),
      // Pending or In Progress
      Task.countDocuments({ user: userId, status: { $in: ['pending', 'in-progress'] } }),
      // Completed
      Task.countDocuments({ user: userId, status: 'completed' }),
    ]);

    res.status(200).json({
      active: activeCount,
      pendingInProgress: pendingInProgressCount,
      completed: completedCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, startDate, dueDate, order } = req.body;

    const taskStatus = status || 'pending';

    // Calculate order if not provided
    let taskOrder = Number(order);
    if (isNaN(taskOrder)) {
      const highestOrderTask = await Task.findOne({
        user: req.user._id,
        status: taskStatus,
      }).sort({ order: -1 });
      taskOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;
    }

    // Process uploaded attachments
    const attachments = await processUploadedFiles(req.files, req);

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: taskStatus,
      priority: priority || 'medium',
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: taskOrder,
      attachments,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, startDate, dueDate, order } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) task.order = Number(order);

    // Process new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = await processUploadedFiles(req.files, req);
      task.attachments.push(...newAttachments);
    }

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task status & order (for Drag & Drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;

    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (order !== undefined && !isNaN(Number(order))) {
      task.order = Number(order);
    }

    await task.save();

    res.status(200).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Clean up attachments
    if (task.attachments && task.attachments.length > 0) {
      for (const att of task.attachments) {
        await deleteAttachmentFile(att);
      }
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    await deleteAttachmentFile(attachment);
    task.attachments.pull(req.params.attachmentId);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
      task,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getStats,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  deleteAttachment,
};

