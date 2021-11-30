import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel, IUser } from '../src/api/models/user.model';
import * as bcrypt from 'bcrypt';

describe('GET /auth/*', () => {
  let user: IUser;
  let superUser: IUser;

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

    // bcrypt.compare(pass, hashedPassword, async function (_err, result) {
    //   try {
    //     //Add into collection, if the password hashed properly
    //     if (result) {
    //       user = await UserModel.create({
    //         name: 'Test TA',
    //         username: 'testTA@gmail.com',
    //         password: hashedPassword,
    //         role: 'TA'
    //       });

    //       superUser = await UserModel.create({
    //         name: 'Test Professor',
    //         username: 'testProfessor@gmail.com',
    //         password: hashedPassword,
    //         role: 'Professor'
    //       });

    //       await user.save();
    //       await superUser.save();
    //     } else {
    //       throw { message: 'Hash method not working properly' };
    //     }
    //   } catch (err) {
    //     return err;
    //   }
    // });
  });
  afterEach((done: jest.DoneCallback) => {
    done();
  });

  // LOGIN TESTS ---------------------------------------------------------------------------
  // authenticateUser
  // 200 SUCCESS TEST
  it('checks /auth/login POST route PASSES on valid route call', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/auth/login')
      .send({ username: 'testProfessor@gmail.com', password: 'password' });
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('token');
  });

  // authenticateUser
  // 400 FAIL TEST
  it('checks /auth/login route FAILS on empty username and pass', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/auth/login')
      .send();
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'This route requires a body to be passed in'
      })
    );
  });

  // authenticateUser
  // 401 FAIL TEST
  it('checks /auth/login route FAILS on wrong username', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/auth/login')
      .send({ username: 'test@gm.com', password: 'password' });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'User with given username is not found - Unauthorized'
      })
    );
  });

  // authenticateUser
  // 401 FAIL TEST
  it('checks /auth/login route FAILS on wrong password', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/auth/login')
      .send({ username: 'testTA@gmail.com', password: 'wrongPassword' });
    expect(result.statusCode).toEqual(401);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'Invalid Password - Unauthorized'
      })
    );
  });
});
