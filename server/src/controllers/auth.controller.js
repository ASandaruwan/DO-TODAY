const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback-secret-for-development-32chars',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { fullName, username, password, securityQuestion, securityAnswer } = req.body;

    const normalizedUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password & normalized security answer
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedSecurityAnswer = await bcrypt.hash(
      securityAnswer.trim().toLowerCase(),
      salt
    );

    const user = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      password: hashedPassword,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: hashedSecurityAnswer,
      theme: 'light',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      username: req.user.username,
      theme: req.user.theme,
    },
  });
};

// @desc    Get security question by username
// @route   POST /api/auth/forgot/question
// @access  Public
const getSecurityQuestion = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      securityQuestion: user.securityQuestion,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify answer to security question & receive resetToken
// @route   POST /api/auth/forgot/verify
// @access  Public
const verifySecurityAnswer = async (req, res, next) => {
  try {
    const { username, securityAnswer } = req.body;
    if (!username || !securityAnswer) {
      return res.status(400).json({ message: 'Username and security answer are required' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername }).select('+securityAnswer');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(
      securityAnswer.trim().toLowerCase(),
      user.securityAnswer
    );

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    // Issue short-lived 10m token for reset
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'reset' },
      process.env.JWT_SECRET || 'fallback-secret-for-development-32chars',
      { expiresIn: '10m' }
    );

    res.status(200).json({
      resetToken,
      message: 'Security answer verified. You may now reset your password.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using resetToken
// @route   POST /api/auth/forgot/reset
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET || 'fallback-secret-for-development-32chars'
      );
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword,
};

