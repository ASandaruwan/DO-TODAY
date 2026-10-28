const express = require('express');
const { body } = require('express-validator');
const {
  updateProfile,
  updatePassword,
  exportUserData,
  deleteAccount,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.patch(
  '/me',
  validate([
    body('fullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Full name cannot be empty')
      .isLength({ max: 80 })
      .withMessage('Full name cannot exceed 80 characters'),
    body('theme')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('Theme must be either light or dark'),
  ]),
  updateProfile
);

router.patch(
  '/me/password',
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ]),
  updatePassword
);

router.get('/me/export', exportUserData);
router.delete('/me', deleteAccount);

module.exports = router;

