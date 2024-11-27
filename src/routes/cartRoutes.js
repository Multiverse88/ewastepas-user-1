const express = require('express');
const router = express.Router();
const { addItemToCart, increaseCartItemQuantity, decreaseCartItemQuantity, removeItemFromCart } = require('../controllers/cartController');
const { getPickupInfo, schedulePickup } = require('../controllers/pickupController');



router.post('/add', addItemToCart);
router.put('/increase-quantity', increaseCartItemQuantity); // Endpoint untuk menambah jumlah
router.put('/decrease-quantity', decreaseCartItemQuantity); // Endpoint untuk mengurangi jumlah
router.delete('/remove', removeItemFromCart); // Endpoint untuk menghapus item
router.get('/pickup-info', getPickupInfo);
router.put('/pickup/schedule', schedulePickup);

module.exports = router; 