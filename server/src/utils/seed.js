const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');

const seedDevData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('[Database] Empty development database detected. Seeding demo account...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const hashedSecurityAnswer = await bcrypt.hash('blue', salt);

    // Create demo user
    const demoUser = await User.create({
      fullName: 'Achira Sandaruwan',
      username: 'demo',
      password: hashedPassword,
      securityQuestion: 'What is your favorite color?',
      securityAnswer: hashedSecurityAnswer,
      theme: 'light',
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Create sample tasks
    await Task.create([
      {
        user: demoUser._id,
        title: 'Review Kanban Board & Task Drag-Drop',
        description: 'Test dragging cards between Pending, In Progress, and Completed columns.',
        status: 'in-progress',
        priority: 'high',
        startDate: todayStr,
        dueDate: todayStr,
        order: 0,
      },
      {
        user: demoUser._id,
        title: 'Customize User Profile & Avatar Preview',
        description: 'Update display name in Settings/Profile and preview changes in real-time.',
        status: 'pending',
        priority: 'medium',
        startDate: todayStr,
        dueDate: tomorrow,
        order: 0,
      },
      {
        user: demoUser._id,
        title: 'Test JSON Data Backup Export',
        description: 'Download full backup archive from Settings to verify one-click export.',
        status: 'completed',
        priority: 'low',
        startDate: todayStr,
        dueDate: todayStr,
        order: 0,
      },
    ]);

    console.log('[Database] Demo account ready:');
    console.log('            -> Username: demo (or sign up a new account)');
    console.log('            -> Password: password123');
  } catch (err) {
    console.warn('[Database] Optional dev seeding skipped:', err.message);
  }
};

module.exports = { seedDevData };
