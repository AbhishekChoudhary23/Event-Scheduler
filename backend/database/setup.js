// Creates the database (if missing) and its tables. Run with: npm run db:setup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const dbName = process.env.DB_NAME || 'eventscheduler';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);
  await connection.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  // Upgrade a database created before events could be edited:
  // CREATE TABLE IF NOT EXISTS does not add new columns to a table that already exists.
  const [columns] = await connection.query("SHOW COLUMNS FROM events LIKE 'updatedAt'");
  if (!columns.length) {
    await connection.query(`
      ALTER TABLE events
        ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER createdAt,
        ADD KEY idx_events_creator (createdBy, deletedAt)`);
    console.log('Added events.updatedAt');
  }

  await connection.end();

  console.log(`Database "${dbName}" is ready`);
}

setup().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
