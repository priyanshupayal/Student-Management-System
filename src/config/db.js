const { Pool } = require("pg");
require("dotenv").config();

// Create and export a Postgres connection pool using DB_* env vars.
const pool = new Pool({
  host: process.env.DB_HOST || undefined,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || undefined,
  // If a DATABASE_URL is provided, prefer it (useful for deployment)
  connectionString: process.env.DATABASE_URL || undefined,
});

// Quick connection test so startup logs show DB status.
pool
  .connect()
  .then((client) => {
    client.release();
    console.log("Postgres: connected");
  })
  .catch((err) => {
    console.error("Postgres connection error:", err.message || err);
  });

module.exports = pool;