// src/models/cartModel.js
const { pool } = require('../config/database');

class CartModel {
    async addItem(waste_id, quantity) {
        const [result] = await pool.query('INSERT INTO pickup_detail (waste_id, quantity) VALUES (?, ?)', [waste_id, quantity]);
        return result;
    }

    async updateItemQuantity(pickup_id, quantity) {
        const [result] = await pool.query('UPDATE pickup_detail SET quantity = ? WHERE pickup_id = ?', [quantity, pickup_id]);
        return result;
    }

    async removeItem(pickup_id) {
        const [result] = await pool.query('DELETE FROM pickup_detail WHERE pickup_id = ?', [pickup_id]);
        return result;
    }

    async getItem(pickup_id) {
        const [rows] = await pool.query('SELECT * FROM pickup_detail WHERE pickup_id = ?', [pickup_id]);
        return rows[0];
    }

    async getWaste(waste_id) {
        const [rows] = await pool.query('SELECT * FROM waste WHERE waste_id = ?', [waste_id]);
        return rows[0];
    }
}

module.exports = new CartModel();