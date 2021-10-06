import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
import { Module, ModuleDocument } from '../src/api/models/module.model';
import { Problem, ProblemDocument } from '../src/api/models/problem.model';
import { createSampleModule } from '../mocks/module';
import { createSampleProblem } from '../mocks/problems';

describe('GET /', () => {
  let module1: ModuleDocument;
  let module2: ModuleDocument;
  let module3: ModuleDocument;
  let problem1: ProblemDocument;
  let problem2: ProblemDocument;

  beforeEach(async () => {
    await UserModel.create({
      username: 'dhruv2000patel@gmail.com',
      password: 'password'
    });

    problem1 = await Problem.create(createSampleProblem());
    problem2 = await Problem.create(createSampleProblem());

    module1 = await Module.create({
      name: 'Trees',
      number: 3.1,
    });
    module1.problems.push(problem1.id);
    module1.problems.push(problem2.id);
    await module1.save();

    module2 = await Module.create(createSampleModule());

    module3 = await Module.create({
      name: 'Heaps',
      number: 2.1
    });
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // Auth token for the routes
  let token = '';
  // let uniqueID = '';
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

  // POST Routes for Module ------------------------------------------------
  it('creates a module', async () => {
    const sampleModule = createSampleModule();
    const result = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send(sampleModule);
    //   console.log(result);
    expect(result.statusCode).toEqual(200);
  });

  it('checks /module route gives 400 response on empty body', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send();
    //   console.log(result);
    expect(result.statusCode).toEqual(400);
  });

  it('checks /module route gives 401 response on no authorization token', async () => {
    const sampleModule = createSampleModule();
    const result: request.Response = await request(expressApp)
      .post('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .send(sampleModule);
    //   console.log(result);
    expect(result.statusCode).toEqual(401);
  });

  //GET Routes for Module --------------------------------------------------------
  it('checks /module route returns status 200 for getModules', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module')
      //Sets the token that has been called to get assigned before the test
      .send();
    //   console.log(result);
    for(let i = 0; i < result.body.length; i++){
      expect(result.body[i].problems).toBeUndefined();
    }
    expect(result.statusCode).toEqual(200);
  });

  //400 error test

  it('checks /module/moduleId route returns status 200 for getModuleByID', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/' + module2.id)
      //Sets the token that has been called to get assigned before the test
      .send();
    expect(result.body._id).toEqual(module2.id);
    expect(result.body.name).toEqual(module2.name);
    expect(result.body.problems).toBeUndefined();
    expect(result.statusCode).toEqual(200);
  });
  //400 error test

  it('checks /module/WithProblems route returns status 200 for getModulesWithProblems', async () => {
    const result: request.Response = await request(expressApp)
      .get('/v1/module/WithProblems')
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send();
    // console.log(result.body);
    // result.body[0].problems[0].dueDate = new Date(
      //   result.body[0].problems[0].dueDate
      //   );
      // console.log(problem.toJSON());
      // console.log(result.body[0].problems[0]);
      expect(result.body[0].name).toEqual(module1.name);
      expect(result.body[1].name).toEqual(module2.name);
      expect(result.body[2].name).toEqual(module3.name);
      expect(result.body[0].number).toEqual(module1.number);
      expect(result.body[1].number).toEqual(module2.number);
      expect(result.body[2].number).toEqual(module3.number);

      for(let i = 0; i < result.body.length; i++){
        expect(result.body[i].problems).toBeDefined();
        expect(result.body[i].problems).toBeTruthy();
      }
    expect(result.statusCode).toEqual(200);
  });
  //400 error test

  // PUT Routes for Modules ------------------------------------------------------------
  it('checks /module/moduleId route returns status 200 for updateModule', async () => {
    let nameUpdate = "Stacks UPDATE";
    let numberUpdate = 10.2;
    const result: request.Response = await request(expressApp)
      .put('/v1/module/' + module2.id)
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send({
        name: nameUpdate,
        number: numberUpdate
      });
      // console.log(result.body);
    expect(result.body._id).toEqual(module2.id);
    expect(result.body.name).toEqual(nameUpdate);
    expect(result.body.number).toEqual(numberUpdate);
    expect(result.body.problems).toBeUndefined();
    expect(result.statusCode).toEqual(200);
  });

  //400 error test

  // DELETE Routes for Modules ------------------------------------------------------------
  it('checks /module/moduleId route returns status 200 for deleteModule', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/module/' + module1.id)
      //Sets the token that has been called to get assigned before the test
      .set('Authorization', 'bearer ' + token)
      .send()
      for(let i = 0; i < module1.problems.length; i++){
        let uniqueProblem = await Problem.findOne({
          _id: module1.problems[i]
        })
        expect(uniqueProblem).toBeNull();
      }
    expect(result.statusCode).toEqual(200);
  });



  //400 error test
});
