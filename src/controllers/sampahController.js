const sampahModel = require('../models/sampahModel');

class SampahController {
  async tambahSampah(req, res) {
    const { namaSampah, beratSampah, point, idJenis } = req.body;
    try {
      const sampah = await sampahModel.tambahSampah(namaSampah, beratSampah, point, idJenis);
      res.status(201).json({ message: 'Sampah berhasil ditambahkan', data: sampah });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllSampah(req, res) {
    try {
      const sampah = await sampahModel.getAllSampah();
      res.json({ data: sampah });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Tambahkan metode lain sesuai kebutuhan
}

module.exports = new SampahController();
