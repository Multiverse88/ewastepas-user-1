const CartModel = require('../models/cartModel');
const WasteModel = require('../models/wasteModel');

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
  const pickup_date = new Date().toISOString().slice(0, 10);
  const pickup_address = "Default Address";

  try {
    const pickupResult = await CartModel.getPickupId(community_id);
    let pickup_id;

    if (pickupResult.length > 0) {
      pickup_id = pickupResult[0].pickup_id;
    } else {
      return res.status(400).json({ message: 'Tidak ada pickup_id yang tersedia. Silakan buat pickup terlebih dahulu.' });
    }

    const item = await CartModel.addItem(pickup_id, waste_id, quantity, community_id, pickup_date, pickup_address);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.decreaseItem = async (req, res) => {
  const { pickup_id, waste_id, quantity } = req.body;

  try {
    const item = await CartModel.decreaseItem(pickup_id, waste_id, quantity);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewCart = async (req, res) => {
  const { pickup_id } = req.params;

  try {
    const items = await CartModel.getAllItems(pickup_id);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { pickup_id, waste_id } = req.body;

  try {
    const response = await CartModel.deleteItem(pickup_id, waste_id);
    res.status(200).json(response);
  } catch (error) {
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
