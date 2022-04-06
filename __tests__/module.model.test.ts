import { ModuleTable } from '../src/api/models/module.mysql.model';
import { ProblemTable } from '../src/api/models/problem.mysql.model';

describe('Module Sequelize Model', () => {
  it('checks whether querying works', async () => {
    let modules = null;
    try {
      modules = await ModuleTable.findAll({
        include: { model: ProblemTable }
      });
    } catch (err) {
      //eslint-disable-next-line
      console.log(err);
    }
    expect(modules).toBeTruthy();
    expect(modules.length).toBeGreaterThan(0);
    //eslint-disable-next-line
    console.log(JSON.stringify(modules, null, 2));
  });
});
