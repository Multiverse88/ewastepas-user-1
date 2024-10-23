class SampahElektronik {
    constructor(id, nama, kategori, deskripsi, gambar) {
      this.id = id;
      this.nama = nama;
      this.kategori = kategori;
      this.deskripsi = deskripsi;
      this.gambar = gambar;
    }
  }
  
  class SampahElektronikModel {
    constructor() {
      this.sampahElektronik = {};
    }
  
    tambahSampahElektronik(id, nama, kategori, deskripsi, gambar) {
      this.sampahElektronik[id] = new SampahElektronik(id, nama, kategori, deskripsi, gambar);
      return this.sampahElektronik[id];
    }
  
    getAllSampahElektronik() {
      return Object.values(this.sampahElektronik);
    }
  }
  
  module.exports = new SampahElektronikModel();