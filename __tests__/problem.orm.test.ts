import { createConnection, Connection } from 'mysql2';
import { ProblemInterface } from '../src/api/models/problem.model';
import {
  clearTestData,
  insertTestData,
  testProblems
} from '../src/migration/insertTestData';
import { ProblemOrm, ProblemDocument } from '../src/migration/problem.orm';

const compareProblems = (a: ProblemInterface, b: ProblemInterface) => {
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  } else {
    return 0;
  }
};

describe('ProblemORM Class', () => {
  const problems = testProblems.sort(compareProblems);
  let connection: Connection;
  let problem: ProblemOrm;

  beforeAll(() => {
    connection = createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    connection.connect(function (err) {
      if (err) {
        fail(err);
      }
    });
  });

  afterAll(() => {
    connection.end(function (err) {
      if (err) {
        connection.destroy();
        fail(err);
      }
    });
  });

  beforeEach(async () => {
    try {
      await insertTestData(connection);
    } catch (err) {
      fail(err);
    }
    problem = new ProblemOrm(connection);
  });

  afterEach(async () => {
    try {
      await clearTestData(connection);
    } catch (err) {
      fail(err);
    }
  });

  describe('findAll function', () => {
    it('checks whether all items are returned', async () => {
      let results: ProblemDocument[] = [];
      try {
        results = await problem.findAll();
      } catch (err) {
        fail(err);
      }
      expect(results.sort(compareProblems)).toEqual(problems);
    });
  });
});
