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

  it('checks whether updating Problem nested data works', async () => {
    const original = createSamplePayloadMySql();
    const newTestInput = '456';
    await ProblemTable.findOne({
      where: {
        title: original.title
      },
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    }).then(async (problem) => {
      await TestCaseTable.update(
        { input: newTestInput },
        {
          where: {
            id: problem.testCases[0].id
          }
        }
      );
    });
    const expected = original;
    expected.testCases[0].input = newTestInput;
    const received = await ProblemTable.findOne({
      where: {
        title: original.title
      },
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    });
    expect(received).toMatchObject(expected);
  });

  it('checks whether deleting Problem works', async () => {
    const original = await ProblemTable.findOne({
      where: {
        title: createSamplePayloadMySql().title
      },
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    });
    await ProblemTable.destroy({
      where: {
        id: original.id
      }
    });
    await CodeTable.destroy({
      where: {
        problemId: original.id
      }
    });
    await TestCaseTable.destroy({
      where: {
        problemId: original.id
      }
    });
    let response = null;
    response = await ProblemTable.findAndCountAll({
      where: {
        title: original.title
      }
    });
    expect(response.count).toBe(0);
    response = await TestCaseTable.findAndCountAll({
      where: {
        problemId: original.id
      }
    });
    expect(response.count).toBe(0);
    response = await CodeTable.findAndCountAll({
      where: {
        problemId: original.id
      }
    });
    expect(response.count).toBe(0);
  });
});
