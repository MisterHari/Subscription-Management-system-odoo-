
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function setupDatabase() {
  // Connect to the default PostgreSQL database first.
  const adminPool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
    database: "postgres",
  });

  const databaseName = process.env.DB_NAME || "Brightloop";

  // Database names should be simple identifiers.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(databaseName)) {
    throw new Error("Invalid database name in .env");
  }

  try {
    const exists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (exists.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Database "${databaseName}" created.`);
    } else {
      console.log(`Database "${databaseName}" already exists.`);
    }
  } finally {
    await adminPool.end();
  }

  // Connect to the project database.
  const dbPool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
    database: databaseName,
  });

  try {
    const schema = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );

    const seed = fs.readFileSync(
      path.join(__dirname, "seed.sql"),
      "utf8"
    );

    await dbPool.query("BEGIN");

    try {
      await dbPool.query(schema);
      await dbPool.query(seed);
      await dbPool.query("COMMIT");
    } catch (error) {
      await dbPool.query("ROLLBACK");
      throw error;
    }

    console.log("Tables and sample data are ready!");
  } finally {
    await dbPool.end();
  }
}

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
});
