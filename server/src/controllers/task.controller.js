const Task = require('../models/Task');
const { processUploadedFiles, deleteAttachmentFile } = require('../utils/storage');

// Helper to calculate the next date for recurring tasks
const calculateNextDate = (baseDate, recurrence) => {
  if (!baseDate) return null;
  const d = new Date(baseDate);
  if (isNaN(d.getTime())) return null;

  if (recurrence === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (recurrence === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (recurrence === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
};

// Helper to spawn the next iteration of a recurring task on completion
const handleRecurrenceOnComplete = async (task, user) => {
  if (!task.recurrence || task.recurrence === 'none') {
    return null;
  }

  const nextDueDate = calculateNextDate(task.dueDate || new Date(), task.recurrence);
  const nextStartDate = task.startDate ? calculateNextDate(task.startDate, task.recurrence) : null;

  const resetSubtasks = (task.subtasks || []).map((s) => ({
    title: s.title,
    completed: false,
  }));

  const nextTask = await Task.create({
    user: user._id,
    title: task.title,
    description: task.description,
    status: 'pending',
    priority: task.priority,
    startDate: nextStartDate,
    dueDate: nextDueDate,
    progress: 0,
    recurrence: task.recurrence,
    subtasks: resetSubtasks,
    order: 0,
    attachments: [],
  });

  return nextTask;
};

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
    const {
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      order,
      progress,
      subtasks,
      recurrence,
    } = req.body;

    const taskStatus = status || 'pending';

    // Parse subtasks safely
    let parsedSubtasks = [];
    if (typeof subtasks === 'string') {
      try {
        const parsed = JSON.parse(subtasks);
        if (Array.isArray(parsed)) parsedSubtasks = parsed;
      } catch {
        parsedSubtasks = [];
      }
    } else if (Array.isArray(subtasks)) {
      parsedSubtasks = subtasks;
    }

    const cleanSubtasks = parsedSubtasks
      .filter((s) => s && (typeof s.title === 'string' || typeof s === 'string'))
      .map((s) => ({
        title: typeof s === 'string' ? s.trim() : s.title.trim(),
        completed: Boolean(s.completed),
      }))
      .filter((s) => s.title.length > 0);

    // Calculate progress
    let taskProgress = Number(progress);
    if (isNaN(taskProgress) || taskProgress < 0 || taskProgress > 100) {
      if (cleanSubtasks.length > 0) {
        const completedCount = cleanSubtasks.filter((s) => s.completed).length;
        taskProgress = Math.round((completedCount / cleanSubtasks.length) * 100);
      } else {
        taskProgress = taskStatus === 'completed' ? 100 : (taskStatus === 'in-progress' ? 50 : 0);
      }
    }

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
      startDate: startDate && String(startDate).trim() !== '' ? new Date(startDate) : null,
      dueDate: dueDate && String(dueDate).trim() !== '' ? new Date(dueDate) : null,
      order: taskOrder,
      progress: taskProgress,
      recurrence: recurrence || 'none',
      subtasks: cleanSubtasks,
      attachments,
    });

    let nextTask = null;
    if (task.status === 'completed') {
      nextTask = await handleRecurrenceOnComplete(task, req.user);
    }

    res.status(201).json({
      success: true,
      task,
      nextTask,
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

    const {
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      order,
      progress,
      subtasks,
      recurrence,
    } = req.body;

    const oldStatus = task.status;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (startDate !== undefined) {
      task.startDate = startDate && String(startDate).trim() !== '' ? new Date(startDate) : null;
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate && String(dueDate).trim() !== '' ? new Date(dueDate) : null;
    }
    if (order !== undefined) task.order = Number(order);

    if (subtasks !== undefined) {
      let parsedSubtasks = [];
      if (typeof subtasks === 'string') {
        try {
          const parsed = JSON.parse(subtasks);
          if (Array.isArray(parsed)) parsedSubtasks = parsed;
        } catch {
          parsedSubtasks = [];
        }
      } else if (Array.isArray(subtasks)) {
        parsedSubtasks = subtasks;
      }

      task.subtasks = parsedSubtasks
        .filter((s) => s && (typeof s.title === 'string' || typeof s === 'string'))
        .map((s) => {
          const item = {
            title: typeof s === 'string' ? s.trim() : s.title.trim(),
            completed: Boolean(s.completed),
          };
          if (s._id || s.id) item._id = s._id || s.id;
          return item;
        })
        .filter((s) => s.title.length > 0);
    }

    if (progress !== undefined && !isNaN(Number(progress))) {
      task.progress = Math.min(100, Math.max(0, Number(progress)));
    } else if (subtasks !== undefined && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
    }

    // Process new attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = await processUploadedFiles(req.files, req);
      task.attachments.push(...newAttachments);
    }

    await task.save();

    let nextTask = null;
    if (task.status === 'completed' && oldStatus !== 'completed') {
      nextTask = await handleRecurrenceOnComplete(task, req.user);
    }

    res.status(200).json({
      success: true,
      task,
      nextTask,
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

    const oldStatus = task.status;
    task.status = status;
    const targetOrder = Number(order);

    if (status === 'completed' && task.progress < 100) {
      task.progress = 100;
    } else if (status === 'pending' && task.progress === 100) {
      task.progress = 0;
    }

    // Reorder siblings in the destination column
    if (!isNaN(targetOrder)) {
      task.order = targetOrder;
      await task.save();

      // Fetch all sibling tasks in this column excluding the current one
      const siblings = await Task.find({
        user: req.user._id,
        status,
        _id: { $ne: task._id },
      }).sort({ order: 1, createdAt: -1 });

      // Insert task at targetOrder position
      siblings.splice(Math.min(targetOrder, siblings.length), 0, task);

      // Re-index all tasks in the column sequentially: 0, 1, 2, ...
      const bulkOps = siblings.map((t, idx) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { $set: { order: idx } },
        },
      }));

      if (bulkOps.length > 0) {
        await Task.bulkWrite(bulkOps);
      }
    } else {
      await task.save();
    }

    let nextTask = null;
    if (status === 'completed' && oldStatus !== 'completed') {
      nextTask = await handleRecurrenceOnComplete(task, req.user);
    }

    res.status(200).json({
      success: true,
      task,
      nextTask,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder tasks in column via array of task IDs
// @route   PATCH /api/tasks/reorder
// @access  Private
const reorderTasks = async (req, res, next) => {
  try {
    const { status, taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'taskIds array is required' });
    }

    const bulkOps = taskIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: req.user._id },
        update: { $set: { order: index, ...(status ? { status } : {}) } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
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

// @desc    Toggle single subtask completion
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId/toggle
// @access  Private
const toggleSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;

    // Recalculate progress based on subtasks
    if (task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
      if (completedCount === task.subtasks.length && task.status !== 'completed') {
        task.status = 'completed';
      } else if (completedCount < task.subtasks.length && task.status === 'completed') {
        task.status = 'in-progress';
      }
    }

    await task.save();

    let nextTask = null;
    if (task.status === 'completed' && oldStatus !== 'completed') {
      nextTask = await handleRecurrenceOnComplete(task, req.user);
    }

    res.status(200).json({
      success: true,
      task,
      nextTask,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add single subtask
// @route   POST /api/tasks/:id/subtasks
// @access  Private
const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Subtask title is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.subtasks.push({
      title: title.trim(),
      completed: false,
    });

    if (task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
    }

    await task.save();

    res.status(201).json({
      success: true,
      task,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single subtask
// @route   DELETE /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const deleteSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.subtasks.pull({ _id: req.params.subtaskId });

    if (task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
    } else {
      task.progress = task.status === 'completed' ? 100 : (task.status === 'in-progress' ? 50 : 0);
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

// @desc    Bulk update status for multiple tasks
// @route   PATCH /api/tasks/bulk/status
// @access  Private
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'taskIds array is required and cannot be empty' });
    }

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const updateFields = { status };
    if (status === 'completed') {
      updateFields.progress = 100;
    } else if (status === 'pending') {
      updateFields.progress = 0;
    }

    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        user: req.user._id,
      },
      {
        $set: updateFields,
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated status for ${result.modifiedCount} tasks`,
      modifiedCount: result.modifiedCount,
      status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk delete multiple tasks and their attachments
// @route   DELETE /api/tasks/bulk
// @access  Private
const bulkDeleteTasks = async (req, res, next) => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'taskIds array is required and cannot be empty' });
    }

    // Find all matching tasks first to clean up attachments
    const tasksToDelete = await Task.find({
      _id: { $in: taskIds },
      user: req.user._id,
    });

    if (tasksToDelete.length === 0) {
      return res.status(404).json({ message: 'No tasks found matching provided IDs' });
    }

    for (const task of tasksToDelete) {
      if (task.attachments && task.attachments.length > 0) {
        for (const attachment of task.attachments) {
          try {
            await deleteAttachmentFile(attachment);
          } catch (fileErr) {
            console.error(`Failed to delete attachment ${attachment.filename}:`, fileErr);
          }
        }
      }
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} tasks`,
      deletedCount: result.deletedCount,
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
  toggleSubtask,
  addSubtask,
  deleteSubtask,
  bulkUpdateStatus,
  bulkDeleteTasks,
  reorderTasks,
};

