import { expressApp } from '../src/config/express';
import * as request from 'supertest';
import { UserModel } from '../src/api/models/user.model';


import { createSampleModule } from '../mocks/module';
describe('GET /', () => {
  beforeEach( async () => {
    await UserModel.create({
        username: "dhruv2000patel@gmail.com",
        password: "password"
    });
  });

  afterEach((done: jest.DoneCallback) => {
    done();
  });

  //name it token
    var auth: string = "";
    beforeEach(grabToken());


//   it('checks /module route gives 400 response on empty body', async () => {
//     const result: request.Response = await request(expressApp).post(
//       '/v1/module'
//     );
//     expect(result.statusCode).toEqual(400);
//   });
  it('creates a module', async () => {

          const sampleModule = createSampleModule();
          const result = await request(expressApp)
          .post('/v1/module')
          .set('Authorization', 'bearer ' + auth)
          .send(sampleModule);
          //   console.log(result);
          expect(result.statusCode).toEqual(200);
        });
        
        function grabToken() {
            return function(done) {
                request(expressApp)
                    .get('/v1/user/login?username=dhruv2000patel@gmail.com&password=password')
                    .send()
                    .expect((res) => {
                        // console.log(res.body)
                        auth = res.body.token
                    })
                    .expect(200)
                    .end(onResponse);

        function onResponse(_err, res) {
            auth = res.body.token;
            return done();
        }

    };
}

});
