import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { Module } from '../src/api/models/module.mysql.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/vars';
import { UserTable } from '../src/api/models/user.mysql.model';
import { ModuleTable } from '../src/api/models/module.mysql.model';
import { ProblemTable } from '../src/api/models/problem.mysql.model';
import { createSamplePayloadMySql, addOrEditField } from '../mocks/problems';

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

    const result: boolean = await new Promise((resolve) => {
      bcrypt.compare(pass, hashedPassword, async function (_err, result) {
        try {
          return resolve(result);
        } catch {
          return false;
        }
      });
    });

    if (result) {
      //User creation for token

      await UserTable.create({
        name: 'Test TA',
        username: 'testTA@gmail.com',
        password: hashedPassword,
        role: 'TA',
        salt: 10
      });
    } else {
      throw { message: 'Hash method not working properly' };
    }

    const module = await ModuleTable.create(
      {
        name: 'Stacks/Lists/Queues',
        number: 1,
        problems: []
      },
      {
        include: [
          {
            association: ModuleTable.Problems,
            as: 'problems',
            include: [
              {
                association: ProblemTable.TestCases,
                as: 'testCases'
              },
              {
                association: ProblemTable.Codes,
                as: 'code'
              }
            ]
          }
        ]
      }
    );

    moduleId = module.id;
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // Saved id for the module
  let moduleId = 1;

  it('creates a problem and gets a 200 response', async () => {
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });

  it('creates a problem with some empty fields and gets a 200 response', async () => {
    const sampleProblem = createSamplePayloadMySql(moduleId);
    sampleProblem.code.header = '';
    sampleProblem.code.body = '';
    sampleProblem.code.footer = '';
    sampleProblem.testCases[0].hint = '';
    sampleProblem.testCases[0].expectedOutput = '';
    sampleProblem.buildCommand = '';
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(200);
  });

  it('attempts to create a problem with no visible test cases', async () => {
    const invalidTestCases = [
      {
        input: '123',
        expectedOutput: '12345',
        hint: 'n/a',
        visibility: 1
      }
    ];
    const sampleProblem = addOrEditField(
      createSamplePayloadMySql(moduleId),
      'testCases',
      invalidTestCases
    );
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(400);
  });

  it('attempts to create a problem with an invalid moduleId', async () => {
    const sampleProblem = createSamplePayloadMySql(-1);
    const result = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(result.statusCode).toEqual(400);
  });

  it('attempts to create a problem with a nonexistent moduleId', async () => {
    const sampleProblem = createSamplePayloadMySql(10101010101010101010101);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const result: request.Response = await request(expressApp)
      .post('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });

  it('checks GET /admin/problem gives 401 response on unauthorized requests', async () => {
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const result: request.Response = await request(expressApp)
      .get('/v1/admin/problem')
      .send(sampleProblem);
    expect(result.statusCode).toEqual(401);
  });

  it('tests GET /admin/problem and GET /student/problem', async () => {
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const sampleHiddenProblem = createSamplePayloadMySql(moduleId);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const sampleHiddenProblem = createSamplePayloadMySql(moduleId);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const sampleHiddenProblem = createSamplePayloadMySql(moduleId);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const sampleHiddenProblem = createSamplePayloadMySql(moduleId);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const postResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(postResult.statusCode).toEqual(200);

    const modifiedSampleProblem = createSamplePayloadMySql(moduleId);
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
    const sampleProblem = createSamplePayloadMySql(moduleId);
    const postResult = await request(expressApp)
      .post('/v1/admin/problem')
      .set('Authorization', 'bearer ' + token)
      .send(sampleProblem);
    expect(postResult.statusCode).toEqual(200);

    // Ensure module has one problem
    const moduleAfterProblemAddedResult = await request(expressApp)
      .get('/v1/module/WithProblems')
      .set('Authorization', 'bearer ' + token);
    let module: Module = moduleAfterProblemAddedResult.body[0] as Module;
    expect(module.problems.length).toEqual(1);

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

    // Check that module.problems length is now 0
    const moduleAfterProblemDeletedResult = await request(expressApp)
      .get('/v1/module/WithProblems')
      .set('Authorization', 'bearer ' + token);
    module = moduleAfterProblemDeletedResult.body[0] as Module;
    expect(module.problems.length).toEqual(0);
  });
});
