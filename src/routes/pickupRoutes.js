const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// Get pickup by ID
router.get('/:pickup_id', pickupController.getPickupById);

// Update pickup status
router.put('/update-status/:pickup_id', pickupController.updatePickupStatus);

// Get pickups by status
router.get('/by-status', pickupController.getPickupsByStatus);

module.exports = router;
