class Pengiriman {
  constructor(id, status, lokasi, barcode) {
    this.id = id;
    this.status = status;
    this.lokasi = lokasi;
    this.barcode = barcode;
    this.tanggalDibuat = new Date();
    this.tanggalDiperbarui = new Date();
  }
}

class PengirimanModel {
  constructor() {
    this.pengiriman = {};
    this.counter = 1;
  }

  generateId() {
    const id = `SMPH${this.counter.toString().padStart(6, '0')}`;
    this.counter++;
    return id;
  }

  tambahPengiriman(status, lokasi, barcode) {
    const id = this.generateId();
    this.pengiriman[id] = new Pengiriman(id, status, lokasi, barcode);
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
