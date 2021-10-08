import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
import { Module } from '../src/api/models/module.model';
import { createSamplePayload } from '../mocks/problems';

describe('GET /', () => {
  beforeEach(async () => {
    await UserModel.create({
      username: 'dhruv2000patel@gmail.com',
      password: 'password'
    });

    const module = await Module.create({
      name: 'Stacks/Lists/Queues',
      number: 1,
      problems: []
    });

    moduleId = module._id;
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // Auth token for the routes
  let token = '';
  // Saved id for the module
  let moduleId = '';
  // This grabs the authentication token for each test
  beforeEach(grabToken());

  function grabToken() {
    return function (done: () => any) {
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
  it('creates a problem and gets a 200 response', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });
  it('checks POST /admin/problem gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(400);
  });
  it('checks POST /admin/problem gives 401 response on unauthorized requests', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });
  it('checks GET /admin/problem gives 401 response on unauthorized requests', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const result: request.Response = await request(expressApp)
      .get('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });
  it('tests GET /admin/problem and GET /student/problem', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const sampleHiddenProblem = createSamplePayload(moduleId);
    sampleHiddenProblem.hidden = true;

    // Add problems to the database
    const postResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(postResult.statusCode).toEqual(200);

    const postHiddenResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleHiddenProblem);
    expect(postHiddenResult.statusCode).toEqual(200);

    // Get all problems from db
    const getStudentResult = await request(expressApp).get(
      '/v1/student/problem'
    );
    expect(getStudentResult.statusCode).toEqual(200);
    expect(getStudentResult.body).toHaveLength(1);

    const getAdminResult = await request(expressApp)
      .get('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token);
    expect(getAdminResult.statusCode).toEqual(200);
    expect(getAdminResult.body).toHaveLength(2);

    // Get problems by id from /v1/student/problem
    const getNonexistentStudentProblemById = await request(expressApp).get(
      '/v1/student/problem/010101010101010121212121'
    );
    expect(getNonexistentStudentProblemById.statusCode).toEqual(404);

    const getMalformedStudentProblemById = await request(expressApp).get(
      '/v1/student/problem/01010101010beef'
    );
    expect(getMalformedStudentProblemById.statusCode).toEqual(400);

    const getHiddenStudentProblemById = await request(expressApp).get(
      `/v1/student/problem/${postHiddenResult.body._id}`
    );
    expect(getHiddenStudentProblemById.statusCode).toEqual(404);

    const getStudentProblemById = await request(expressApp).get(
      `/v1/student/problem/${postResult.body._id}`
    );
    expect(getStudentProblemById.statusCode).toEqual(200);
  });
  it('checks GET /student/problem/findByModule/moduleId', async () => {
    // Add two unhidden problems and one hidden problem to DB
    const sampleProblem = createSamplePayload(moduleId);
    const sampleHiddenProblem = createSamplePayload(moduleId);
    sampleHiddenProblem.hidden = true;

    // Send unhidden problem twice
    let result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);

    result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);

    // Send hidden problem
    result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleHiddenProblem);
    expect(result.statusCode).toEqual(200);

    // Ensure 200 status code and two (unhidden) problems
    result = await request(expressApp).get(
      `/v1/student/problem/findByModule/${moduleId}`
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body.length).toEqual(2);

    // Well-formed objectId that doesn't map to a module => 404
    result = await request(expressApp).get(
      '/v1/student/problem/findByModule/010101010101010101010101'
    );
    expect(result.statusCode).toEqual(404);

    // Malformed objectId => 400
    result = await request(expressApp).get(
      '/v1/student/problem/findByModule/notAValidObjectId'
    );
    expect(result.statusCode).toEqual(400);
  });
  it('checks GET /admin/problem/findByModule/moduleId', async () => {
    // Add two unhidden problems and one hidden problem to DB
    const sampleProblem = createSamplePayload(moduleId);
    const sampleHiddenProblem = createSamplePayload(moduleId);
    sampleHiddenProblem.hidden = true;

    // Send unhidden problem twice
    let result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);

    result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);

    // Send hidden problem
    result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleHiddenProblem);
    expect(result.statusCode).toEqual(200);

    // Ensure 401 status code if not authenticated
    result = await request(expressApp).get(
      `/v1/admin/problem/findByModule/${moduleId}`
    );
    expect(result.statusCode).toEqual(401);

    // Ensure 200 status code and three problems
    result = await request(expressApp)
      .get(`/v1/admin/problem/findByModule/${moduleId}`)
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(200);
    expect(result.body.length).toEqual(3);

    // Well-formed objectId that doesn't map to a module => 404
    result = await request(expressApp)
      .get('/v1/admin/problem/findByModule/010101010101010101010101')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(404);

    // Malformed objectId => 400
    result = await request(expressApp)
      .get('/v1/admin/problem/findByModule/notAValidObjectId')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(400);
  });
});
