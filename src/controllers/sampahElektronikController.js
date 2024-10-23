const sampahElektronikModel = require('../models/sampahElektronikModel');

class SampahElektronikController {
  getAllSampahElektronik(req, res) {
    const sampahElektronik = sampahElektronikModel.getAllSampahElektronik();
    res.json({ data: sampahElektronik });
  }

  tambahSampahElektronik(req, res) {
    const { id, nama, kategori, deskripsi, gambar } = req.body;
    if (!id || !nama || !kategori || !deskripsi || !gambar) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    const sampah = sampahElektronikModel.tambahSampahElektronik(id, nama, kategori, deskripsi, gambar);
    res.status(201).json({ message: 'Sampah elektronik berhasil ditambahkan', data: sampah });
  }
}

module.exports = new SampahElektronikController();
