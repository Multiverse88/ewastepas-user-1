const { pool } = require('../config/database');
const WasteModel = require('./wasteModel');  // Pastikan jalur impor benar

class CartModel {
  // Menambahkan item ke keranjang
  async addItem(pickup_id, waste_id, quantity) {
    try {
      // Cek apakah item sudah ada di keranjang
      const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

      if (rows.length > 0) {
        // Jika item sudah ada, update quantity dan points
        const item = rows[0];
        const waste = await WasteModel.getWaste(waste_id);  // Menggunakan metode getWaste dari WasteModel
        const points = waste.point;

        const newQuantity = item.quantity + quantity;
        const newPoints = item.points + points * quantity;

        await pool.query('UPDATE pickup_detail SET quantity = ?, points = ? WHERE pickup_id = ? AND waste_id = ?', [newQuantity, newPoints, pickup_id, waste_id]);
        return this.getItem(pickup_id, waste_id);
      } else {
        // Jika item belum ada, tambahkan item baru
        const waste = await WasteModel.getWaste(waste_id);  // Menggunakan metode getWaste dari WasteModel
        const points = waste.point;

        await pool.query('INSERT INTO pickup_detail (pickup_id, waste_id, quantity, points) VALUES (?, ?, ?, ?)', [pickup_id, waste_id, quantity, points * quantity]);
        return this.getItem(pickup_id, waste_id);
      }
    } catch (error) {
      throw error;
    }
  }

  // Mengurangi item dari keranjang
  async decreaseItem(pickup_id, waste_id, quantity) {
    try {
      const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

      if (rows.length > 0) {
        const item = rows[0];
        const waste = await WasteModel.getWaste(waste_id);  // Menggunakan metode getWaste dari WasteModel
        const points = waste.point;

        let newQuantity = item.quantity - quantity;
        let newPoints = item.points - points * quantity;

        if (newQuantity <= 0) {
          await pool.query('DELETE FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);
        } else {
          await pool.query('UPDATE pickup_detail SET quantity = ?, points = ? WHERE pickup_id = ? AND waste_id = ?', [newQuantity, newPoints, pickup_id, waste_id]);
        }

        return this.getItem(pickup_id, waste_id);
      } else {
        throw new Error('Item not found in cart');
      }
    } catch (error) {
      throw error;
    }
  }

  // Mengambil item tertentu berdasarkan pickup_id dan waste_id
  async getItem(pickup_id, waste_id) {
    const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);
    return rows[0];
  }

  // Mengambil semua item dalam keranjang berdasarkan pickup_id
  async getAllItems(pickup_id) {
    const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ?', [pickup_id]);
    return rows;
  }

  // Menghapus item dari keranjang
  async deleteItem(pickup_id, waste_id) {
    try {
      const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

      if (rows.length > 0) {
        await pool.query('DELETE FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);
        return { message: 'Item deleted successfully' };
      } else {
        throw new Error('Item not found in cart');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartModel();
