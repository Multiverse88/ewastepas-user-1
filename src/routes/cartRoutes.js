const express = require('express');
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/add', authenticate, cartController.addItem);
router.post('/decrease', cartController.decreaseItem);
router.get('/view/:pickup_id', cartController.viewCart);
router.delete('/delete', cartController.deleteItem);

module.exports = router;
