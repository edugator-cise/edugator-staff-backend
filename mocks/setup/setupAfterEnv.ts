import * as databaseHelper from '../../src/config/database';
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
