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
  assert.ok(createRes.body.task._id, 'Task should have _id');
  assert.ok(createRes.body.task.id, 'Task should have id');
  assert.equal(String(createRes.body.task._id), String(createRes.body.task.id));
  const taskId = createRes.body.task._id;

  // 1.5. Update task via PUT (status, title, priority, progress)
  const putRes = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Design wireframes',
      status: 'pending',
      priority: 'high',
    });
  assert.equal(putRes.status, 200);
  assert.equal(putRes.body.task.title, 'Design wireframes');
  assert.ok(putRes.body.task._id);
  assert.ok(putRes.body.task.id);

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

  // 14. Attachment flow: create with upload, view attachment URL via static GET, and remove attachment
  const dummyBuffer = Buffer.from('fake image content');
  const uploadRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .field('title', 'Task with Attachment')
    .field('status', 'pending')
    .field('priority', 'medium')
    .attach('attachments', dummyBuffer, 'screenshot.png');

  assert.equal(uploadRes.status, 201);
  assert.equal(uploadRes.body.task.title, 'Task with Attachment');
  assert.ok(uploadRes.body.task._id);
  assert.ok(uploadRes.body.task.id);
  assert.equal(uploadRes.body.task.attachments.length, 1);
  const attachment = uploadRes.body.task.attachments[0];
  assert.equal(attachment.filename, 'screenshot.png');
  assert.ok(attachment.url.startsWith('/uploads/'));
  assert.ok(attachment._id);

  // Verify attachment static serving
  const fileGetRes = await request(app).get(attachment.url);
  assert.equal(fileGetRes.status, 200);

  // Update task status and priority after creation
  const updateRes = await request(app)
    .put(`/api/tasks/${uploadRes.body.task._id}`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Task with Attachment (In Progress)',
      status: 'in-progress',
      priority: 'high',
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.task.status, 'in-progress');
  assert.equal(updateRes.body.task.priority, 'high');

  // Remove attachment
  const removeAttRes = await request(app)
    .delete(`/api/tasks/${uploadRes.body.task._id}/attachments/${attachment._id}`)
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(removeAttRes.status, 200);
  assert.equal(removeAttRes.body.task.attachments.length, 0);

  // Subtasks management: create with subtasks, toggle, add, delete
  const subtaskTaskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Task with subtasks',
      status: 'pending',
      subtasks: [
        { title: 'Subtask 1', completed: false },
        { title: 'Subtask 2', completed: true },
      ],
    });
  assert.equal(subtaskTaskRes.status, 201);
  assert.equal(subtaskTaskRes.body.task.subtasks.length, 2);
  assert.equal(subtaskTaskRes.body.task.progress, 50);

  const subtaskId = subtaskTaskRes.body.task.subtasks[0]._id;

  // Toggle subtask 1 to completed
  const toggleRes = await request(app)
    .patch(`/api/tasks/${subtaskTaskRes.body.task._id}/subtasks/${subtaskId}/toggle`)
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(toggleRes.status, 200);
  assert.equal(toggleRes.body.task.subtasks[0].completed, true);
  assert.equal(toggleRes.body.task.progress, 100);

  // Add a 3rd subtask
  const addSubRes = await request(app)
    .post(`/api/tasks/${subtaskTaskRes.body.task._id}/subtasks`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Subtask 3' });
  assert.equal(addSubRes.status, 201);
  assert.equal(addSubRes.body.task.subtasks.length, 3);
  assert.equal(addSubRes.body.task.progress, 67);

  // Delete subtask 3
  const newSubId = addSubRes.body.task.subtasks[2]._id;
  const delSubRes = await request(app)
    .delete(`/api/tasks/${subtaskTaskRes.body.task._id}/subtasks/${newSubId}`)
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(delSubRes.status, 200);
  assert.equal(delSubRes.body.task.subtasks.length, 2);

  // Clean up subtask test task
  await request(app)
    .delete(`/api/tasks/${subtaskTaskRes.body.task._id}`)
    .set('Authorization', `Bearer ${userAToken}`);

  // Clean up task
  await request(app)
    .delete(`/api/tasks/${uploadRes.body.task._id}`)
    .set('Authorization', `Bearer ${userAToken}`);

  // Test Bulk Operations (PATCH /api/tasks/bulk/status and DELETE /api/tasks/bulk)
  const taskB1 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Bulk Task 1', status: 'pending' });
  const taskB2 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Bulk Task 2', status: 'pending' });

  assert.equal(taskB1.status, 201);
  assert.equal(taskB2.status, 201);

  const bulkIds = [taskB1.body.task._id, taskB2.body.task._id];

  // Bulk update status to 'completed'
  const bulkUpdateRes = await request(app)
    .patch('/api/tasks/bulk/status')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ taskIds: bulkIds, status: 'completed' });

  assert.equal(bulkUpdateRes.status, 200);
  assert.equal(bulkUpdateRes.body.modifiedCount, 2);

  // Bulk delete both tasks
  const bulkDelRes = await request(app)
    .delete('/api/tasks/bulk')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ taskIds: bulkIds });

  assert.equal(bulkDelRes.status, 200);
  assert.equal(bulkDelRes.body.deletedCount, 2);

  // Verify deletion
  const verifyDel1 = await request(app)
    .get(`/api/tasks/${bulkIds[0]}`)
    .set('Authorization', `Bearer ${userAToken}`);
  assert.equal(verifyDel1.status, 404);

  // Test In-Column Reordering & Sibling Sequential Order Indexing
  const rTask1 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Reorder 1', status: 'pending', order: 0 });
  const rTask2 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Reorder 2', status: 'pending', order: 1 });
  const rTask3 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ title: 'Reorder 3', status: 'pending', order: 2 });

  assert.equal(rTask1.status, 201);
  assert.equal(rTask2.status, 201);
  assert.equal(rTask3.status, 201);

  // Move task 3 to index 0 within pending
  const moveReorderRes = await request(app)
    .patch(`/api/tasks/${rTask3.body.task._id}/status`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ status: 'pending', order: 0 });
  assert.equal(moveReorderRes.status, 200);

  // Dedicated array reorder endpoint test
  const arrayReorderRes = await request(app)
    .patch('/api/tasks/reorder')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      status: 'pending',
      taskIds: [rTask2.body.task._id, rTask1.body.task._id, rTask3.body.task._id],
    });
  assert.equal(arrayReorderRes.status, 200);

  // Clean up reorder tasks
  await request(app)
    .delete('/api/tasks/bulk')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ taskIds: [rTask1.body.task._id, rTask2.body.task._id, rTask3.body.task._id] });

  // Test Recurring Task: daily recurrence spawning new task on completion
  const recTaskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({
      title: 'Daily Standup Note',
      status: 'pending',
      recurrence: 'daily',
      dueDate: '2026-10-01T10:00:00.000Z',
      subtasks: [{ title: 'Write bullet points', completed: true }],
    });

  assert.equal(recTaskRes.status, 201);
  assert.equal(recTaskRes.body.task.recurrence, 'daily');
  const originalRecTaskId = recTaskRes.body.task._id;

  // Complete the recurring task
  const completeRecRes = await request(app)
    .patch(`/api/tasks/${originalRecTaskId}/status`)
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ status: 'completed' });

  assert.equal(completeRecRes.status, 200);
  assert.equal(completeRecRes.body.task.status, 'completed');
  assert.ok(completeRecRes.body.nextTask, 'Must spawn nextTask');
  assert.equal(completeRecRes.body.nextTask.title, 'Daily Standup Note');
  assert.equal(completeRecRes.body.nextTask.status, 'pending');
  assert.equal(completeRecRes.body.nextTask.progress, 0);
  assert.equal(completeRecRes.body.nextTask.recurrence, 'daily');
  assert.equal(completeRecRes.body.nextTask.subtasks[0].completed, false);

  // Check that the next due date is +1 day
  const originalDate = new Date('2026-10-01T10:00:00.000Z');
  const nextDueDate = new Date(completeRecRes.body.nextTask.dueDate);
  assert.equal(nextDueDate.getDate(), originalDate.getDate() + 1);

  // Clean up recurring tasks
  await request(app)
    .delete('/api/tasks/bulk')
    .set('Authorization', `Bearer ${userAToken}`)
    .send({ taskIds: [originalRecTaskId, completeRecRes.body.nextTask._id] });
});

