import * as databaseHelper from '../../src/config/database';
import { buildUserTable } from '../../src/api/models/user.mysql.model';
import { buildProblem } from '../../src/api/models/problem.mysql.model';
import { buildModuleTable } from '../../src/api/models/module.mysql.model';
//eslint-disable-next-line
require('mysql2/node_modules/iconv-lite').encodingExists('cesu8');

process.env.NODE_ENV = 'test';
//eslint-disable-next-line
beforeAll(async () => {
  databaseHelper.mySqlConnect();
  await buildModuleTable();
  await buildUserTable();
  await buildProblem();
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
