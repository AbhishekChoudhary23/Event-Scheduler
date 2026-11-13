const mysql = require('mysql2/promise');
require('dotenv').config();

// One shared pool for the whole app.
// timezone 'Z' = dates are stored and read as UTC, so the API always speaks ISO strings.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'eventscheduler',
  connectionLimit: 20,
  timezone: 'Z',
  ssl: {
    ca: fs.readFileSync("/etc/secrets/isrgrootx1.pem", "utf8"),
    minVersion: "TLSv1.2",
    rejectUnauthorized: true
  }
});

// Run a query and get the rows back. Use `?` placeholders for params.
const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

module.exports = { pool, query };
