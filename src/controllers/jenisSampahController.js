const jenisSampahModel = require('../models/jenisSampahModel');

class JenisSampahController {
  async getAllJenisSampah(req, res) {
    try {
      const jenisSampah = await jenisSampahModel.getAllJenisSampah();
      res.json({ data: jenisSampah });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async tambahJenisSampah(req, res) {
    const { namaJenis } = req.body;
    try {
      const jenisSampah = await jenisSampahModel.tambahJenisSampah(namaJenis);
      res.status(201).json({ message: 'Jenis sampah berhasil ditambahkan', data: jenisSampah });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Tambahkan metode lain sesuai kebutuhan
}

module.exports = new JenisSampahController();
