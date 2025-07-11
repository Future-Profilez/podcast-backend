const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ PostgreSQL CONNECTION FAILED:", err);
  } else {
    console.log("✅ Connected to PostgreSQL at:", result.rows[0].now);
  }
});

module.exports = pool;
