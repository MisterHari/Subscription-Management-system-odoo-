const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // Enable this if your hosted database requires SSL.
    // ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

pool.on("error", (error) => {
    console.error("Unexpected database error:", error);
    process.exit(-1);
});

module.exports = pool;
