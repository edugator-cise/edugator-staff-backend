import { createConnection, Connection } from 'mysql2';
import { ModuleDocument, ModuleInterface } from '../src/migration/module.orm';
import {
  clearTestData,
  insertTestData,
  testModules
} from '../src/migration/insertTestData';
import { ModuleOrm } from '../src/migration/module.orm';
import { ProblemOrm } from '../src/migration/problem.orm';
import { ModuleUpdate } from '../src/migration/query';

const compareModules = (a: ModuleInterface, b: ModuleInterface) => {
  if (a.number < b.number) {
    return -1;
  } else if (a.number > b.number) {
    return 1;
  } else {
    return 0;
  }
};

const toModuleInterface = (module: ModuleDocument): ModuleInterface => {
  delete module._id;
  return module;
};

describe('ProblemORM Class', () => {
  const modules = testModules.sort(compareModules);
  let connection: Connection;
  let module: ModuleOrm;
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
    module = new ModuleOrm(connection, problem);
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
    it('checks if the findAll function returns all modules', async () => {
      let results: ModuleDocument[] = [];
      results = await module.findAll();
      expect(
        results.map((x) => toModuleInterface(x)).sort(compareModules)
      ).toEqual(modules);
    });
  });

  describe('find function', () => {
    it('checks whether filtering by name succeeds', async () => {
      let results: ModuleDocument[] = [];
      results = await module.find({
        name: 'Test Module One'
      });
      expect(results.length).toEqual(1);
      expect(results[0]).toMatchObject(modules[0]); // does this check the problems in turn?
    });

    it('checks if filtering by all properties is successful', async () => {
      let results: ModuleDocument[] = [];
      results = await module.find({
        name: 'Test Module Two',
        number: 1.1
      });
      expect(results.length).toEqual(1);
      expect(results[0]).toMatchObject(modules[1]); // does this check the problems in turn?
    });

    it('checks whether filtering by null succeeds', async () => {
      let results: ModuleDocument[] = [];
      results = await module.find({
        name: null
      });
      expect(results.length).toEqual(0);
    });
  });

  describe('findOne function', () => {
    it('checks whether filter by id succeeds', async () => {
      const result = await module.findOne({
        _id: 1
      });
      expect(result._id).toEqual(1);
    });

    it('checks whether filter by id succeeds on non-existent id', async () => {
      const result = await module.findOne({
        _id: 100000000
      });
      expect(result).toBeNull();
    });
  });

  describe('findById function', () => {
    it('checks whether filter by id succeeds', async () => {
      const result = await module.findById(1);
      expect(result).toMatchObject(module[0]);
    });

    it('checks whether filter by id succeeds on non-existent id', async () => {
      const result = await module.findById(1000000);
      expect(result).toBeNull();
    });
  });

  describe('findyByIdAndUpdate function', () => {
    beforeEach(async () => {
      await clearTestData(connection);
      return insertTestData(connection);
    })

    it('checks whether update with new=true works', async () => {
      const initial = await module.findOne({ name: 'Test Module One' });
      const updated: ModuleUpdate = {
        name: 'Updated Test Module One',
        number: initial.number,
        problems: [
          {
            _id: initial.problems[0]._id,
            statement: initial.problems[0].statement,
            title: 'updated test title 1',
            hidden: initial.problems[0].hidden,
            language: initial.problems[0].language,
            dueDate: initial.problems[0].dueDate,
            code: {
              header: 'updated test header 1',
              body: 'updated test body 1',
              footer: initial.problems[0].code.footer
            },
            fileExtension: initial.problems[0].fileExtension,
            testCases: [
              {
                input: 'updated test input 1',
                expectedOutput: 'updated test expected output 1',
                hint: initial.problems[0].testCases[0].hint,
                visibility: initial.problems[0].testCases[0].visibility
              }
            ],
            templatePackage: 'updated test template_package 1',
            timeLimit: initial.problems[0].timeLimit,
            memoryLimit: initial.problems[0].memoryLimit,
            buildCommand: 'updated test build_command 1',
            moduleId: initial.problems[0].moduleId
          }
        ]
      };
      const result = await module.findByIdAndUpdate(initial._id, updated, {
        new: true
      });
      expect(result).toMatchObject(updated);
    });

    it('checks whether update with new=false works', async () => {
      const initial = await module.findOne({ name: 'Test Module One' });
      const updated: ModuleUpdate = {
        name: 'Updated Test Module One',
        number: initial.number,
        problems: [
          {
            _id: initial.problems[0]._id,
            statement: initial.problems[0].statement,
            title: 'updated test title 1',
            hidden: initial.problems[0].hidden,
            language: initial.problems[0].language,
            dueDate: initial.problems[0].dueDate,
            code: {
              header: 'updated test header 1',
              body: 'updated test body 1',
              footer: initial.problems[0].code.footer
            },
            fileExtension: initial.problems[0].fileExtension,
            testCases: [
              {
                input: 'updated test input 1',
                expectedOutput: 'updated test expected output 1',
                hint: initial.problems[0].testCases[0].hint,
                visibility: initial.problems[0].testCases[0].visibility
              }
            ],
            templatePackage: 'updated test template_package 1',
            timeLimit: initial.problems[0].timeLimit,
            memoryLimit: initial.problems[0].memoryLimit,
            buildCommand: 'updated test build_command 1',
            moduleId: initial.problems[0].moduleId
          }
        ]
      };
      const result = await module.findByIdAndUpdate(initial._id, updated, {
        new: false
      });
      expect(result).toEqual(initial);
    });
  });
});
