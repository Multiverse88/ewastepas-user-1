const CartModel = require('../models/cartModel');

exports.addItem = async (pickup_id, waste_id, quantity) => {
  // Cek apakah item sudah ada di keranjang
  const existingItem = await db.query('SELECT * FROM cart WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

  if (existingItem.length > 0) {
    // Jika item sudah ada, update quantity
    const newQuantity = existingItem[0].quantity + quantity;
    await db.query('UPDATE cart SET quantity = ? WHERE pickup_id = ? AND waste_id = ?', [newQuantity, pickup_id, waste_id]);
    return { pickup_id, waste_id, quantity: newQuantity }; // Kembalikan item yang diperbarui
  } else {
    // Jika item belum ada, tambahkan item baru
    const result = await db.query('INSERT INTO cart (pickup_id, waste_id, quantity) VALUES (?, ?, ?)', [pickup_id, waste_id, quantity]);
    return { pickup_id, waste_id, quantity }; // Kembalikan item yang baru ditambahkan
  }
};


exports.decreaseItem = async (pickup_id, waste_id, quantity) => {
  const existingItem = await db.query('SELECT * FROM cart WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);

  if (existingItem.length > 0) {
    const newQuantity = existingItem[0].quantity - quantity;
    if (newQuantity <= 0) {
      // Jika quantity menjadi 0 atau kurang, hapus item
      await db.query('DELETE FROM cart WHERE pickup_id = ? AND waste_id = ?', [pickup_id, waste_id]);
      return { message: 'Item deleted' };
    } else {
      // Update quantity jika masih ada
      await db.query('UPDATE cart SET quantity = ? WHERE pickup_id = ? AND waste_id = ?', [newQuantity, pickup_id, waste_id]);
      return { pickup_id, waste_id, quantity: newQuantity }; // Kembalikan item yang diperbarui
    }
  } else {
    throw new Error('Item not found in cart');
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
