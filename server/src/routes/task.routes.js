const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Apply auth protect to all task routes
router.use(protect);

router.get('/', getTasks);
router.get('/stats', getStats);

router.post(
  '/',
  upload.array('attachments', 5),
  validate([
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 150 })
      .withMessage('Title cannot exceed 150 characters'),
  ]),
  createTask
);

// Bulk operations (must precede /:id)
router.patch('/bulk/status', bulkUpdateStatus);
router.delete('/bulk', bulkDeleteTasks);
router.patch('/reorder', reorderTasks);

router.get('/:id', getTaskById);

router.put(
  '/:id',
  upload.array('attachments', 5),
  validate([
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 150 })
      .withMessage('Title cannot exceed 150 characters'),
  ]),
  updateTask
);

router.patch('/:id/status', updateTaskStatus);

router.delete('/:id', deleteTask);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

// Subtask management routes
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);
router.post(
  '/:id/subtasks',
  validate([
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Subtask title is required')
      .isLength({ max: 200 })
      .withMessage('Subtask title cannot exceed 200 characters'),
  ]),
  addSubtask
);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

module.exports = router;

