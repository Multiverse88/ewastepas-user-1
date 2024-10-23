const { pool } = require('../config/database');

class PenjemputanModel {
  async generateId() {
    const [rows] = await pool.query('SELECT MAX(CAST(SUBSTRING(id_penjemputan, 5) AS UNSIGNED)) as max_id FROM penjemputan');
    const maxId = rows[0].max_id || 0;
    return `PJMP${(maxId + 1).toString().padStart(6, '0')}`;
  }

  async tambahPenjemputan(jumlahSampah, tanggalPenjemputan, alamatPenjemputan, idUser, idDropbox) {
    const id = await this.generateId();
    const [result] = await pool.query(
      'INSERT INTO penjemputan (id_penjemputan, Jumlah_sampah, Tanggal_Penjemputan, Alamat_Penjemputan, Status_Penjemputan, Status_Pengiriman, Total_sampah, id_user, id_dropbox) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, jumlahSampah, tanggalPenjemputan, alamatPenjemputan, 'Menunggu', 'Belum Dikirim', jumlahSampah, idUser, idDropbox]
    );
    
    if (result.affectedRows > 0) {
      return this.getPenjemputan(id);
    } else {
      throw new Error('Gagal menambahkan penjemputan');
    }
  }

  async getPenjemputan(id) {
    const [rows] = await pool.query('SELECT * FROM penjemputan WHERE id_penjemputan = ?', [id]);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  }

  async getAllPenjemputan() {
    const [rows] = await pool.query('SELECT * FROM penjemputan ORDER BY Tanggal_Penjemputan DESC');
    return rows;
  }

  async updateStatusPenjemputan(id, statusPenjemputan) {
    const [result] = await pool.query(
      'UPDATE penjemputan SET Status_Penjemputan = ? WHERE id_penjemputan = ?',
      [statusPenjemputan, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Penjemputan tidak ditemukan');
    }
    return this.getPenjemputan(id);
  }

  async updateStatusPengiriman(id, statusPengiriman) {
    const [result] = await pool.query(
      'UPDATE penjemputan SET Status_Pengiriman = ? WHERE id_penjemputan = ?',
      [statusPengiriman, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Penjemputan tidak ditemukan');
    }
    return this.getPenjemputan(id);
  }

  async deletePenjemputan(id) {
    const [result] = await pool.query('DELETE FROM penjemputan WHERE id_penjemputan = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Penjemputan tidak ditemukan');
    }
    return true;
  }

  async getPenjemputanByUser(idUser) {
    const [rows] = await pool.query('SELECT * FROM penjemputan WHERE id_user = ? ORDER BY Tanggal_Penjemputan DESC', [idUser]);
    return rows;
  }

  async getPenjemputanByDropbox(idDropbox) {
    const [rows] = await pool.query('SELECT * FROM penjemputan WHERE id_dropbox = ? ORDER BY Tanggal_Penjemputan DESC', [idDropbox]);
    return rows;
  }
}

module.exports = new PenjemputanModel();
