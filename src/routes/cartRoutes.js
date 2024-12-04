const express = require('express');
const cart1Controller = require('../controllers/cartController');
const router = express.Router();

router.post('/add', cart1Controller.addItem);
router.post('/decrease', cart1Controller.decreaseItem);
router.get('/view/:pickup_id', cart1Controller.viewCart);
router.delete('/delete', cart1Controller.deleteItem);

module.exports = router;
