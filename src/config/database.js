const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '34.57.36.146/phpmyadmin/',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password_baru_anda',
  database: process.env.DB_NAME || 'hikel_lila',
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Berhasil terhubung ke database MySQL');
    connection.release();
  } catch (error) {
    console.error('Gagal terhubung ke database MySQL:', error);
  }
}

module.exports = {
  pool,
  testConnection
};

