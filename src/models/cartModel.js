const { pool } = require('../config/database');
const WasteModel = require('./wasteModel');

class CartModel {
  // Mendapatkan pickup_id berdasarkan community_id
  async getPickupId(community_id) {
    const [rows] = await pool.query('SELECT pickup_id FROM pickup_waste WHERE community_id = ?', [community_id]);
    return rows;
  }

  // Menambahkan item ke keranjang
  async addItem(pickup_id, waste_id, quantity, community_id) {
    try {
      // Cek apakah item sudah ada di keranjang
      const [rows] = await pool.query(
        'SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?',
        [pickup_id, waste_id]
      );

      if (rows.length > 0) {
        // Jika item sudah ada, update quantity dan points
        const item = rows[0];
        const waste = await WasteModel.getWaste(waste_id);
        const points = waste.point;

        const newQuantity = item.quantity + quantity;
        const newPoints = item.points + points * quantity;

        await pool.query(
          'UPDATE pickup_detail SET quantity = ?, points = ? WHERE pickup_id = ? AND waste_id = ?',
          [newQuantity, newPoints, pickup_id, waste_id]
        );
        return this.getItem(pickup_id, waste_id);
      } else {
        // Jika item belum ada, tambahkan item baru
        const waste = await WasteModel.getWaste(waste_id);
        const points = waste.point;

        await pool.query(
          'INSERT INTO pickup_detail (pickup_id, waste_id, quantity, points) VALUES (?, ?, ?, ?)',
          [pickup_id, waste_id, quantity, points * quantity]
        );
        return this.getItem(pickup_id, waste_id);
      }
    } catch (error) {
      throw error;
    }
  }

  // Mendapatkan item dari keranjang
  async getItem(pickup_id, waste_id) {
    const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);
    return rows[0];
  }

  // Mengurangi item dari keranjang
  async decreaseItem(pickup_id, waste_id, quantity) {
    try {
      const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

      if (rows.length > 0) {
        const item = rows[0];
        const waste = await WasteModel.getWaste(waste_id);
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
