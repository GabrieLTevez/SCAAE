// ============================================================
// SCAEE — Configuração do banco de dados (MySQL)
// ============================================================

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '!tevez123',
  database: 'dbscaee',
  charset:  'utf8mb4',
  waitForConnections: true,
  connectionLimit:    10,
});

module.exports = pool;
