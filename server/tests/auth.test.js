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

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = require('../src/app');
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('GET /api/health should return status ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('Auth flow: signup -> login -> me -> forgot password', async () => {
  // 1. Signup
  const signupRes = await request(app)
    .post('/api/auth/signup')
    .send({
      fullName: 'Test User',
      username: 'testuser',
      password: 'password123',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'Blue',
    });

  assert.equal(signupRes.status, 201);
  assert.ok(signupRes.body.token);
  assert.equal(signupRes.body.user.username, 'testuser');
  assert.equal(signupRes.body.user.fullName, 'Test User');
  assert.equal(signupRes.body.user.theme, 'light');
  assert.equal(signupRes.body.user.password, undefined);
  assert.equal(signupRes.body.user.securityAnswer, undefined);

  const token = signupRes.body.token;

  // 2. Duplicate signup should fail
  const dupRes = await request(app)
    .post('/api/auth/signup')
    .send({
      fullName: 'Test User 2',
      username: 'testuser',
      password: 'password123',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'Red',
    });
  assert.equal(dupRes.status, 400);

  // 3. Login with correct credentials
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'testuser',
      password: 'password123',
    });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  // 4. Login with incorrect password
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'testuser',
      password: 'wrongpassword',
    });
  assert.equal(badLoginRes.status, 401);

  // 5. Get current user with token
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.user.username, 'testuser');

  // 6. Get current user without token
  const noTokenRes = await request(app).get('/api/auth/me');
  assert.equal(noTokenRes.status, 401);

  // 7. Forgot password question
  const questionRes = await request(app)
    .post('/api/auth/forgot/question')
    .send({ username: 'testuser' });
  assert.equal(questionRes.status, 200);
  assert.equal(questionRes.body.securityQuestion, 'What is your favorite color?');

  // 8. Forgot password verify (case-insensitive & trimmed)
  const verifyRes = await request(app)
    .post('/api/auth/forgot/verify')
    .send({
      username: 'testuser',
      securityAnswer: '  blue  ',
    });
  assert.equal(verifyRes.status, 200);
  assert.ok(verifyRes.body.resetToken);

  const resetToken = verifyRes.body.resetToken;

  // 9. Forgot password reset
  const resetRes = await request(app)
    .post('/api/auth/forgot/reset')
    .send({
      resetToken,
      newPassword: 'newpassword123',
    });
  assert.equal(resetRes.status, 200);

  // 10. Login with new password
  const newLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'testuser',
      password: 'newpassword123',
    });
  assert.equal(newLoginRes.status, 200);
  assert.ok(newLoginRes.body.token);
});

