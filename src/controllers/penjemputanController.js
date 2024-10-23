const PenjemputanModel = require('../models/penjemputanModel');

class PenjemputanController {
  async tambahPenjemputan(req, res) {
    try {
      const { jumlahSampah, tanggalPenjemputan, alamatPenjemputan, idUser, idDropbox } = req.body;
      const penjemputan = await PenjemputanModel.tambahPenjemputan(jumlahSampah, tanggalPenjemputan, alamatPenjemputan, idUser, idDropbox);
      res.status(201).json({ message: 'Penjemputan berhasil ditambahkan', data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPenjemputan(req, res) {
    try {
      const { id } = req.params;
      const penjemputan = await PenjemputanModel.getPenjemputan(id);
      if (penjemputan) {
        res.json({ data: penjemputan });
      } else {
        res.status(404).json({ error: 'Penjemputan tidak ditemukan' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllPenjemputan(req, res) {
    try {
      const penjemputan = await PenjemputanModel.getAllPenjemputan();
      res.json({ data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatusPenjemputan(req, res) {
    try {
      const { id } = req.params;
      const { statusPenjemputan } = req.body;
      const penjemputan = await PenjemputanModel.updateStatusPenjemputan(id, statusPenjemputan);
      res.json({ message: 'Status penjemputan berhasil diperbarui', data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatusPengiriman(req, res) {
    try {
      const { id } = req.params;
      const { statusPengiriman } = req.body;
      const penjemputan = await PenjemputanModel.updateStatusPengiriman(id, statusPengiriman);
      res.json({ message: 'Status pengiriman berhasil diperbarui', data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deletePenjemputan(req, res) {
    try {
      const { id } = req.params;
      await PenjemputanModel.deletePenjemputan(id);
      res.json({ message: 'Penjemputan berhasil dihapus' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPenjemputanByUser(req, res) {
    try {
      const { idUser } = req.params;
      const penjemputan = await PenjemputanModel.getPenjemputanByUser(idUser);
      res.json({ data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPenjemputanByDropbox(req, res) {
    try {
      const { idDropbox } = req.params;
      const penjemputan = await PenjemputanModel.getPenjemputanByDropbox(idDropbox);
      res.json({ data: penjemputan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PenjemputanController();
