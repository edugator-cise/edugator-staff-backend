import { createConnection, Connection } from 'mysql2';
import { ProblemInterface } from '../src/api/models/problem.model';
import {
  clearTestData,
  insertTestData,
  testProblems
} from '../src/migration/insertTestData';
import {
  ProblemOrm,
  ProblemDocument,
  ProblemUpdate,
  ProblemQueryFilter
} from '../src/migration/problem.orm';

const compareProblems = (a: ProblemInterface, b: ProblemInterface) => {
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  } else {
    return 0;
  }
};

const toProblemInterface = (problem: ProblemDocument): ProblemInterface => {
  delete problem._id;
  delete problem.moduleId;
  return problem;
};

/*
 * TODO: These tests are unstable due to reliance on an external database.
 * More reliable error handling and fast-failing should be implemented,
 * particularly because database errors make the testing pipeline take
 * much longer (10-20 sec). It might be best to omit them by default.
 */

describe('ProblemORM Class', () => {
  const problems = testProblems.sort(compareProblems);
  let connection: Connection;
  let problem: ProblemOrm;

  beforeAll(async () => {
    connection = createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    connection.connect(function (err) {
      if (err) {
        throw err;
      }
    });
    problem = new ProblemOrm(connection);
    await clearTestData(connection);
    return insertTestData(connection);
  });

  afterAll(async () => {
    await clearTestData(connection);
    connection.end(function (err) {
      if (err) {
        connection.destroy();
        throw err;
      }
    });
  });

  describe('findAll function', () => {
    it('checks whether all items are returned', async () => {
      let results: ProblemDocument[] = [];
      results = await problem.findAll();
      expect(
        results.map((x) => toProblemInterface(x)).sort(compareProblems)
      ).toEqual(problems);
    });
  });

  describe('find function', () => {
    it('checks whether filtering by title succeeds', async () => {
      let results: ProblemDocument[] = [];
      results = await problem.find({ title: 'test title 1' });
      expect(results.length).toEqual(1);
      expect(results[0]).toMatchObject(problems[0]);
    });

    it('checks whether filtering by all properties succeeds', async () => {
      let results: ProblemDocument[] = [];
      results = await problem.find({
        statement: 'test statement 2',
        title: 'test title 2',
        hidden: false,
        language: 'cpp',
        dueDate: new Date('2022-12-31T01:00:00'),
        fileExtension: '.cpp',
        templatePackage: 'test template_package 2',
        timeLimit: 1.0,
        memoryLimit: 1.0,
        buildCommand: 'test build_command 2'
      });
      expect(results.length).toEqual(1);
      expect(results[0]).toMatchObject(problems[1]);
    });

    it('checks whether filtering by null succeeds', async () => {
      let results: ProblemDocument[] = [];
      results = await problem.find({ title: null });
      expect(results.length).toEqual(0);
    });
  });

  describe('findOne function', () => {
    it('checks whether filter by language succeeds', async () => {
      const result = await problem.findOne({ language: 'cpp' });
      expect(result.language).toBe('cpp');
    });

    it('checks whether filter by non-existent language succeeds', async () => {
      const result = await problem.findOne({ language: 'thisIsNotALanguage' });
      expect(result).toBeNull();
    });

    it('checks whether filter by title succeeds', async () => {
      const result = await problem.findOne({ title: 'test title 1' });
      expect(result).toMatchObject(problems[0]);
    });

    it('checks whether filter by invalid id is null', async () => {
      const result = await problem.findOne({ _id: -1 });
      expect(result).toBeNull();
    });
  });

  describe('findByIdAndUpdate function', () => {
    // Need to clear and add fresh test data before update tests
    beforeEach(async () => {
      await clearTestData(connection);
      return insertTestData(connection);
    });

    it('checks whether update with new=true works', async () => {
      const initial = await problem.findOne({ title: 'Test Title 2' });
      const updated: ProblemUpdate = {
        title: 'Updated Test Title 2',
        statement: 'Updated Statement 2',
        hidden: initial.hidden,
        language: 'java',
        dueDate: initial.dueDate,
        code: {
          header: initial.code.header,
          body: initial.code.body,
          footer: 'updated footer'
        },
        fileExtension: initial.fileExtension,
        testCases: [
          {
            input: 'updated input',
            expectedOutput: 'updated expected output',
            hint: 'updated hint',
            visibility: 1
          }
        ],
        templatePackage: initial.templatePackage,
        timeLimit: initial.timeLimit,
        memoryLimit: initial.memoryLimit,
        buildCommand: initial.buildCommand
      };
      const result = await problem.findByIdAndUpdate(initial._id, updated, {
        new: true
      });
      expect(result).toMatchObject(updated);
    });

    it('checks whether update with new=false works', async () => {
      const initial = await problem.findOne({ title: 'Test Title 2' });
      const updated: ProblemUpdate = {
        title: 'Updated Test Title 2',
        statement: 'Updated Statement 2',
        hidden: initial.hidden,
        language: 'java',
        dueDate: initial.dueDate,
        code: {
          header: initial.code.header,
          body: initial.code.body,
          footer: 'updated footer'
        },
        fileExtension: initial.fileExtension,
        testCases: [
          {
            input: 'updated input',
            expectedOutput: 'updated expected output',
            hint: 'updated hint',
            visibility: 1
          }
        ],
        templatePackage: initial.templatePackage,
        timeLimit: initial.timeLimit,
        memoryLimit: initial.memoryLimit,
        buildCommand: initial.buildCommand
      };
      const result = await problem.findByIdAndUpdate(initial._id, updated, {
        new: false
      });
      expect(result).toEqual(initial);
    });

    /*
     * TODO: Fix test so it can run with other tests
     *
     * This test succeeds when it is the only test in the suite
     * which runs. However, when all the tests run also, it fails.
     * The reason for this is a failing foreign key constraint between
     * the Problem table and the Module table blocking
     * update or deletion. Due to this failure, the test is skipped by default.
     */
    it.skip('checks return null with invalid id', async () => {
      connection.query(
        'SELECT MAX(id) AS maxId FROM Problem',
        async (err, rows) => {
          if (err) {
            throw err;
          } else {
            const maxId: number = rows[0].maxId;
            const updated: ProblemUpdate = {
              title: 'Updated Test Title 2'
            };
            const result = await problem.findByIdAndUpdate(
              maxId + 1,
              updated,
              {}
            );
            expect(result).toBeNull();
          }
        }
      );
    });
  });

  describe('findOneAndDelete function', () => {
    it('checks deleting by id succeeds', async () => {
      const original = await problem.findOne({ title: 'test title 1' });
      const retrieved = await problem.findOneAndDelete({ _id: original._id });
      expect(retrieved).toEqual(original);
      const retrievedAfterDelete = await problem.findOne({
        _id: retrieved._id
      });
      expect(retrievedAfterDelete).toBeNull();
    });

    it('checks deleting by multiple properties succeeds', async () => {
      const filter: ProblemQueryFilter = {
        title: 'test title 1',
        language: 'cpp'
      };
      const original = await problem.findOne(filter);
      const retrieved = await problem.findOneAndDelete(filter);
      expect(retrieved).toEqual(original);
      const retrievedAfterDelete = await problem.findOne(filter);
      expect(retrievedAfterDelete).toBeNull();
    });

    it('checks deleting by multiple properties succeeds', async () => {
      const initialCount = (await problem.findAll()).length;
      const retrieved = await problem.findOneAndDelete({
        title: 'not a title in the test data'
      });
      expect(retrieved).toBeNull();
      const count = (await problem.findAll()).length;
      expect(count).toBe(initialCount);
    });

    it('checks deleting with no filter succeeds',async () => {
      const initialCount = (await problem.findAll()).length;
      const retrieved = await problem.findOneAndDelete({});
      expect(retrieved).toBeTruthy();
      const count = (await problem.findAll()).length;
      expect(count).toBe(initialCount - 1);
    });
  });
});
