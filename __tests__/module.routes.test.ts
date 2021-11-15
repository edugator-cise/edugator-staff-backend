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
  // 200 SUCCESS Test
  it('checks /module POST route and creates a module', async () => {
    const sampleModule = createSampleModule();
    const result = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    expect(result.statusCode).toEqual(200);
  });

  //400 Error Test
  it('checks /module POST route gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a body to be passed in' })
    );
  });

  //401 Error Test
  it('checks /module POST route gives 401 response on no authorization token', async () => {
    const sampleModule = createSampleModule();
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      .send(sampleModule);
    expect(result.statusCode).toEqual(401);
  });

  //400 Error Test
  it('checks /module POST route gives 400 response on name or numebr not passed in', async () => {
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
  it('checks /module GET route returns status 200 for getModules', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module')
      .send();
    for (let i = 0; i < result.body.length; i++) {
      expect(result.body[i].problems).toBeUndefined();
    }
    expect(result.statusCode).toEqual(200);
  });

  //getModuleByID
  // 200 SUCCESS Test
  it('checks /module/moduleId GET route returns status 200 for getModuleByID', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + module2.id)
      .send();
    expect(result.body._id).toEqual(module2.id);
    expect(result.body.name).toEqual(module2.name);
    expect(result.body.problems).toBeUndefined();
    expect(result.statusCode).toEqual(200);
  });

  //getModuleByID
  //400 error test
  it('checks /module/moduleId GET route returns status 400 for getModuleByID for Invalid Object/Module ID', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + 'dhruv')
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a valid module ID' })
    );
  });

  //getModuleByID
  //400 error test
  it('checks /module/moduleId GET route returns status 400 for getModuleByID with ID NOT in database', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + '615a931f4cd3749f5a675f61')
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'Module not found in database' })
    );
  });

  //getModulesWithProblems
  // 200 SUCCESS Test
  it('checks /module/WithProblems GET route returns status 200 for getModulesWithProblems', async () => {
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

  //getModulesWithProblems
  //401 error test
  it('checks /module/WithProblems GET route returns status 401 for getModulesWithProblems with NO Auth Token', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/WithProblems')
      .send();
    expect(result.statusCode).toEqual(401);
  });

  //getModulesByProblemId
  //200 success test
  it('checks /module/ByProblemId/:problemId GET route returns status 200 for a valid problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get(`/v1/module/ByProblemId/${problem1.id}`)
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(200);
    expect(result.body.name).toEqual(module1.name);
    expect(result.body.number).toEqual(module1.number);
  });

  //getModulesByProblemId
  //400 malformed request test
  it('checks /module/ByProblemId/:problemId GET route returns status 400 for an ill-formed problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/ByProblemId/010101')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(400);
  });

  //getModulesByProblemId
  //401 unauthorized test
  it('checks /module/ByProblemId/:problemId GET route returns status 400 for an ill-formed problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get(`/v1/module/ByProblemId/${problem1.id}`)
      .send();
    expect(result.statusCode).toEqual(401);
  });

  //getModulesByProblemId
  //404 not found test
  it('checks /module/ByProblemId/:problemId GET route returns status 404 for a nonexistent problemId', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/ByProblemId/012345678901234567890123')
      .set('Authorization', 'bearer ' + token)
      .send();
    expect(result.statusCode).toEqual(404);
  });

  // PUT Routes for Modules ------------------------------------------------------------
  // 200 SUCCESS Test
  it('checks /module/moduleId PUT route returns status 200 for updateModule', async () => {
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

  // 401 error test
  it('checks /module/moduleId PUT route returns status 401 for updateModule with NO Auth Token', async () => {
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

  //400 error test
  it('checks /module/moduleId PUT route returns status 400 for updateModule with Invalid Object/Module ID', async () => {
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

  //400 error test
  it('checks /module/moduleId PUT route returns status 400 for updateModule with ID NOT in database', async () => {
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

  //400 error test
  it('checks /module/moduleId PUT route returns status 400 for updateModule NO body passed in', async () => {
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      .set('Authorization', 'bearer ' + token)
      .send();

    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({ message: 'This route requires a body to be passed in' })
    );
  });

  // DELETE Routes for Modules ------------------------------------------------------------
  // 200 SUCCESS Test
  it('checks /module/moduleId DELETE route returns status 200 for deleteModule', async () => {
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

  //401 Error Test
  it('checks /module/moduleId DELETE route returns status 401 for NO AUTH Token', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + module1.id)
      .send();

    expect(result.statusCode).toEqual(401);
  });

  //400 Error Test
  it('checks /module/moduleId DELETE route returns status 400 for Module ID NOT in database', async () => {
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

  //400 Error Test
  it('checks /module/moduleId DELETE route returns status 400 for Problem ID NOT in database', async () => {
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
