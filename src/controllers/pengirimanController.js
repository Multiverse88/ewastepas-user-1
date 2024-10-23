const pengirimanModel = require('../models/pengirimanModel');

class PengirimanController {
  tambahPengiriman(req, res) {
    const { id, status, lokasi } = req.body;
    if (!id || !status || !lokasi) {
      throw new Error('Semua field harus diisi');
    }
    const pengiriman = pengirimanModel.tambahPengiriman(id, status, lokasi);
    res.status(201).json({ message: 'Pengiriman berhasil ditambahkan', data: pengiriman });
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
}

module.exports = new PengirimanController();
