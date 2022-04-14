/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';

const connection: Connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const db_name: string =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DB_NAME
    : process.env.DB_NAME;

connection.connect();

connection.query(`CREATE DATABASE IF NOT EXISTS ${db_name}`, function (err) {
  if (err) throw err;
});

connection.query(`USE ${db_name}`, function (err) {
  if (err) throw err;
});

// Drop existing tables; ordered based on foreign keys
connection.query('DROP TABLE IF EXISTS TestCase', function (err) {
  if (err) throw err;
});

connection.query('DROP TABLE IF EXISTS Code', function (err) {
  if (err) throw err;
});

connection.query('DROP TABLE IF EXISTS Problem', function (err) {
  if (err) throw err;
});

connection.query('DROP TABLE IF EXISTS Module', function (err) {
  if (err) throw err;
});

connection.query('DROP TABLE IF EXISTS User', function (err) {
  if (err) throw err;
});

// Create tables in reverse referential order

/*
 * Questions:
 *   - Should Number be the primary key?
 *   - Should (Name, Number) form a composite key?
 *   - Or should we continue with the non-app-exposed primary key, Id?
 *   - Should any of the non-PK fields have a uniqueness constraint?
 */

connection.query(
  `
  CREATE TABLE IF NOT EXISTS Module (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(500) NOT NULL,
    number DECIMAL(11,1) NOT NULL,
    PRIMARY KEY (id)
  )
  `,
  function (err) {
    if (err) throw err;
  }
);

/*
 * Questions:
 *   - Default values?
 *   - What date type should we use? MongoDB Date supports millisecond
 *     granluarity. Should this continue?
 *   - Should the code_id foreign key be mandatory (i.e. NOT NULL)?
 *   - Do we want to make time_limit a floating point precision numeric,
 *     like DOUBLE? Or would we rather use a fixed point precision?
 */

connection.query(
  `
  CREATE TABLE IF NOT EXISTS Problem (
    id INT NOT NULL AUTO_INCREMENT,
    statement TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    hidden BOOL NOT NULL,
    language VARCHAR(500) NOT NULL,
    due_date DATETIME NOT NULL,
    file_extension ENUM('.java', '.cpp', '.h') NOT NULL,
    template_package VARCHAR(500) NOT NULL,
    time_limit DOUBLE,
    memory_limit DOUBLE,
    build_command VARCHAR(1000),
    module_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (module_id) REFERENCES Module(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  )
  `,
  function (err) {
    if (err) throw err;
  }
);

/*
 * Questions:
 *   - Should the problem_id be enforced UNIQUE or not?
 */

connection.query(
  `
  CREATE TABLE IF NOT EXISTS Code (
    id INT NOT NULL AUTO_INCREMENT,
    header TEXT,
    body TEXT,
    footer TEXT,
    problem_id INT NOT NULL UNIQUE,
    PRIMARY KEY (id),
    FOREIGN KEY (problem_id) REFERENCES Problem(id)
      ON DELETE CASCADE
    	ON UPDATE CASCADE
  )
  `,
  function (err) {
    if (err) throw err;
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS TestCase (
    id INT NOT NULL AUTO_INCREMENT,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    hint TEXT NOT NULL,
    visibility TINYINT NOT NULL,
    problem_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (problem_id) REFERENCES Problem(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT visibility_enumeration
      CHECK (visibility = 0 OR visibility = 1 OR visibility = 2)
  )
  `,
  function (err) {
    if (err) throw err;
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS User (
    _id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(500) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    name VARCHAR(500) NOT NULL,
    salt INT NOT NULL,
    role ENUM('Professor', 'TA') NOT NULL,
    PRIMARY KEY (_id)
  )
  `,
  function (err) {
    if (err) throw err;
  }
);

connection.end();
