import { UserTable } from '../src/api/models/user.mysql.model';
import * as bcrypt from 'bcrypt';

describe('User Sequelize Model', () => {
  const sampleUser = {
    name: 'Test TA',
    username: 'testTA@gmail.com',
    role: 'TA',
    salt: 1
  };

  beforeEach(async () => {
    const pass = 'password';

    const hashedPassword: string = await new Promise((resolve) => {
      bcrypt.hash(pass, 10, function (_err, hash) {
        resolve(hash);
      });
    });

    const result: boolean = await new Promise((resolve) => {
      bcrypt.compare(pass, hashedPassword, async function (_err, result) {
        try {
          return resolve(result);
        } catch {
          return false;
        }
      });
    });

    if (result) {
      await UserTable.create({
        password: hashedPassword,
        ...sampleUser
      });
    } else {
      throw { message: 'Hash method not working properly' };
    }
  });

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
    expect(users[0]).toMatchObject(sampleUser);
  });
});
