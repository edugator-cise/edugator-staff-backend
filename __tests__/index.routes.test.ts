import app from '../src/config/express';
import * as request from 'supertest';

describe('GET /', () => {
  beforeAll((done: jest.DoneCallback) => {
    done();
  });

  afterAll((done: jest.DoneCallback) => {
    done();
  });
  it('checks / route gives 200 response', async () => {
    const result: request.Response = await request(app).get('/');
    expect(result.statusCode).toEqual(200);
  });
});
