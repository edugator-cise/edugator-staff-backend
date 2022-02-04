import { Pool, createPool } from 'mysql2';

// Create and export a shared connection pool for querying the db

const pool: Pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: process.env.DB_POOL_WAIT_FOR_CONNECTIONS == 'true',
  connectionLimit: parseInt(process.env.DB_POOL_CONNECTION_LIMIT),
  queueLimit: parseInt(process.env.DB_POLL_QUEUE_LIMIT)
});

export default pool;
