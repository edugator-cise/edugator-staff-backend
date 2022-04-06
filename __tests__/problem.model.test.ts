import {
  ProblemTable,
  CodeTable,
  TestCaseTable
} from '../src/api/models/problem.mysql.model';

describe('Problem Sequelize Model', () => {
  it('checks whether querying works', async () => {
    let problems = null;
    try {
      problems = await ProblemTable.findAll({
        include: [{ model: TestCaseTable }, { model: CodeTable }]
      });
    } catch (err) {
      //eslint-disable-next-line
      console.log(err);
    }
    expect(problems).toBeTruthy();
    expect(problems.length).toBeGreaterThan(0);
    //eslint-disable-next-line
    console.log(JSON.stringify(problems, null, 2));
  });
});
