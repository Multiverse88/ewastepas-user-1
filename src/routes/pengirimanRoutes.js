const express = require('express');
const router = express.Router();
const pengirimanController = require('../controllers/pengirimanController');

// Wrapper function untuk menangani error asynchronous
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/pengiriman', asyncHandler(pengirimanController.tambahPengiriman));
router.get('/pengiriman', asyncHandler(pengirimanController.getAllPengiriman));
router.get('/pengiriman/:id', asyncHandler(pengirimanController.getPengiriman));
router.put('/pengiriman/:id', asyncHandler(pengirimanController.updatePengiriman));
router.delete('/pengiriman/:id', asyncHandler(pengirimanController.deletePengiriman));
router.get('/pengiriman/:id/barcode', pengirimanController.getBarcodeImage);

module.exports = router;  // Pastikan ini ada
