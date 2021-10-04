import * as databaseHelper from '../../src/config/database';
<<<<<<< HEAD

=======
>>>>>>> cd8428220c893397aa496ac3cb2e8606cd9543d7
process.env.NODE_ENV = 'test';
//eslint-disable-next-line
beforeAll(() => {
  return databaseHelper.connect();
});
//eslint-disable-next-line
beforeEach(() => {
  return databaseHelper.truncate();
});
//eslint-disable-next-line
afterAll(() => {
  return databaseHelper.disconnect();
});
