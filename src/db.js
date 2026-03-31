// ============================================================
// SCAEE — Configuração do banco de dados (MySQL)
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise'); // ← adiciona /promise

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  charset:  'utf8mb4',
  waitForConnections: true,
  connectionLimit:    10,
});

module.exports = pool;

