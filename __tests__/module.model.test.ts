import {
  createSampleModule,
  createSampleModulePayloadMySql
} from '../mocks/module';
import { createSampleProblemMySql } from '../mocks/problems';
import { ModuleTable } from '../src/api/models/module.mysql.model';
import {
  ProblemTable,
  TestCaseTable,
  CodeTable
} from '../src/api/models/problem.mysql.model';

jest.setTimeout(10000);

describe('Module Sequelize Model', () => {
  beforeEach(() => {
    const module = createSampleModule();
    module['problems'] = createSampleProblemMySql();
    return ModuleTable.create(module, {
      include: [
        {
          association: ModuleTable.Problems,
          as: 'problems',
          include: [
            {
              association: ProblemTable.TestCases,
              as: 'testCases'
            },
            {
              association: ProblemTable.Codes,
              as: 'code'
            }
          ]
        }
      ]
    });
  });

  it('checks whether querying works', async () => {
    const modules = await ModuleTable.findAll({
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    });
    expect(modules).toBeTruthy();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]).toMatchObject(createSampleModule());
    expect(modules[0].problems.length).toBe(1);
    expect(modules[0].problems[0]).toMatchObject(createSampleProblemMySql());
    //eslint-disable-next-line
  });

  it('checks whether querying by field on module works', async () => {
    const modules = await ModuleTable.findAll({
      where: { number: 5.1 },
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    });
    expect(modules).toBeTruthy();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]).toMatchObject(createSampleModule());
    expect(modules[0].problems.length).toBe(1);
    expect(modules[0].problems[0]).toMatchObject(createSampleProblemMySql());
  });

  it('checks whether updating Module field works', async () => {
    const original = createSampleModulePayloadMySql();
    await ModuleTable.update(
      { number: 5.2 },
      {
        where: {
          number: original.number
        }
      }
    );
    const expected = original;
    expected.number = 5.2;
    const received = await ModuleTable.findOne({
      where: {
        number: 5.2
      },
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    });
    expect(received).toMatchObject(expected);
  });

  it('checks whether updating nested Module data works', async () => {
    const original = createSampleModulePayloadMySql();
    const newTestInput = '456';
    await ModuleTable.findOne({
      where: {
        number: original.number
      },
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    }).then(async (module) => {
      for (const problem of module.problems) {
        await TestCaseTable.update(
          { input: newTestInput },
          {
            where: {
              id: problem.testCases[0].id
            }
          }
        );
      }
    });
    const expected = original;
    for (let i = 0; i < expected.problems.length; i++) {
      for (let j = 0; j < expected.problems[i].testCases.length; j++) {
        expected.problems[i].testCases[j].input = newTestInput;
      }
    }
    const received = await ModuleTable.findOne({
      where: {
        number: original.number
      },
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    });
    expect(received).toMatchObject(expected);
  });

  it('checks whether deleting all works', async () => {
    const original = await ModuleTable.findOne({
      where: { number: 5.1 },
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          include: [
            { model: TestCaseTable, as: 'testCases' },
            { model: CodeTable, as: 'code' }
          ]
        }
      ]
    });
    await ModuleTable.destroy({
      where: { id: original.id }
    });
    await ProblemTable.destroy({
      where: { moduleId: original.id }
    });
    for (const problem of original.problems) {
      await CodeTable.destroy({
        where: { problemId: problem.id }
      });
      await TestCaseTable.destroy({
        where: { problemId: problem.id }
      });
    }
    let response = null;
    response = await ModuleTable.findAndCountAll({
      where: { number: 5.1 }
    });
    expect(response.count).toBe(0);
    response = await ProblemTable.findAndCountAll({
      where: { moduleId: original.id }
    });
    expect(response.count).toBe(0);
    for (const problem of original.problems) {
      response = await CodeTable.findAndCountAll({
        where: { problemId: problem.id }
      });
      expect(response.count).toBe(0);
      response = await TestCaseTable.findAndCountAll({
        where: { problemId: problem.id }
      });
      expect(response.count).toBe(0);
    }
  });
});
