class Pengiriman {
  constructor(id, status, lokasi) {
    this.id = id;
    this.status = status;
    this.lokasi = lokasi;
    this.tanggalDibuat = new Date();
    this.tanggalDiperbarui = new Date();
  }
}

class PengirimanModel {
  constructor() {
    this.pengiriman = {};
  }

  tambahPengiriman(id, status, lokasi) {
    this.pengiriman[id] = new Pengiriman(id, status, lokasi);
    return this.pengiriman[id];
  }

  getPengiriman(id) {
    return this.pengiriman[id];
  }

  getAllPengiriman() {
    return Object.values(this.pengiriman);
  }

  updatePengiriman(id, status, lokasi) {
    if (this.pengiriman[id]) {
      this.pengiriman[id].status = status;
      this.pengiriman[id].lokasi = lokasi;
      this.pengiriman[id].tanggalDiperbarui = new Date();
      return this.pengiriman[id];
    }
    return null;
  }

  deletePengiriman(id) {
    if (this.pengiriman[id]) {
      delete this.pengiriman[id];
      return true;
    }
    return false;
  }
}

module.exports = new PengirimanModel();

