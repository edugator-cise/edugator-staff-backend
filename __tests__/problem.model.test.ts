import { createSamplePayload } from '../mocks/problems';
import {
  ProblemTable,
  TestCaseTable
} from '../src/api/models/problem.mysql.model';

describe('Problem Sequelize Model', () => {
  beforeEach(() => {
    ProblemTable.create(createSamplePayload(), {
      include: [
        {
          model: TestCaseTable,
          as: 'testCases'
        }
      ]
    });
  });

  it('checks whether querying works', async () => {
    let problems = null;
    problems = await ProblemTable.findAll({
      include: [{ model: TestCaseTable, as: 'testCases' }]
    });
    expect(problems).toBeTruthy();
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toMatchObject(createSamplePayload());
  });
});
