const pengirimanModel = require('../models/pengirimanModel');
const barcodeService = require('../services/barcodeService');

class PengirimanController {
  async tambahPengiriman(req, res) {
    const { status, lokasi } = req.body;
    if (!status || !lokasi) {
      throw new Error('Status dan lokasi harus diisi');
    }

    try {
      const id = pengirimanModel.generateId();
      const barcode = await barcodeService.generateBarcode(id);
      const pengiriman = pengirimanModel.tambahPengiriman(status, lokasi, barcode);
      res.status(201).json({ 
        message: 'Pengiriman berhasil ditambahkan', 
        data: pengiriman 
      });
    } catch (error) {
      throw new Error('Gagal menambahkan pengiriman: ' + error.message);
    }
  }

  getPengiriman(req, res) {
    const { id } = req.params;
    const pengiriman = pengirimanModel.getPengiriman(id);
    if (pengiriman) {
      res.json({ data: pengiriman });
    } else {
      throw new Error('Pengiriman tidak ditemukan');
    }
  }

  getAllPengiriman(req, res) {
    const pengiriman = pengirimanModel.getAllPengiriman();
    res.json({ data: pengiriman });
  }

  updatePengiriman(req, res) {
    const { id } = req.params;
    const { status, lokasi } = req.body;
    if (!status || !lokasi) {
      throw new Error('Status dan lokasi harus diisi');
    }
    const pengiriman = pengirimanModel.updatePengiriman(id, status, lokasi);
    if (pengiriman) {
      res.json({ message: 'Pengiriman berhasil diperbarui', data: pengiriman });
    } else {
      throw new Error('Pengiriman tidak ditemukan');
    }
  }

  deletePengiriman(req, res) {
    const { id } = req.params;
    const berhasil = pengirimanModel.deletePengiriman(id);
    if (berhasil) {
      res.json({ message: 'Pengiriman berhasil dihapus' });
    } else {
      throw new Error('Pengiriman tidak ditemukan');
    }
  }

  getBarcodeImage(req, res) {
    const { id } = req.params;
    const pengiriman = pengirimanModel.getPengiriman(id);
    if (pengiriman && pengiriman.barcode) {
      const barcodeBuffer = Buffer.from(pengiriman.barcode, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': barcodeBuffer.length
      });
      res.end(barcodeBuffer);
    } else {
      res.status(404).json({ error: 'Barcode tidak ditemukan' });
    }
  }
}

module.exports = new PengirimanController();
