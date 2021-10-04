const NodeEnvironment = require('jest-environment-node');
const {mongoDatabase } = require('../db');


class CustomEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    this.global.__DB_URL__ = await mongoDatabase.getConnectionString();
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomEnvironment