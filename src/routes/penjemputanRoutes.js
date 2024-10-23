const express = require('express');
const router = express.Router();
const PenjemputanController = require('../controllers/penjemputanController');

router.post('/penjemputan', PenjemputanController.tambahPenjemputan);
router.get('/penjemputan', PenjemputanController.getAllPenjemputan);
router.get('/penjemputan/:id', PenjemputanController.getPenjemputan);
router.put('/penjemputan/:id/status-penjemputan', PenjemputanController.updateStatusPenjemputan);
router.put('/penjemputan/:id/status-pengiriman', PenjemputanController.updateStatusPengiriman);
router.delete('/penjemputan/:id', PenjemputanController.deletePenjemputan);
router.get('/penjemputan/user/:idUser', PenjemputanController.getPenjemputanByUser);
router.get('/penjemputan/dropbox/:idDropbox', PenjemputanController.getPenjemputanByDropbox);

module.exports = router;
