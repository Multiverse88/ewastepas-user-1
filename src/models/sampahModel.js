const { pool } = require('../config/database');

class SampahModel {
  async generateId() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM sampah');
    const count = rows[0].count + 1; // Hitung jumlah sampah dan tambahkan 1
    return `SMPH_${count.toString().padStart(2, '0')}`; // Format ID menjadi SMPH_01, SMPH_02, dst.
  }

  async tambahSampah(namaSampah, beratSampah, point, idJenis) {
    const idSampah = await this.generateId(); // Generate ID
    const [result] = await pool.query(
      'INSERT INTO sampah (id_sampah, Nama_sampah, Berat_sampah, Point, id_jenis, Created_at, Updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [idSampah, namaSampah, beratSampah, point, idJenis]
    );
    return this.getSampah(idSampah);
  }

  async getSampah(idSampah) {
    const [rows] = await pool.query('SELECT * FROM sampah WHERE id_sampah = ?', [idSampah]);
    return rows[0];
  }

  async getAllSampah() {
    const [rows] = await pool.query('SELECT * FROM sampah');
    return rows;
  }

  // Tambahkan metode lain sesuai kebutuhan
}

module.exports = new SampahModel();
