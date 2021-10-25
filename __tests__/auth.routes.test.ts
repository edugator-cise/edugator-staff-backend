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

    bcrypt.hash(pass, 10, function (_err, hash) {
      bcrypt.compare(pass, hash, async function (_err, result) {
      try{
        //Add into collection, if the password hashed properly
        if (result) {
          user = await UserModel.create({
            username: 'testTA@gmail.com',
            password: hash,
            role: 'TA'
          });
          
          superUser = await UserModel.create({
            username: 'testProfessor@gmail.com',
            password: hash,
            role: 'Professor'
          });
          
          await user.save();
          await superUser.save();

        } else {
          throw { message: 'Hash method not working properly'};
        }
      } catch (err) {
        return err;
      }
      });
    });

  });
  afterEach((done: jest.DoneCallback) => {
    done();
  });

  

  // CREATE USER TESTS
  it('checks /user/create POST route and creates a user correctly', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        username: 'testTA1@gmail.com',
        password: 'password',
        role: 'TA'
      });
    expect(result.statusCode).toEqual(200);
  });

  //FAIL TEST
  it('checks /user/create POST route FAILS with TA Token', async () => {
    //Creates user in the DB with TA token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + taToken)
      .send({
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

  it('checks /user/create POST route FAILS on invalid body (NO username or password or role in body)', async () => {
    //Creates user in the DB with professor token
    const result: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        username: 'testTA1@gmail.com',
      });
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual(
      JSON.stringify({
        message: 'This route requires a username, password, and role field to be passed in the body'
      })
    );

    const result1: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        role: 'TA',
      });
      expect(result1.statusCode).toEqual(400);
    expect(result1.text).toEqual(
      JSON.stringify({
        message: 'This route requires a username, password, and role field to be passed in the body'
      })
    );

      const result2: request.Response = await request(expressApp)
      .post('/v1/user/create')
      .set('Authorization', 'bearer ' + professorToken)
      .send({
        password: 'password',
      });
      expect(result2.statusCode).toEqual(400);
      expect(result2.text).toEqual(
        JSON.stringify({
          message: 'This route requires a username, password, and role field to be passed in the body'
        })
      );
  });

  //LOGIN TESTS
  it('checks /user/login route gives 401 response on empty username and pass', async () => {
  const result: request.Response = await request(expressApp).post(
    '/v1/user/login'
  );
  expect(result.statusCode).toEqual(401);
  });

  it('checks /user/login route and gives 401 on wrong username or pass', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/login')
      .send({ username: 'test@gm.com', password: 'password' });
    expect(result.statusCode).toEqual(401);
  });
  
  it('logs in /user/login route and gives 200 resposne ', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/login')
      .send({ username: 'testTA@gmail.com', password: 'password' });
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('token');
  });

  
});


// describe('POST /user/login success', () => {
//   beforeEach(async () => {
//     const pass = 'password';

//     bcrypt.hash(pass, 10, function (_err, hash) {
//       bcrypt.compare(pass, hash, async function (_err, result) {
//       try{
//         //Add into collection, if the password hashed properly
//         if (result) {
//           const user = await UserModel.create({
//             username: 'testTA@gmail.com',
//             password: hash,
//             role: 'TA'
//           });    
//           await user.save();

//         } else {
//           throw { message: 'Hash method not working properly'};
//         }
//       } catch (err) {
//         return err;
//       }
//       });
//     });

//   });

 
// });