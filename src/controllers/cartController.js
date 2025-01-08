const CartModel = require('../models/cartModel');
const WasteModel = require('../models/wasteModel');
const { pool } = require('../config/database');

exports.addItem = async (req, res) => {
  const { waste_id, quantity } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const waste = await WasteModel.getWaste(waste_id);
  if (!waste) {
    return res.status(400).json({ message: 'Waste ID tidak valid. Silakan pilih waste yang ada.' });
  }

  const community_id = req.user.id;

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    let pickup_id;

    if (pickupResult.length > 0) {
      pickup_id = pickupResult[0].pickup_id;
    } else {
      return res.status(400).json({ message: 'Anda harus mengisi profil terlebih dahulu.' });
    }

    const item = await CartModel.addItem(pickup_id, waste_id, quantity, community_id);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.decreaseItem = async (req, res) => {
  const { waste_id, quantity } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const waste = await WasteModel.getWaste(waste_id);
  if (!waste) {
    return res.status(400).json({ message: 'Waste ID tidak valid. Silakan pilih waste yang ada.' });
  }

  const community_id = req.user.id;

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    let pickup_id;

    if (pickupResult.length > 0) {
      pickup_id = pickupResult[0].pickup_id;
    } else {
      return res.status(400).json({ message: 'Anda harus mengisi profil terlebih dahulu.' });
    }

    const item = await CartModel.decreaseItem(pickup_id, waste_id, quantity);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewCart = async (req, res) => {
  const community_id = req.user.id;

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    
    if (pickupResult.length > 0) {
      const pickup_id = pickupResult[0].pickup_id;

      const items = await CartModel.getAllItems(pickup_id);
      res.status(200).json(items);
    } else {
      return res.status(404).json({ message: 'Pickup ID tidak ditemukan.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { waste_id } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    
    if (pickupResult.length > 0) {
      const pickup_id = pickupResult[0].pickup_id;

      const response = await CartModel.deleteItem(pickup_id, waste_id);
      res.status(200).json(response);
    } else {
      return res.status(404).json({ message: 'Pickup ID tidak ditemukan.' });
    }
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPickupId = async (req, res) => {
  const community_id = req.user.id; // Ambil community_id dari user yang sudah login

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    
    if (pickupResult.length > 0) {
      return res.status(200).json({ pickup_id: pickupResult[0].pickup_id });
    } else {
      return res.status(404).json({ message: 'Pickup ID tidak ditemukan.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCheckoutDetails = async (req, res) => {
  const community_id = req.user.id; // Ambil community_id dari pengguna yang login

  try {
    // Ambil alamat dari tabel community
    const [user] = await pool.query('SELECT address FROM community WHERE community_id = ?', [community_id]);
    if (!user.length) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const address = user[0].address;

    // Ambil pickup_id berdasarkan community_id
    const pickupResult = await CartModel.getPickupId(community_id);
    if (pickupResult.length === 0) {
      return res.status(404).json({ message: 'Pickup ID tidak ditemukan' });
    }

    const pickup_id = pickupResult[0].pickup_id;
    const items = await CartModel.getAllItems(pickup_id);

    // Hitung total E-Waste dan total points
    const totalEWaste = items.length;
    const totalPoints = items.reduce((acc, item) => acc + item.points, 0);

    res.status(200).json({
      address,
      items,
      totalEWaste,
      totalPoints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.schedulePickup = async (req, res) => {
  const { pickupDate, pickupTime } = req.body; // Ambil tanggal dan waktu dari request
  const community_id = req.user.id;

  try {
    // Ambil alamat dari tabel community
    const [user] = await pool.query('SELECT address FROM community WHERE community_id = ?', [community_id]);
    if (!user.length) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const pickupAddress = user[0].address;

    // Update jadwal penjemputan di tabel pickup_waste
    const [result] = await pool.query(
      'UPDATE pickup_waste SET pickup_date = ?, pickup_time = ?, pickup_address = ? WHERE community_id = ?',
      [pickupDate, pickupTime, pickupAddress, community_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Jadwal penjemputan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Jadwal penjemputan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.increaseQuantity = async (req, res) => {
  const { cart_id } = req.body; // Ambil cart_id dari body request
  try {
    // Logika untuk meningkatkan jumlah item di cart
    // Misalnya, ambil cart dari database dan tingkatkan quantity
    // const cart = await CartModel.findById(cart_id);
    // cart.quantity += 1;
    // await cart.save();

    res.status(200).json({
      success: true,
      message: 'Quantity increased successfully',
      // data: cart // Kembalikan data cart yang diperbarui jika perlu
    });
  } catch (error) {
    console.error('Error in increaseQuantity:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};