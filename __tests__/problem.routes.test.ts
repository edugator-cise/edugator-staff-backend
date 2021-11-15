import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
import { Module } from '../src/api/models/module.model';
import { createSamplePayload } from '../mocks/problems';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/vars';

describe('GET /', () => {
  const token = jwt.sign(
    { username: 'dhruv2000patel@gmail.com', role: 'TA' },
    jwtSecret
  );
  beforeEach(async () => {
    const pass = 'password';

    const hashedPassword: string = await new Promise((resolve) => {
      bcrypt.hash(pass, 10, function (_err, hash) {
        resolve(hash);
      });
    });

    bcrypt.compare(pass, hashedPassword, async function (_err, result) {
      try {
        if (result) {
          //User creation for token
          await UserModel.create({
            name: 'Test TA',
            username: 'dhruv2000patel@gmail.com',
            password: hashedPassword,
            role: 'TA'
          });
        } else {
          throw { message: 'Hash method not working properly' };
        }
      } catch (err) {
        return err;
      }
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

  // Saved id for the module
  let moduleId = '';

  it('creates a problem and gets a 200 response', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });

  it('attempts to create a problem with an invalid moduleId', async () => {
    const sampleProblem = createSamplePayload('invalidModuleId');
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(400);
  });

  it('attempts to create a problem with a nonexistent moduleId', async () => {
    const sampleProblem = createSamplePayload('010101010101010101010101');
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(404);
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
  });

  it('GETs /admin/problem/{problemId} and /student/problem/{problemId}', async () => {
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

    // Get problems by id from /v1/student/problem
    let getNonexistentStudentProblemById = await request(expressApp).get(
      '/v1/student/problem/010101010101010121212121'
    );
    expect(getNonexistentStudentProblemById.statusCode).toEqual(404);

    let getMalformedStudentProblemById = await request(expressApp).get(
      '/v1/student/problem/01010101010beef'
    );
    expect(getMalformedStudentProblemById.statusCode).toEqual(400);

    let getHiddenStudentProblemById = await request(expressApp).get(
      `/v1/student/problem/${postHiddenResult.body._id}`
    );
    expect(getHiddenStudentProblemById.statusCode).toEqual(404);

    let getStudentProblemById = await request(expressApp).get(
      `/v1/student/problem/${postResult.body._id}`
    );
    expect(getStudentProblemById.statusCode).toEqual(200);

    // Get problems by id from /v1/admin/problem
    const getStudentProblemByIdWithoutAuth = await request(expressApp).get(
      `/v1/admin/problem/${postResult.body._id}`
    );
    expect(getStudentProblemByIdWithoutAuth.statusCode).toEqual(401);

    getNonexistentStudentProblemById = await request(expressApp)
      .get('/v1/admin/problem/010101010101010121212121')
      .set('Authorization', 'bearer ' + token);
    expect(getNonexistentStudentProblemById.statusCode).toEqual(404);

    getMalformedStudentProblemById = await request(expressApp)
      .get('/v1/admin/problem/01010101010beef')
      .set('Authorization', 'bearer ' + token);
    expect(getMalformedStudentProblemById.statusCode).toEqual(400);

    getHiddenStudentProblemById = await request(expressApp)
      .get(`/v1/admin/problem/${postHiddenResult.body._id}`)
      .set('Authorization', 'bearer ' + token);
    expect(getHiddenStudentProblemById.statusCode).toEqual(200);

    getStudentProblemById = await request(expressApp)
      .get(`/v1/admin/problem/${postResult.body._id}`)
      .set('Authorization', 'bearer ' + token);
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

  it('creates a problem then updates the problem', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const postResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(postResult.statusCode).toEqual(200);

    const modifiedSampleProblem = createSamplePayload(moduleId);
    modifiedSampleProblem.title = 'Updated title!';

    const updateResult = await request(expressApp)
      .put(`/v1/admin/problem/${postResult.body._id}`)
      .set('Authorization', 'bearer ' + token)
      .send(modifiedSampleProblem);
    expect(updateResult.statusCode).toEqual(200);

    const getUpdatedResult = await request(expressApp)
      .get(`/v1/admin/problem/${postResult.body._id}`)
      .set('Authorization', 'bearer ' + token);
    expect(getUpdatedResult.statusCode).toEqual(200);
    expect(getUpdatedResult.body.title).toEqual('Updated title!');
  });

  it('creates a problem then DELETEs the problem', async () => {
    const sampleProblem = createSamplePayload(moduleId);
    const postResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(postResult.statusCode).toEqual(200);

    let result = await request(expressApp)
      .get('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(200);
    expect(result.body.length).toEqual(1);

    // No auth token => 401
    result = await request(expressApp).delete(
      '/v1/admin/problem/010101010101010101010101'
    );
    expect(result.statusCode).toEqual(401);

    // Well-formed objectId that doesn't map to a module => 404
    result = await request(expressApp)
      .delete('/v1/admin/problem/010101010101010101010101')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(404);

    // Malformed objectId => 400
    result = await request(expressApp)
      .delete('/v1/admin/problem/notAValidObjectId')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(400);

    // Delete successfully
    result = await request(expressApp)
      .delete(`/v1/admin/problem/${postResult.body._id}`)
      .set('Authorization', 'bearer ' + token);
    //expect(result.body).toEqual('');
    expect(result.statusCode).toEqual(200);

    // Check that problem db is now empty
    result = await request(expressApp)
      .get('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token);
    expect(result.statusCode).toEqual(200);
    expect(result.body.length).toEqual(0);
  });
});
