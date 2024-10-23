const { pool } = require('../config/database');

class Pengiriman {
  constructor(id, status, lokasi, barcode) {
    this.id = id;
    this.status = status;
    this.lokasi = lokasi;
    this.barcode = barcode;
    this.tanggalDibuat = new Date();
    this.tanggalDiperbarui = new Date();
  }
}

class PengirimanModel { 
  constructor() {
    this.pengiriman = {};
    this.counter = 1;
  }

  async generateId() {
    const [rows] = await pool.query('SELECT MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)) as max_id FROM pengiriman');
    const maxId = rows[0].max_id || 0;
    return `SMPH${(maxId + 1).toString().padStart(6, '0')}`;
  }

  async tambahPengiriman(status, lokasi, barcode) {
    const id = await this.generateId();
    const [result] = await pool.query(
      'INSERT INTO pengiriman (id, status, lokasi, barcode) VALUES (?, ?, ?, ?)',
      [id, status, lokasi, barcode]
    );
    return this.getPengiriman(id);
  }

  async getPengiriman(id) {
    const [rows] = await pool.query('SELECT * FROM pengiriman WHERE id = ?', [id]);
    return rows[0];
  }

  async getAllPengiriman() {
    const [rows] = await pool.query('SELECT * FROM pengiriman');
    return rows;
  }

  async updatePengiriman(id, status, lokasi) {
    const [result] = await pool.query(
      'UPDATE pengiriman SET status = ?, lokasi = ? WHERE id = ?',
      [status, lokasi, id]
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return this.getPengiriman(id);
  }

  async deletePengiriman(id) {
    const [result] = await pool.query('DELETE FROM pengiriman WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new PengirimanModel();
