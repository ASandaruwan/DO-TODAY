const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const { deleteAttachmentFile } = require('../utils/storage');

// @desc    Update user profile (fullName, theme)
// @route   PATCH /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) {
      user.fullName = fullName.trim();
    }

    if (theme && ['light', 'dark'].includes(theme)) {
      user.theme = theme;
    }

    await user.save();

    res.status(200).json({
      success: true,
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

// @desc    Change user password
// @route   PATCH /api/users/me/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export user data as JSON backup
// @route   GET /api/users/me/export
// @access  Private
const exportUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      app: 'DO-TODAY',
      version: '1.0.0',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        theme: user.theme,
        createdAt: user.createdAt,
      },
      tasksCount: tasks.length,
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        startDate: t.startDate,
        dueDate: t.dueDate,
        order: t.order,
        attachments: t.attachments.map((att) => ({
          filename: att.filename,
          url: att.url,
          mimeType: att.mimeType,
          size: att.size,
        })),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `do-today-backup-${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    next(err);
  }
};

// @desc    Delete account + all user tasks and attachments
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user tasks to clean up their attachments
    const tasks = await Task.find({ user: userId });
    for (const task of tasks) {
      if (task.attachments && task.attachments.length > 0) {
        for (const att of task.attachments) {
          await deleteAttachmentFile(att);
        }
      }
    }

    // Delete tasks and user
    await Task.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account and associated tasks deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  exportUserData,
  deleteAccount,
};
