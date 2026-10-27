const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User } = require('../src/modules/users/user.model');

describe('Auth API — Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('GET /health returns 200 with status ok', async () => {
    // Arrange & Act
    const res = await request(app).get('/health');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
  });

  test('POST /api/v1/auth/register creates a new citizen and returns 201 with token', async () => {
    // Arrange
    const registrationData = {
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      password: 'securePassword123'
    };

    // Act
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registrationData);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      role: 'CITIZEN'
    });
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  test('POST /api/v1/auth/register rejects duplicate email with 409 Conflict', async () => {
    // Arrange: Seed an existing user
    await request(app).post('/api/v1/auth/register').send({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123'
    });

    // Act: Attempt to register with the same email
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'password123'
    });

    // Assert
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  test('POST /api/v1/auth/login authenticates registered citizen and returns 200 with token', async () => {
    // Arrange: Register user first
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Tester',
      email: 'tester@example.com',
      password: 'correctPassword123'
    });

    // Act
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'tester@example.com',
      password: 'correctPassword123'
    });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('tester@example.com');
  });

  test('POST /api/v1/auth/login rejects wrong password with 401 Unauthorized', async () => {
    // Arrange
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Tester',
      email: 'tester@example.com',
      password: 'correctPassword123'
    });

    // Act
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'tester@example.com',
      password: 'wrongPassword123'
    });

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('GET /api/v1/auth/me returns current user profile when authenticated', async () => {
    // Arrange
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Profile Tester',
      email: 'profile@example.com',
      password: 'password123'
    });
    const token = registerRes.body.data.token;

    // Act
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('profile@example.com');
  });

  test('GET /api/v1/auth/me rejects unauthenticated request with 401', async () => {
    // Act
    const res = await request(app).get('/api/v1/auth/me');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
