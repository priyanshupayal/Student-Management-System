const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'student_db';

// Validate database name to prevent SQL injection
if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
  console.error('Invalid database name. Only alphanumeric characters and underscore allowed.');
  process.exitCode = 1;
  process.exit(1);
}

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres',
});

(async () => {
  try {
    await client.connect();
    const exists = await client.query("SELECT 1 FROM pg_database WHERE datname=$1", [dbName]);
    if (exists.rowCount === 0) {
      // Use identifier properly to prevent SQL injection
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } catch (err) {
    console.error('Error creating database:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
