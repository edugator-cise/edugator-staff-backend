import { createSampleModule } from '../mocks/module';
import { createSampleProblemMySql } from '../mocks/problems';
import { ModuleTable } from '../src/api/models/module.mysql.model';
import {
  ProblemTable,
  TestCaseTable,
  CodeTable
} from '../src/api/models/problem.mysql.model';

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
});
