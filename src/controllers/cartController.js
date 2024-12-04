const CartModel = require('../models/cartModel');

exports.addItem = async (req, res) => {
  const { pickup_id, waste_id, quantity } = req.body;

  try {
    const item = await CartModel.addItem(pickup_id, waste_id, quantity);
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
