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

module.exports = router;

