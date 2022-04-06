import * as mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

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
      logging: false // disable logging of queries
    }
  );
  await sequelize.authenticate();
};

const mySqlDisconnect = async () => {
  sequelize.close();
};

export {
  disconnect,
  truncate,
  connect,
  mySqlConnect,
  mySqlDisconnect,
  sequelize
};
