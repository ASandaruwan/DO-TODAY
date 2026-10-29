const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '1d';

let mongod;
let app;
let userAToken;
let userBToken;
let userAId;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = require('../src/app');

  // Register User A
  const resA = await request(app).post('/api/auth/signup').send({
    fullName: 'User Alpha',
    username: 'useralpha',
    password: 'password123',
    securityQuestion: 'City?',
    securityAnswer: 'Colombo',
  });
  userAToken = resA.body.token;
  userAId = resA.body.user.id;

  // Register User B
  const resB = await request(app).post('/api/auth/signup').send({
    fullName: 'User Beta',
    username: 'userbeta',
    password: 'password123',
    securityQuestion: 'Pet?',
    securityAnswer: 'Dog',
  });
  userBToken = resB.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('Task API: CRUD, stats, filters, isolation & export', async () => {
  // 1. Create a task for User A
  const createRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Design wireframes',
      description: 'Create initial Figma mockups for client review',
      status: 'pending',
      priority: 'high',
      startDate: '2026-09-14',
      dueDate: '2026-09-16',
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.task.title, 'Design wireframes');
  assert.equal(createRes.body.task.priority, 'high');
  const taskId = createRes.body.task.id;

  // 2. Create another task (in-progress) for User A
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Implement Auth API',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2026-09-15',
    });

  // 3. Create completed task for User A
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Scaffold repository',
      status: 'completed',
      priority: 'low',
      dueDate: '2026-09-14',
    });

  // 4. Check Stats: active=2, pendingInProgress=2, completed=1
  const statsRes = await request(app)
    .get('/api/tasks/stats')
    .set('Authorization', `Bearer ${userAToken}`);

  assert.equal(statsRes.status, 200);
  assert.equal(statsRes.body.active, 2);
  assert.equal(statsRes.body.pendingInProgress, 2);
  assert.equal(statsRes.body.completed, 1);

  // 5. User Isolation: User B cannot access User A's task
  const userBFetchRes = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userBToken}`);
  assert.equal(userBFetchRes.status, 404);

  // 6. User Isolation: User B sees 0 tasks in their list
  const userBTasksRes = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${userBToken}`);
  assert.equal(userBTasksRes.body.count, 0);

  // 7. Update status via PATCH (drag and drop)
  const patchRes = await request(app)
    .patch(`/api/tasks/${taskId}/status`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      status: 'in-progress',
      order: 1,
    });
  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.task.status, 'in-progress');
  assert.equal(patchRes.body.task.order, 1);

  // 8. Filter by status
  const filterStatusRes = await request(app)
    .get('/api/tasks?status=in-progress')
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(filterStatusRes.body.count, 2);

  // 9. Search filter
  const searchRes = await request(app)
    .get('/api/tasks?q=wireframes')
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(searchRes.body.count, 1);
  assert.equal(searchRes.body.tasks[0].title, 'Design wireframes');

  // 10. Date filter for 2026-09-14 (should match task 1 and task 3)
  const dateRes = await request(app)
    .get('/api/tasks?date=2026-09-14')
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(dateRes.body.count >= 2, true);

  // 11. User Profile update (theme to dark)
  const profileRes = await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ theme: 'dark', fullName: 'User Alpha Updated' });
  assert.equal(profileRes.status, 200);
  assert.equal(profileRes.body.user.theme, 'dark');
  assert.equal(profileRes.body.user.fullName, 'User Alpha Updated');

  // 12. Export user data (JSON backup)
  const exportRes = await request(app)
    .get('/api/users/me/export')
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(exportRes.status, 200);
  assert.ok(exportRes.header['content-disposition'].includes('attachment; filename='));
  assert.equal(exportRes.body.app, 'DO-TODAY');
  assert.equal(exportRes.body.user.username, 'useralpha');
  assert.equal(exportRes.body.user.password, undefined);
  assert.equal(exportRes.body.user.securityAnswer, undefined);
  assert.equal(exportRes.body.tasksCount, 3);

  // 13. Delete task
  const delRes = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(delRes.status, 200);
});

