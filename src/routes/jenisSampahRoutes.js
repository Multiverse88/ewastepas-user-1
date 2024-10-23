const express = require('express');
const router = express.Router();
const jenisSampahController = require('../controllers/jenisSampahController');

router.get('/jenis-sampah', jenisSampahController.getAllJenis);
router.post('/jenis-sampah', jenisSampahController.tambahJenis);

module.exports = router;
