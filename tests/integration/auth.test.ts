import request from 'supertest';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5000';

describe('Auth Integration Tests (E2E)', () => {
  // Generate a random email suffix to prevent collision on duplicate test runs
  const randomSuffix = Math.random().toString(36).substring(7);
  const mockUserData = {
    name: 'Integration Test User',
    email: `test-${randomSuffix}@example.com`,
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully through the gateway and return 201', async () => {
      const res = await request(GATEWAY_URL)
        .post('/api/auth/register')
        .send(mockUserData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data.user).toHaveProperty('email', mockUserData.email);
      expect(res.body.data.user).toHaveProperty('name', mockUserData.name);
      expect(res.body.data.user).toHaveProperty('role', 'customer');
    });

    it('should fail with 422 through the gateway if email is invalid', async () => {
      const res = await request(GATEWAY_URL)
        .post('/api/auth/register')
        .send({
          name: 'Invalid User',
          email: 'not-a-valid-email',
          password: 'Password123!',
        })
        .expect('Content-Type', /json/)
        .expect(422);

      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.errors).toHaveProperty('email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user successfully through the gateway and return tokens', async () => {
      const res = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: mockUserData.email,
          password: mockUserData.password,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('email', mockUserData.email);
    });

    it('should fail with 401 through the gateway for incorrect password', async () => {
      const res = await request(GATEWAY_URL)
        .post('/api/auth/login')
        .send({
          email: mockUserData.email,
          password: 'WrongPassword!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Invalid');
    });
  });
});
