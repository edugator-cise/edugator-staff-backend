import * as databaseHelper from '../../src/config/database';

process.env.NODE_ENV = "test";
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
