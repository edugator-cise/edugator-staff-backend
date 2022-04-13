import { UserTable } from '../src/api/models/user.mysql.model';
import * as bcrypt from 'bcrypt';

jest.setTimeout(10000);

describe('User Sequelize Model', () => {
  const sampleUser = {
    name: 'Test TA',
    username: 'testTA@gmail.com',
    role: 'TA',
    salt: 1
  };

  const updatedUser = {
    name: 'Test TA',
    username: 'a new username',
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

  it('checks whether deleting all rows works', async () => {
    let users = null;
    try {
      await UserTable.destroy({ where: {} });
      users = await UserTable.findAll();
    } catch (err) {
      //eslint-disable-next-line
      console.log(err);
    }
    expect(users).toBeTruthy();
    expect(users.length).toBe(0);
  });

  it('checks whether deleting by username works', async () => {
    let users = null;
    try {
      users = await UserTable.findAll();
      expect(users).toBeTruthy();
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toMatchObject(sampleUser);
      await UserTable.destroy({ where: { username: users[0].username } });
      users = await UserTable.findAll();
    } catch (err) {
      //eslint-disable-next-line
      console.log(err);
    }
    expect(users).toBeTruthy();
    expect(users.length).toBe(0);
  });

  it('checks whether updating a field works', async () => {
    let originalUsers = null;
    let updatedUsers = null;
    try {
      originalUsers = await UserTable.findAll();
      expect(originalUsers).toBeTruthy();
      expect(originalUsers.length).toBeGreaterThan(0);
      expect(originalUsers[0]).toMatchObject(sampleUser);
      await UserTable.update(
        { username: updatedUser.username },
        { where: { username: originalUsers[0].username } }
      );
      updatedUsers = await UserTable.findAll();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    expect(updatedUsers).toBeTruthy();
    expect(updatedUsers.length).toBeGreaterThan(0);
    expect(updatedUsers[0]).toMatchObject(updatedUser);
  });
});
