import { UserTable } from '../src/api/models/user.mysql.model';

describe('User Sequelize Model', () => {
  it('checks whether querying works', async () => {
    let users = null;
    try {
      users = await UserTable.findAll();
    } catch (err) {
      //eslint-disable-next-line
      console.log(err);
    }
    expect(users).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    //eslint-disable-next-line
    console.log(JSON.stringify(users, null, 2));
  });
});
