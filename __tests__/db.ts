import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

const connect = async () => {
  const uri = await mongod.getUri();
  await mongoose.connect(uri);
}

const closeDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({});
  }
}

beforeEach( async function(done) {
  await connect();
  done();
})

afterEach( async function(done) {
  await clearDB();
  await closeDb();
  return done();
})

afterAll(done => {
  return done();
})