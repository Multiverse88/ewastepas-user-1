const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// Ubah path menjadi lebih sederhana
router.get('/by-status', pickupController.getPickupsByStatus);
router.get('/user/:user_id', pickupController.getPickupsByUser);
router.get('/:pickup_id', pickupController.getPickupById);
router.post('/', pickupController.createPickup);
router.put('/status/:pickup_id', pickupController.updatePickupStatus);
router.delete('/:pickup_id', pickupController.deletePickup);

// Routes untuk pickup details
router.get('/details/:pickup_id', pickupController.getPickupDetails);
router.get('/details', pickupController.getAllPickupDetails);

module.exports = router;
