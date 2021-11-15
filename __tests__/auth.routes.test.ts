import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel, IUser } from '../src/api/models/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/vars';

describe('GET /user/*', () => {
  let user: IUser;
  let superUser: IUser;

  // Auth token for the routes
  const professorToken = jwt.sign(
    { username: 'testProfessor@gmail.com', role: 'Professor' },
    jwtSecret
  );

  const taToken = jwt.sign(
    { username: 'testTA@gmail.com', role: 'TA' },
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
        //Add into collection, if the password hashed properly
        if (result) {
          user = await UserModel.create({
            name: 'Test TA',
            username: 'testTA@gmail.com',
            password: hashedPassword,
            role: 'TA'
          });

          superUser = await UserModel.create({
            name: 'Test Professor',
            username: 'testProfessor@gmail.com',
            password: hashedPassword,
            role: 'Professor'
          });

          await user.save();
          await superUser.save();
        } else {
          throw { message: 'Hash method not working properly' };
        }
      } catch (err) {
        return err;
      }
    });
  });
  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // CREATE USER TESTS ----------------------------------------------------------
  // 200 SUCCESS TEST
  it('checks /user/create POST route and creates a user correctly', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA1@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(200);
  });

  // 403 FAIL TEST
  it('checks /user/create POST route FAILS with TA Token', async () => {
    //Creates user in the DB with TA token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + taToken)
      .send({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'You do not have permission to make this request'
      })
    );
  });

  // 400 FAIL TEST
  it('checks /user/create POST route FAILS on empty body', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({});
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'This route requires a body to be passed in'
      })
    );
  });

  // 400 FAIL TEST
  it('checks /user/create POST route FAILS on invalid data types passed in', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA1om',
        role: 'TA',
        password: 'password'
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'username must be a valid email'
      })
    );

    const result1: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 2,
        username: 'testTA1@gmail.com',
        role: 'TA',
        password: 'password'
      });
    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'name must be a string'
      })
    );

    const result2: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 2,
        role: 'TA',
        password: 'password'
      });
    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({
        message: 'username must be a string'
      })
    );

    const result3: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA1@gmail.com',
        role: 12,
        password: 'password'
      });
    expect(result3.statusCode).toEqual(400);
    expect(result3.text).toEqual(
      JSON.stringify({
        message: 'role must be one of [Professor, TA]'
      })
    );

    const result4: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA1@gmail.com',
        role: 'TA',
        password: 2
      });
    expect(result4.statusCode).toEqual(400);
    expect(result4.text).toEqual(
      JSON.stringify({
        message: 'password must be a string'
      })
    );

    const result5: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA1@gmail.com',
        role: 'student',
        password: 'password'
      });
    expect(result5.statusCode).toEqual(400);
    expect(result5.text).toEqual(
      JSON.stringify({
        message: 'role must be one of [Professor, TA]'
      })
    );
  });

  // 400 FAIL TEST
  it('checks /user/create POST route FAILS on invalid body (NO username or password or role in body)', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        username: 'testTA1@gmail.com',
        role: 'TA',
        password: 'password'
      });
    expect(result.statusCode).toEqual(400);
    // console.log(result.text);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'name is required'
      })
    );

    const result1: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA 1',
        role: 'TA',
        password: 'password'
      });
    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'username is required'
      })
    );

    const result2: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
        password: 'password'
      });
    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({
        message: 'role is required'
      })
    );

    const result3: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
        role: 'TA'
      });
    expect(result3.statusCode).toEqual(400);
    expect(result3.text).toEqual(
      JSON.stringify({
        message: 'password is required'
      })
    );
  });

  // LOGIN TESTS ---------------------------------------------------------------------------
  // 401 FAIL TEST
  it('checks /user/login route gives 401 response on empty username and pass', async () => {
    const result: request.Response = await request(expressApp).post(
      '/v1/user/login'
    );
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // 401 FAIL TEST
  it('checks /user/login route and gives 401 on wrong username or pass', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/login')
      .send({ username: 'test@gm.com', password: 'password' });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // 200 SUCCESS TEST
  it('logs in /user/login route and gives 200 response ', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/login')
      .send({ username: 'testTA@gmail.com', password: 'password' });
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('token');
  });
});
