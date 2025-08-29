import request from 'supertest';
import { app } from '../src/app';

describe('Health endpoint', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
  });
});

