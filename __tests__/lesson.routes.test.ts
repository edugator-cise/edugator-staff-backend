import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/v1/user.model';
import { createSamplePayload } from '../mocks/lessons';
import { Module } from '../src/api/models/v1/module.model';
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
      await UserModel.create({
        name: 'Test TA',
        username: 'dhruv2000patel@gmail.com',
        password: hashedPassword,
        role: 'TA'
      });
    } else {
      throw { message: 'Hash method not working properly' };
    }

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
  let moduleId = null;

  it('creates a lesson and gets a 200 response', async () => {
    const sampleLesson = createSamplePayload(moduleId);
    const result = await request(expressApp)
      .post('/v1/admin/lesson')
      .set('Authorization', 'bearer ' + token)
      .send(sampleLesson);
    expect(result.statusCode).toEqual(200);
  });

  it('creates a lesson with some empty fields and gets a 200 response', async () => {
    const sampleLesson = createSamplePayload(moduleId);
    sampleLesson.content = [];
    const result = await request(expressApp)
      .post('/v1/admin/lesson')
      .set('Authorization', 'bearer ' + token)
      .send(sampleLesson);
    expect(result.statusCode).toEqual(200);
  });

  it('attempts to create a lesson with a nonexistent moduleId', async () => {
    const sampleLesson = createSamplePayload('010101010101010101010101');
    const result = await request(expressApp)
      .post('/v1/admin/lesson')
      .set('Authorization', 'bearer ' + token)
      .send(sampleLesson);
    expect(result.statusCode).toEqual(404);
  });

  it('attempts to create a lesson with no author', async () => {
    const sampleLesson = createSamplePayload(moduleId);
    sampleLesson.author = '';
    const result = await request(expressApp)
      .post('/v1/admin/lesson')
      .set('Authorization', 'bearer ' + token)
      .send(sampleLesson);
    expect(result.statusCode).toEqual(400);
  });

  it('attempts to create a lesson with no title', async () => {
    const sampleLesson = createSamplePayload(moduleId);
    sampleLesson.title = '';
    const result = await request(expressApp)
      .post('/v1/admin/lesson')
      .set('Authorization', 'bearer ' + token)
      .send(sampleLesson);
    expect(result.statusCode).toEqual(400);
  });
});
