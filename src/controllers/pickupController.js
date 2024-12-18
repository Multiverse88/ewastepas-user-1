// src/controllers/pickupController.js
const { pool } = require('../config/database');
const PickupModel = require('../models/pickupModel');

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

exports.updateDeliveryStatus = async (req, res) => {
    const { pickup_id, status } = req.body;
    
    try {
        const pickup = await PickupModel.updateDeliveryStatus(pickup_id, status);
        res.status(200).json({
            message: 'Delivery status updated successfully',
            data: pickup
        });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(error.message.includes('Invalid delivery status') ? 400 : 500)
           .json({ error: error.message });
    }
};

exports.getPickupsByStatus = async (req, res) => {
    const { status } = req.query;
    
    try {
        const pickups = await PickupModel.getPickupsByStatus(status);
        res.status(200).json({ data: pickups });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getPickupById = async (req, res) => {
    const { pickup_id } = req.params;
    
    try {
        const pickup = await PickupModel.getPickupById(pickup_id);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }
        res.status(200).json({ data: pickup });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.updatePickupStatus = async (req, res) => {
    console.log('Route hit - updatePickupStatus');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    const { pickup_id } = req.params;
    const { pickup_status } = req.body;

    try {
        const updatedPickup = await PickupModel.updateDeliveryStatus(pickup_id, pickup_status);
        console.log('Updated pickup:', updatedPickup);
        res.status(200).json({
            message: 'Pickup status updated successfully',
            data: updatedPickup
        });
    } catch (error) {
        console.error('Error updating pickup status:', error);
        if (error.message === 'Invalid delivery status') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Pickup not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};