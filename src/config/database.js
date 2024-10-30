const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '34.57.36.146', // Pastikan ini adalah 'localhost'
  user: process.env.DB_USER || 'haikal', // Sesuaikan dengan username MySQL Anda
  password: process.env.DB_PASSWORD || 'My$ecureP@ssw0rd123', // Sesuaikan dengan password MySQL Anda
  database: process.env.DB_NAME || 'hikel_lila', // Pastikan nama database ini benar
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
