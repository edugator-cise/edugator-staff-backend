import * as mongoose from 'mongoose';
import { Sequelize } from 'sequelize/types';

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

const mySqlConnect = async (): Promise<Sequelize> => {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.host,
      dialect: 'mysql',
      logging: false // disable logging of queries
    }
  );
  await sequelize.authenticate();
  return sequelize;
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

export { disconnect, truncate, connect };
