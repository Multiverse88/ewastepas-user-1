const express = require('express');
const router = express.Router();
const jenisSampahController = require('../controllers/jenisSampahController'); // Pastikan ini benar

router.post('/jenis-sampah', jenisSampahController.tambahJenisSampah);
router.get('/jenis-sampah', jenisSampahController.getAllJenisSampah); // Pastikan ini juga benar

module.exports = router;