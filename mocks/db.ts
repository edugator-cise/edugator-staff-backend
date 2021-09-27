import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

const connect = async () => {
  await mongod.start();

  const uri = await mongod.getUri();
  await mongoose.connect(uri);
};

const closeDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

const OLD_ENV = process.env;
beforeEach(async function () {
  jest.resetModules();
  process.env = { ...OLD_ENV };
  delete process.env.NODE_ENV;
  return connect();
});

afterEach(async function () {
  return clearDB();
});

afterAll(async () => {
  return closeDb();
});
