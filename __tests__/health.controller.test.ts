import app from '../src/index';
import * as request from 'supertest';

describe('GET /v1/health', () => {
  it('health api request', async () => {
    const result: request.Response = await request(app).get('/v1/health');
    expect(result.statusCode).toEqual(200);
  });
});
