import app from '../src/config/express';
import * as request from 'supertest';

describe('GET /v1/health', () => {
  beforeAll((done: jest.DoneCallback) => {
    done();
  });

  afterAll((done: jest.DoneCallback) => {
    done();
  });
  it('checks health route gives 200 response', async () => {
    const result: request.Response = await request(app).get('/v1/health');
    expect(result.statusCode).toEqual(200);
  });
});
