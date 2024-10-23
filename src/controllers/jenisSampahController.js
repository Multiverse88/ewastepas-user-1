const jenisSampahModel = require('../models/jenisSampahModel');

class JenisSampahController {
  getAllJenis(req, res) {
    const jenis = jenisSampahModel.getAllJenisSampah();
    res.json({ data: jenis });
  }

  tambahJenis(req, res) {
    const { id, nama, deskripsi, gambar } = req.body;
    if (!id || !nama || !deskripsi || !gambar) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    const jenis = jenisSampahModel.tambahJenisSampah(id, nama, deskripsi, gambar);
    res.status(201).json({ message: 'Jenis sampah berhasil ditambahkan', data: jenis });
  }
}

module.exports = new JenisSampahController();
