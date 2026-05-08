const request = require('supertest');
const app = require('../src/index');

jest.mock('../src/db', () => ({
  query: jest.fn()
}));

const db = require('../src/db');

describe('API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('POST /api/auth/register returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.hu' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/auth/login returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.hu' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/events returns 500 when DB fails', async () => {
    db.query.mockRejectedValueOnce(new Error('DB connection failed'));

    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/registrations returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/registrations')
      .send({ event_id: 1 });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/admin/events returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/events');
    expect(res.statusCode).toBe(401);
  });
});
