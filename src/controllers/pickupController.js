// src/controllers/pickupController.js
const { pool } = require('../config/database');

exports.getPickupInfo = async (req, res) => {
    const { pickup_id } = req.query;
    try {
        const [result] = await pool.query('SELECT pickup_address FROM pickup_waste WHERE pickup_id = ?', [pickup_id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Pickup not found' });
        }
        res.status(200).json({ address: result[0].pickup_address });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.schedulePickup = async (req, res) => {
    const { pickup_id, pickup_date } = req.body;

    // Ubah format tanggal ke 'YYYY-MM-DD'
    const formattedDate = new Date(pickup_date).toISOString().slice(0, 10); // Ambil hanya bagian tanggal

    try {
        await pool.query('UPDATE pickup_waste SET pickup_date = ? WHERE pickup_id = ?', [formattedDate, pickup_id]);
        res.status(200).json({ message: 'Pickup scheduled', pickup_id, pickup_date: formattedDate });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};