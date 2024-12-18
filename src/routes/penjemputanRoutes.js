const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// Get pickup by ID
router.get('/pickup/:pickup_id', pickupController.getPickupById);

// Update delivery status
router.put('/pickup/status', pickupController.updateDeliveryStatus);

// Get pickups by status
router.get('/pickup/by-status', pickupController.getPickupsByStatus);

module.exports = router;
