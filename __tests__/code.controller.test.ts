import app from '../src/config/express';
import * as request from 'supertest';

jest.mock('../src/api/services/judge0', () => {
  return {
    judgeEngine: {
      createSubmission: (_code: string, _language: number, _base64: boolean, _cArgs: string) => {
        return new Promise((resolve) => {
          resolve({
            status: 200,
            body: {
              token: "example_token"
            }
          })
        })
      },
      getSubmission: (_token: string, _base64: boolean) => {
        return new Promise((resolve) => resolve({
          status: 200,
          body: {
          "stdout": "Hello World! ",
          "time": "0.004",
          "memory": 14936,
          "stderr": null,
          "token": "2427ce9c-7687-4fd0-8a5d-936c163de455",
          "compile_output": null,
          "message": null,
          "status": {
              "id": 3,
              "description": "Accepted"
          }
        }
        }))
      }
    }
  }
})
describe('POST /v1/code', () => {
  beforeAll((done: jest.DoneCallback) => {
    done();
  });

  afterAll((done: jest.DoneCallback) => {
    done();
  });
  
  it('makes a submission to judge0 engine and gives 200 response', async () => {
    const payload = {
      source_code: `#include <iostream>
      int main() {
          std::cout << "Hello World!";
          return 0;
      }`,
      language_id: 54,
      base_64: false,
      stdin: 'hello world'
    }
    const result: request.Response = await request(app).post('/v1/code/run').send(payload)
    console.log(result)
    expect(result.status).toEqual(200);
    expect(result.body).toHaveProperty("token", "example_token")
    })
  })