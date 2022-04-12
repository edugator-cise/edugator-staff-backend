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

  it('checks whether updating Problem fields works', async () => {
    const original = createSamplePayloadMySql();
    const updatedTitle = 'Updated title';
    await ProblemTable.update(
      { title: updatedTitle },
      {
        where: {
          title: original.title
        }
      }
    );
    const expected = original;
    expected.title = updatedTitle;
    const received = await ProblemTable.findOne({
      where: {
        title: updatedTitle
      },
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    });
    expect(received).toMatchObject(expected);
  });
});
