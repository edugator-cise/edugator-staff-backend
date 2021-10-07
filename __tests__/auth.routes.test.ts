import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';
describe('GET /user/login', () => {
  beforeEach(async () => {
    const user = new UserModel({
      username: 'test@gmail.com',
      password: 'password'
    });
    await user.save();
  });
  afterEach((done: jest.DoneCallback) => {
    done();
  });
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
  it('logs in /userlogin route and gives 200 resposne ', async () => {
    const result: request.Response = await request(expressApp)
      .post('/v1/user/login')
      .send({ username: 'test@gmail.com', password: 'password' });
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('token');
  });
});
