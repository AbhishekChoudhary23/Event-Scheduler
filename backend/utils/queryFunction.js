const { Client } = require('pg');
require('dotenv').config();

// -----------------------------    Connecting with Database     -----------------------------
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
});

client.connect().then(()=> console.log('connected pg'))

// -----------------------------    Query Function     -----------------------------
const queryFn = async (sql, params) => {
  try {
    const result = await client.query(sql, params);
    return result;
  } catch (err) {
    throw err;
  }
};


module.exports = queryFn;