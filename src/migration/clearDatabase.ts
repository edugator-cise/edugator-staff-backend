/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';

const connection: Connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect();

console.log('Clearing rows from TestCase. . .');
connection.query(`DELETE FROM TestCase`, function (err) {
  if (err) {
    throw err;
  } else {
    console.log('Rows from TestCase cleared');
  }
});

console.log('Clearing rows from Code. . .');
connection.query(`DELETE FROM Code`, function (err) {
  if (err) {
    throw err;
  } else {
    console.log('Rows from Code cleared');
  }
});

console.log('Clearing rows from Problem. . .');
connection.query(`DELETE FROM Problem`, function (err) {
  if (err) {
    throw err;
  } else {
    console.log('Rows from Problem cleared');
  }
});

console.log('Clearing rows from Module. . .');
connection.query(`DELETE FROM Module`, function (err) {
  if (err) {
    throw err;
  } else {
    console.log('Rows from Module cleared');
  }
});

console.log('Clearing rows from User. . .');
connection.query(`DELETE FROM User`, function (err) {
  if (err) {
    throw err;
  } else {
    console.log('Rows from User cleared');
  }
});

connection.end(function (err) {
  if (err) {
    connection.destroy();
    throw err;
  }
});
