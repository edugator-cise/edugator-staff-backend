import * as databaseHelper from '../../src/config/database';
//eslint-disable-next-line
require('mysql2/node_modules/iconv-lite').encodingExists('cesu8');

process.env.NODE_ENV = 'test';
//eslint-disable-next-line
beforeAll(async () => {
  await databaseHelper.mySqlConnect();
  return databaseHelper.connect();
});
//eslint-disable-next-line
beforeEach(async () => {
  await databaseHelper.mySqlTruncate();
  return databaseHelper.truncate();
});
//eslint-disable-next-line
afterAll(async () => {
  await databaseHelper.mySqlDisconnect();
  return databaseHelper.disconnect();
});
