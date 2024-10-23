class KategoriSampah {
  constructor(id, nama, gambar) {
    this.id = id;
    this.nama = nama;
    this.gambar = gambar;
  }
}

class KategoriSampahModel {
  constructor() {
    this.kategoriSampah = {};
  }

  tambahKategoriSampah(id, nama, gambar) {
    this.kategoriSampah[id] = new KategoriSampah(id, nama, gambar);
    return this.kategoriSampah[id];
  }

  getAllKategoriSampah() {
    return Object.values(this.kategoriSampah);
  }
}

module.exports = new KategoriSampahModel();
