import app from '../src/config/express';
import * as request from 'supertest';

describe('GET /v1/health', () => {
  it('checks health route gives 200 response', async () => {
    const result: request.Response = await request(app).get('/v1/health');
    expect(result.statusCode).toEqual(200);
  });
});
