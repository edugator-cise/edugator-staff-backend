import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel, IUser } from '../src/api/models/v1/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/vars';

describe('GET /user/*', () => {
  let user: IUser;
  let user1: IUser;
  let superUser: IUser;

  // Auth token for the routess
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
      user = await UserModel.create({
        name: 'Test TA',
        username: 'testTA@gmail.com',
        password: hashedPassword,
        role: 'TA'
      });

      user1 = await UserModel.create({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
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
      await user1.save();
      await superUser.save();
    } else {
      throw { message: 'Hash method not working properly' };
    }
  });
  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // GET USERS TESTS -------------------------------------------------------------
  // getUsers
  // 200 SUCCESS TEST
  it('checks /user/getUsers GET route PASSES on valid route call', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .get('/v1/user/getUsers')
      .set('Authorization', 'bearer ' + professorToken)
      .send();
    expect(result.statusCode).toEqual(200);
  });

  // getUsers
  // 403 FAIL TEST
  it('checks /user/getUsers GET route FAILS with TA Token', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .get('/v1/user/getUsers')
      .set('Authorization', 'bearer ' + taToken)
      .send();
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'You do not have permission to make this request'
      })
    );
  });

  // getUsers
  // 401 FAIL TEST
  it('checks /user/getUsers GET route FAILS on invalid token passed in', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .get('/v1/user/getUsers')
      .set('Authorization', 'bearer ' + 'invalidToken')
      .send();
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // UPDATE USER TESTS -----------------------------------------------------------
  // updateUser
  // 200 SUCCESS TEST
  it('checks /user/updateUser PUT route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 'Professor'
      });
    expect(result.statusCode).toEqual(200);
  });

  // updateUser
  // 403 FAIL TEST
  it('checks /user/updateUser PUT route FAILS with TA Token', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + taToken)
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 'Professor'
      });
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'You do not have permission to make this request'
      })
    );
  });

  // updateUser
  // 401 FAIL TEST
  it('checks /user/updateUser PUT route FAILS on invalid token passed in', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + 'invalidToken')
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 'Invalid Role'
      });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // updateUser
  // 400 FAIL TEST
  it('checks /user/updateUser PUT route FAILS on invalid types for body passed in', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 'Invalid Role'
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'role must be one of [Professor, TA]'
      })
    );

    const result1: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 12,
        username: 'testTA1@gmail.com',
        role: 'Invalid Role'
      });
    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'name must be a string'
      })
    );

    const result2: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 10,
        role: 'Invalid Role'
      });
    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({
        message: 'username must be a string'
      })
    );

    const result3: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 12
      });
    expect(result3.statusCode).toEqual(400);
    expect(result3.text).toEqual(
      JSON.stringify({
        message: 'role must be one of [Professor, TA]'
      })
    );

    const result4: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id + 'dhruv',
        name: 'testTA1',
        username: 'testTA1@gmail.com',
        role: 'TA'
      });
    expect(result4.statusCode).toEqual(400);
    expect(result4.text).toEqual('This route requires a valid user ID');
  });

  // updateUser
  // 400 FAIL TEST
  it('checks /user/updateUser PUT route FAILS on invalid body (NO id or name or username or role in body)', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        username: 'testTA1@gmail.com',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'name is required'
      })
    );

    const result1: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'Test TA 1',
        role: 'TA'
      });
    expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'username is required'
      })
    );

    const result2: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        _id: user1.id,
        name: 'Test TA 1',
        username: 'testTA1@gmail.com'
      });
    expect(result2.statusCode).toEqual(400);
    expect(result2.text).toEqual(
      JSON.stringify({
        message: 'role is required'
      })
    );

    const result3: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
        role: 'TA'
      });
    expect(result3.statusCode).toEqual(400);
    expect(result3.text).toEqual(
      JSON.stringify({
        message: '_id is required'
      })
    );
  });

  // updateUser
  // 400 FAIL TEST
  it('checks /user/updateUser PUT route FAILS on userID not in DB', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        // username not in DB
        _id: '123456789012345678901234',
        name: 'testTA',
        username: 'testta@gmail.com',
        role: 'Professor'
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'User not found in database'
      })
    );
  });

  it('checks /user/updateUser PUT route FAILS on new username already in DB', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .put('/v1/user/updateUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        // username not in DB
        _id: user1.id,
        name: 'testTA1',
        username: 'testTA@gmail.com',
        role: 'Professor'
      });
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'This username is already taken'
      })
    );
  });

  // CREATE USER TESTS ----------------------------------------------------------
  // createUser
  // 200 SUCCESS TEST
  it('checks /user/create POST route PASSES on valid route call', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA 2',
        username: 'testTA2@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(200);
  });

  // createUser
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

  // createUser
  // 403 FAIL TEST
  it('checks /user/create POST route FAILS with username already taken', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        name: 'Test TA',
        username: 'testTA@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'This username is already taken'
      })
    );
  });

  // createUser
  // 401 FAIL TEST
  it('checks /user/create POST route FAILS with invalid token passed in', async () => {
    //Creates user in the DB with TA token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + 'invalidToken')
      .send({
        name: 'Test TA 1',
        username: 'testTA1@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // createUser
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

  // createUser
  // 400 FAIL TEST
  it('checks /user/create POST route FAILS on invalid data types passed in', async () => {
    // Creates user in the DB with professor token
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

  // createUser
  // 400 FAIL TEST
  it('checks /user/create POST route FAILS on invalid body (NO name or username or password or role in body)', async () => {
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

  // DELETE USER TESTS----------------------------------------------------------------------
  // deleteUser
  // 200 SUCCESS TEST
  it('checks /user/deleteUser DELETE route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/user/deleteUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({ username: 'testTA@gmail.com' });
    expect(result.statusCode).toEqual(200);
  });

  // deleteUser
  //403 FAIL TEST
  it('checks /user/deleteUser DELETE route FAILS with TA Token', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/user/deleteUser')
      .set('Authorization', 'bearer ' + taToken)
      .send({ username: 'testTA@gmail.com' });
    expect(result.statusCode).toEqual(403);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'You do not have permission to make this request'
      })
    );
  });

  // deleteUser
  //401 FAIL TEST
  it('checks /user/deleteUser DELETE route FAILS on invalid token passed in', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/user/deleteUser')
      .set('Authorization', 'bearer ' + 'invalidToken')
      .send({ username: 'testTA@gmail.com' });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual('Unauthorized');
  });

  // deleteUser
  //400 FAIL TEST
  it('checks /user/deleteUser DELETE route FAILS on username not in DB', async () => {
    const result: request.Response = await request(expressApp)
      .delete('/v1/user/deleteUser')
      .set('Authorization', 'bearer ' + professorToken)
      .send({ username: 'testTA333@gmail.com' });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'User with given username is not found in the database'
      })
    );
  });
});
