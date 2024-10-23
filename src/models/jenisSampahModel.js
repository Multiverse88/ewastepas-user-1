class JenisSampah {
    constructor(id, nama, deskripsi, gambar) {
      this.id = id;
      this.nama = nama;
      this.deskripsi = deskripsi;
      this.gambar = gambar;
    }
  }
  
  class JenisSampahModel {
    constructor() {
      this.jenisSampah = {};
    }
  
    tambahJenisSampah(id, nama, deskripsi, gambar) {
      this.jenisSampah[id] = new JenisSampah(id, nama, deskripsi, gambar);
      return this.jenisSampah[id];
    }
  
    getAllJenisSampah() {
      return Object.values(this.jenisSampah);
    }
  }
  
  module.exports = new JenisSampahModel();
