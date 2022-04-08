import { createSampleModule } from '../mocks/module';
import { ModuleTable } from '../src/api/models/module.mysql.model';

describe('Module Sequelize Model', () => {
  beforeEach(() => {
    return ModuleTable.create(createSampleModule());
  });

  it('checks whether querying works', async () => {
    const modules = await ModuleTable.findAll();
    expect(modules).toBeTruthy();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0]).toMatchObject(createSampleModule());
    //eslint-disable-next-line
  });
});
