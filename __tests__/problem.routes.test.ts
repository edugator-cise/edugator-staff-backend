import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
import { Module } from '../src/api/models/module.model';
import { createSampleProblem } from '../mocks/problems';

describe('GET /', () => {
  beforeEach(async () => {
    await UserModel.create({
      username: 'dhruv2000patel@gmail.com',
      password: 'password'
    });

    await Module.create({
      name: 'Stacks/Lists/Queues',
      number: 1.1,
      problems: []
    });
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // Auth token for the routes
  let token = '';
  // This grabs the authentication token for each test
  beforeEach(grabToken());

  function grabToken() {
    return function (done) {
      request(expressApp)
        .get(
          '/v1/user/login?username=dhruv2000patel@gmail.com&password=password'
        )
        .send()
        .expect(200)
        .end(onResponse);

      function onResponse(_err, res) {
        token = res.body.token;
        return done();
      }
    };
  }

  it('checks /admin/problem route gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(400);
  });
  it('checks /admin/problem route gives 401 response on unauthorized requests', async () => {
    const sampleProblem = createSampleProblem();
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });
  it('creates a problem and gets a 200 response', async () => {
    const sampleProblem = createSampleProblem();
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });
});
