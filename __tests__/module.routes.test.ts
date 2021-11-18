import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
import { Module, ModuleDocument } from '../src/api/models/module.model';
import { Problem, ProblemDocument } from '../src/api/models/problem.model';
import { createSampleModule } from '../mocks/module';
import { createSampleProblem } from '../mocks/problems';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/vars';

describe('GET /', () => {
  let module1: ModuleDocument;
  let module2: ModuleDocument;
  let module3: ModuleDocument;
  let problem1: ProblemDocument;
  let problem2: ProblemDocument;

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
    // Problem creation for routes
    problem1 = await Problem.create(createSampleProblem());
    problem2 = await Problem.create(createSampleProblem());

    //Module with Problems array popualated correctly
    module1 = await Module.create({
      name: 'Trees',
      number: 3.1
    });
    module1.problems.push(problem1.id);
    module1.problems.push(problem2.id);
    await module1.save();

    //Sample module creation
    module2 = await Module.create(createSampleModule());

    module3 = await Module.create({
      name: 'Heaps',
      number: 7.1
    });
    //Put in the incorrect wrong id into the problems array
    module3.problems.push(module3.id);
    await module3.save();
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // Auth token for the routes

  // POST Routes for Module ------------------------------------------------
  // postModule
  // 200 SUCCESS Test
  it('checks /module POST route PASSES on valid route call', async () => {
    const sampleModule = createSampleModule();
    const result = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    expect(result.statusCode).toEqual(200);
  });

  // postModule
  // 401 Error Test
  it('checks /module POST route FAILS on no authorization token', async () => {
    const sampleModule = createSampleModule();
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .send(sampleModule);
    expect(result.statusCode).toEqual(401);
  });

  // postModule
  //400 Error Test
  it('checks /module POST route FAILS on invalid number', async () => {
    // Invalid Number (Greater than 100)
    const sampleModule = createSampleModule();
    sampleModule.number = 123;
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'number must be less than or equal to 100'
      })
    );

    // Invalid Number (Less than 1)
    sampleModule.number = -2;
    const result1: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'number must be greater than or equal to 1'
      })
    );
  });

  // postModule
  //400 Error Test
  it('checks /module POST route FAILS on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a body to be passed in' })
    );
  });

  // postModule
  // 400 Error Test
  it('checks /module POST route FAILS on name or number not passed in', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send({
        number: 2
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'name is required' })
    );

    const result2: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send({
        name: 'Test Module'
      });
    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({ message: 'number is required' })
    );
  });

  //GET Routes for Module --------------------------------------------------------
  // getModules
  // 200 SUCCESS TEST
  it('checks /module GET route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module')
      .send();
    for (let i = 0; i < result.body.length; i++) {
      expect(result.body[i].problems).toBeUndefined();
    }
    expect(result.statusCode).toEqual(200);
  });

  // getModuleById ------------------------------------------------------------------
  // 200 SUCCESS Test
  it('checks /module/moduleId GET route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + module2.id)
      .send();
    expect(result.body._id).toEqual(module2.id);
    expect(result.body.name).toEqual(module2.name);
    expect(result.body.problems).toBeUndefined();
    expect(result.statusCode).toEqual(200);
  });

  // getModuleById
  // 400 error test
  it('checks /module/moduleId GET route FAILS on Invalid Object/Module ID', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + 'dhruv')
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a valid module ID' })
    );
  });

  // getModuleById
  //400 error test
  it('checks /module/moduleId GET route FAILS on ID NOT in database', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + '615a931f4cd3749f5a675f61')
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'Module not found in database' })
    );
  });

  // getModulesWithNonHiddenProblemsAndTestCases ----------------------------------------------
  // 200 SUCCESS TEST
  it('checks /module/WithNonHiddenProblems GET route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/WithNonHiddenProblems')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(200);
  });

  // getModulesWithProblems -----------------------------------------------------------------------------
  // 200 SUCCESS Test
  it('checks /module/WithProblems GET route SUCCEEDS on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/WithProblems')
      .set('Authorization', 'bearer ' + token)
      .send();

    expect(result.body[0].name).toEqual(module1.name);
    expect(result.body[1].name).toEqual(module2.name);
    expect(result.body[2].name).toEqual(module3.name);
    expect(result.body[0].number).toEqual(module1.number);
    expect(result.body[1].number).toEqual(module2.number);
    expect(result.body[2].number).toEqual(module3.number);

    for (let i = 0; i < result.body.length; i++) {
      expect(result.body[i].problems).toBeDefined();
      expect(result.body[i].problems).toBeTruthy();
    }
    expect(result.statusCode).toEqual(200);
  });

  // getModulesWithProblems
  // 401 error test
  it('checks /module/WithProblems GET route FAILS with NO Auth Token', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/WithProblems')
      .send();
    expect(result.statusCode).toEqual(401);
  });

  //getModulesByProblemId -------------------------------------------------------------------------
  //200 success test
  it('checks /module/ByProblemId/:problemId GET route PASSES for a valid problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get(`/v1/module/ByProblemId/${problem1.id}`)
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(200);
    expect(result.body.name).toEqual(module1.name);
    expect(result.body.number).toEqual(module1.number);
  });

  // getModulesByProblemId
  // 400 malformed request test
  it('checks /module/ByProblemId/:problemId GET route FAILS on an ill-formed problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/ByProblemId/010101')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(400);
  });

  // getModulesByProblemId
  // 401 Unauthorized test
  it('checks /module/ByProblemId/:problemId GET route FAILS for an ill-formed problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get(`/v1/module/ByProblemId/${problem1.id}`)
      .send();
    expect(result.statusCode).toEqual(401);
  });

  // getModulesByProblemId
  // 404 not found test
  it('checks /module/ByProblemId/:problemId GET route FAILS for a nonexistent problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/ByProblemId/012345678901234567890123')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(404);
  });

  // PUT Routes for Modules ------------------------------------------------------------
  // putModule
  // 200 SUCCESS Test
  it('checks /module/moduleId PUT route PASSES on valid route call', async () => {
    const nameUpdate = 'Stacks UPDATE';
    const numberUpdate = 10;
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        name: nameUpdate,
        number: numberUpdate
      });
    expect(result.body._id).toEqual(module2.id);
    expect(result.body.name).toEqual(nameUpdate);
    expect(result.body.number).toEqual(numberUpdate);
    expect(result.body.problems).toBeUndefined();
    expect(result.statusCode).toEqual(200);
  });

  // putModule
  // 401 error test
  it('checks /module/moduleId PUT route FAILS with NO Auth Token', async () => {
    const nameUpdate = 'Stacks UPDATE';
    const numberUpdate = 10.2;
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .send({
        name: nameUpdate,
        number: numberUpdate
      });

    expect(result.statusCode).toEqual(401);
  });

  // putModule
  //400 error test
  it('checks /module/moduleId PUT route FAILS on Invalid Object/Module ID', async () => {
    const nameUpdate = 'Stacks UPDATE';
    const numberUpdate = 10.2;
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + 'dhruv')
      .set('Authorization', 'bearer ' + token)
      .send({
        name: nameUpdate,
        number: numberUpdate
      });

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a valid module ID' })
    );
  });

  // putModule
  //400 error test
  it('checks /module/moduleId PUT route FAILS on ID NOT in database', async () => {
    const nameUpdate = 'Stacks UPDATE';
    const numberUpdate = 10.2;
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + '615a931f4cd3749f5a675f61')
      .set('Authorization', 'bearer ' + token)
      .send({
        name: nameUpdate,
        number: numberUpdate
      });

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'Module not found in database' })
    );
  });

  // putModule
  //400 error test
  it('checks /module/moduleId PUT route FAILS on NO body passed in', async () => {
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send();

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a body to be passed in' })
    );
  });

  // putModule
  //400 error test
  it('checks /module/moduleId PUT route FAILS on empty name or INVALID name or number passed in', async () => {
    // Empty Name
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        name: '',
        number: 10.2
      });

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'name is not allowed to be empty'
      })
    );

    // Invalid Number (Less than 0)
    const result1: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        name: 'Hash Map',
        number: -2
      });

    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'number must be greater than or equal to 1'
      })
    );

    // Invalid Name and Number
    const result2: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        name: 'name',
        number: 123
      });

    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({
        message: 'number must be less than or equal to 100'
      })
    );
  });

  // putModule
  //400 error test
  it('checks /module/moduleId PUT route FAILS on NO name or number field passed in', async () => {
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        number: 10
      });

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'name is required' })
    );

    const result1: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send({
        name: 'testName'
      });

    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({ message: 'number is required' })
    );
  });

  // DELETE Routes for Modules ------------------------------------------------------------
  // deleteModule
  // 200 SUCCESS Test
  it('checks /module/moduleId DELETE route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + module1.id)
      .set('Authorization', 'bearer ' + token)
      .send();
    for (let i = 0; i < module1.problems.length; i++) {
      const uniqueProblem = await Problem.findOne({
        _id: module1.problems[i]
      });
      expect(uniqueProblem).toBeNull();
    }
    expect(result.statusCode).toEqual(200);
  });

  // deleteModule
  //401 Error Test
  it('checks /module/moduleId DELETE route FAILS on NO AUTH Token', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + module1.id)
      .send();

    expect(result.statusCode).toEqual(401);
  });

  // deleteModule
  //400 Error Test
  it('checks /module/moduleId DELETE route FAILS for Module ID NOT in database', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + '615a931f4cd3749f5a675f61')
      .set('Authorization', 'bearer ' + token)
      .send();

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'Module with given id is not found in database'
      })
    );
  });

  // deleteModule
  //400 Error Test
  it('checks /module/moduleId DELETE route FAILS for Problem ID NOT in database', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + module3.id)
      .set('Authorization', 'bearer ' + token)
      .send();

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'Problem with given id is not found in database'
      })
    );
  });
});
