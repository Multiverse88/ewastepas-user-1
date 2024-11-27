const PickupModel = require('../models/pickupModel');

exports.getPickupInfo = async (req, res) => {
    const { pickup_id } = req.query;
    try {
        const result = await PickupModel.getPickupAddress(pickup_id);
        if (!result) {
            return res.status(404).json({ error: 'Pickup not found' });
        }
        res.status(200).json({ address: result.pickup_address });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.schedulePickup = async (req, res) => {
    const { pickup_id, pickup_date } = req.body;
    try {
        await PickupModel.schedulePickup(pickup_id, pickup_date);
        res.status(200).json({ message: 'Pickup scheduled', pickup_id, pickup_date });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};