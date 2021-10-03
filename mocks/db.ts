import { MongoMemoryServer } from 'mongodb-memory-server';
class MemoryDatabaseServer {
  mongod: MongoMemoryServer;
  constructor() {
    this.mongod = new MongoMemoryServer();
  }

  start() {
    return this.mongod.start();
  }

  stop() {
    return this.mongod.stop();
  }

  getConnectionString() {
    return this.mongod.getUri();
  }
}

const mongoDatabase = new MemoryDatabaseServer();
export { mongoDatabase };
