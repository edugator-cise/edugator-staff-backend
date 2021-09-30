import { expressApp } from '../src/config/express';
import * as request from 'supertest';
describe('GET /v1/health', () => {
  afterAll((done: jest.DoneCallback) => {
    done();
  });
  it('checks health route gives 200 response', async () => {
    const result: request.Response = await request(expressApp).get(
      '/v1/health'
    );
    expect(result.statusCode).toEqual(200);
  });
});
