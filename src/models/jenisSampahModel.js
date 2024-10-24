const { pool } = require('../config/database');

class JenisSampahModel {
  async generateId() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM jenis_sampah');
    const count = rows[0].count + 1; // Hitung jumlah jenis sampah dan tambahkan 1
    return `JN_${count.toString().padStart(2, '0')}`; // Format ID menjadi JN_01, JN_02, dst.
  }

  async tambahJenisSampah(namaJenis) {
    const idJenis = await this.generateId(); // Generate ID
    const [result] = await pool.query(
      'INSERT INTO jenis_sampah (id_jenis, Nama_JenisSampah, Created_at, Updated_at) VALUES (?, ?, NOW(), NOW())',
      [idJenis, namaJenis]
    );
    return this.getJenisSampah(idJenis);
  }

  async getJenisSampah(idJenis) {
    const [rows] = await pool.query('SELECT * FROM jenis_sampah WHERE id_jenis = ?', [idJenis]);
    return rows[0];
  }

  async getAllJenisSampah() {
    const [rows] = await pool.query('SELECT * FROM jenis_sampah');
    return rows;
  }

  // Tambahkan metode lain sesuai kebutuhan
}

module.exports = new JenisSampahModel();
