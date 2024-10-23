const kategoriSampahModel = require('../models/kategoriSampahModel');

class KategoriSampahController {
  getAllKategori(req, res) {
    const kategori = kategoriSampahModel.getAllKategoriSampah();
    res.json({ data: kategori });
  }

  tambahKategori(req, res) {
    const { id, nama, gambar } = req.body;
    if (!id || !nama || !gambar) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    const kategori = kategoriSampahModel.tambahKategoriSampah(id, nama, gambar);
    res.status(201).json({ message: 'Kategori sampah berhasil ditambahkan', data: kategori });
  }
}

module.exports = new KategoriSampahController();
