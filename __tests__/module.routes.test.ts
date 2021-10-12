import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';

import { createSampleModule } from '../mocks/module';
describe('GET /', () => {
  beforeEach(async () => {
    await UserModel.create({
      username: 'dhruv2000patel@gmail.com',
      password: 'password'
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
        .post('/v1/user/login')
        .send({
          username: 'dhruv2000patel@gmail.com',
          password: 'password'
        })
        .expect(200)
        .end(onResponse);

      function onResponse(_err, res) {
        token = res.body.token;
        return done();
      }
    };
  }

  // POST Routes for Module
  it('creates a module', async () => {
    const sampleModule = createSampleModule();
    const result = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    expect(result.statusCode).toEqual(200);
  });

  it('checks /module route gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(400);
  });

  it('checks /module route gives 401 response on no authorization token', async () => {
    const sampleModule = createSampleModule();
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .send(sampleModule);
    expect(result.statusCode).toEqual(401);
  });
});
