import * as mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import { buildModuleTable } from '../api/models/module.mysql.model';
import { buildProblemTables } from '../api/models/problem.mysql.model';
import { buildUserTable } from '../api/models/user.mysql.model';

const globalAny: any = global;

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.NODE_ENV === 'test'
        ? globalAny.__DB_URL__
        : process.env.DB_URI
    );
  }
};

const truncate = async () => {
  if (mongoose.connection.readyState !== 0) {
    const { collections } = mongoose.connection;

    const promises = Object.keys(collections).map((collection) =>
      mongoose.connection.collection(collection).deleteMany({})
    );

    await Promise.all(promises);
  }
};

const disconnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

let sequelize: Sequelize = null;

const mySqlConnect = async () => {
  sequelize = new Sequelize(
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_NAME
      : process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      dialectOptions: {
        decimalNumbers: true // return DECIMAL as number, not string
      },
      logging: false // disable logging of queries
    }
  );
  await sequelize.authenticate();
  await buildModuleTable();
  await buildUserTable();
  await buildProblemTables();
};

const mySqlDisconnect = async () => {
  await sequelize.close();
};

const mySqlTruncate = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
  await sequelize.truncate({ cascade: true });
};

export {
  disconnect,
  truncate,
  connect,
  mySqlConnect,
  mySqlDisconnect,
  mySqlTruncate,
  sequelize
};
