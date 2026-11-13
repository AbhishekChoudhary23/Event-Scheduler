const mysql = require('mysql2/promise');
const { dbConfig, dbName } = require('./config');

// One shared pool for the whole app.
// timezone 'Z' = dates are stored and read as UTC, so the API always speaks ISO strings.
const pool = mysql.createPool({
  ...dbConfig,
  database: dbName,
  connectionLimit: 20,
  timezone: 'Z',
});

// Run a query and get the rows back. Use `?` placeholders for params.
const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

module.exports = { pool, query };
