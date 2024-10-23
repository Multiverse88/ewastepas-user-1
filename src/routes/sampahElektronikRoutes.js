const express = require('express');
const router = express.Router();
const sampahElektronikController = require('../controllers/sampahElektronikController');

router.get('/sampah-elektronik', sampahElektronikController.getAllSampahElektronik);
router.post('/sampah-elektronik', sampahElektronikController.tambahSampahElektronik);

module.exports = router;
