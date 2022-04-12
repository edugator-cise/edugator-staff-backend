import { createSamplePayloadMySql } from '../mocks/problems';
import {
  ProblemTable,
  TestCaseTable,
  CodeTable
} from '../src/api/models/problem.mysql.model';

describe('Problem Sequelize Model', () => {
  beforeEach(() => {
    const data = createSamplePayloadMySql();
    return ProblemTable.create(data, {
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
    });
  });

  it('checks whether querying works', async () => {
    let problems = null;
    problems = await ProblemTable.findAll({
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    });
    expect(problems).toBeTruthy();
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toMatchObject(createSamplePayloadMySql());
  });
});
