const express = require('express');
const router = express.Router();
const kategoriSampahController = require('../controllers/kategoriSampahController');

router.get('/kategori-sampah', kategoriSampahController.getAllKategori);
router.post('/kategori-sampah', kategoriSampahController.tambahKategori);

module.exports = router;
