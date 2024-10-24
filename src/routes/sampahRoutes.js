const express = require('express');
const router = express.Router();
const sampahController = require('../controllers/sampahController');

router.post('/sampah', sampahController.tambahSampah);
router.get('/sampah', sampahController.getAllSampah);

module.exports = router;
