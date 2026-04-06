import pkg from "pg";
import dotenv from "dotenv";

console.log("DB FILE LOADED");

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional event listeners (will trigger after first real connection)
pool.on("connect", () => {
  console.log("🟢 Pool connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("🔴 PostgreSQL error:", err);
});

export const query = (text, params) => pool.query(text, params);

// 🔴 FORCE CONNECTION ON STARTUP
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("🟢 Connected to PostgreSQL");
  } catch (err) {
    console.error("🔴 Failed to connect to PostgreSQL:");
    console.error(err.message);
  }
})();