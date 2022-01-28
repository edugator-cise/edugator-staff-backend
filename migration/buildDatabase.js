var mysql = require('mysql2');
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect();

// Drop existing tables; ordered based on foreign keys
connection.query('DROP TABLE IF EXISTS TestCase',
  function (err, rows, fields) {
    if (err) throw err;
  }
);

connection.query('DROP TABLE IF EXISTS Code',
  function (err, rows, fields) {
    if (err) throw err;
  }
);

connection.query('DROP TABLE IF EXISTS Problem',
  function (err, rows, fields) {
    if (err) throw err;
  }
);

connection.query('DROP TABLE IF EXISTS Module',
  function (err, rows, fields) {
    if (err) throw err;
  }
);

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
    id INT,
    name VARCHAR(500) NOT NULL,
    number DECIMAL(11,1) NOT NULL,
    PRIMARY KEY (id)
  )
  `,
  function(err, rows, fields) {
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
    id INT NOT NULL,
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
  )
  `,
  function(err, rows, fields) {
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
    id INT NOT NULL,
    header TEXT,
    body TEXT,
    footer TEXT,
    problem_id INT NOT NULL UNIQUE,
    PRIMARY KEY (id),
    FOREIGN KEY (problem_id) REFERENCES Problem(id)
    	ON UPDATE CASCADE
	ON DELETE CASCADE
  )
  `,
  function(err, rows, fields) {
    if (err) throw err;
  }
);

connection.query(
  `
  CREATE TABLE IF NOT EXISTS TestCase (
    id INT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    hint TEXT NOT NULL,
    visibility TINYINT NOT NULL,
    problem_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (problem_id) REFERENCES Problem(id),
    CONSTRAINT visibility_enumeration
      CHECK (visibility = 0 OR visibility = 1 OR visibility = 3)
  )
  `,
  function(err, rows, fields) {
    if (err) throw err;
  }
);

connection.end();

