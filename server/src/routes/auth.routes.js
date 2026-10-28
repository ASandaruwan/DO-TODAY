const express = require('express');
const { body } = require('express-validator');
const {
  signup,
  login,
  getMe,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Validation chains
const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 80 })
    .withMessage('Full name cannot exceed 80 characters'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain alphanumeric characters, underscores, dots, and hyphens'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('securityQuestion')
    .trim()
    .notEmpty()
    .withMessage('Security question is required'),
  body('securityAnswer')
    .trim()
    .notEmpty()
    .withMessage('Security answer is required'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const resetValidation = [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

// Routes
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);
router.get('/me', protect, getMe);

// Forgot password flow
router.post('/forgot/question', getSecurityQuestion);
router.post('/forgot/verify', verifySecurityAnswer);
router.post('/forgot/reset', validate(resetValidation), resetPassword);

module.exports = router;

