// MySQL connection settings, shared by the app (connection.js) and the setup script (setup.js).
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const isLocal = ['localhost', '127.0.0.1'].includes(host);

const dbConfig = {
  host,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Hosted databases such as TiDB Cloud refuse connections without TLS.
  // Their certificate is signed by a public authority (ISRG Root X1) that Node
  // already trusts, so no certificate file is needed. A local MySQL needs no TLS.
  ssl: isLocal ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
};

const dbName = process.env.DB_NAME || 'eventscheduler';

module.exports = { dbConfig, dbName };
