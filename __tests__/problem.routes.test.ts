import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { createSampleProblem } from '../mocks/problems';
describe('GET /', () => {
  beforeEach((done: jest.DoneCallback) => {
    done();
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });
  it('checks /admin/problem route gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp).post(
      '/v1/admin/problem'
    );
    expect(result.statusCode).toEqual(400);
  });
  /*
  it('checks /admin/problem route gives 401 response on unauthorized requests', async () => {
    const sampleProblem = createSampleProblem();
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });
  it('creates a problem', async () => {
    const sampleProblem = createSampleProblem();
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });
  */
});
