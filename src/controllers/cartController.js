// src/controllers/cartController.js
const CartModel = require('../models/cartModel');

exports.addItemToCart = async (req, res) => {
    const { waste_id, quantity } = req.body;
    try {
        const waste = await CartModel.getWaste(waste_id);
        if (!waste) {
            return res.status(404).json({ error: 'Waste not found' });
        }
        await CartModel.addItem(waste_id, quantity);
        res.status(201).json({ message: 'Item added to cart', waste_id, quantity });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.increaseCartItemQuantity = async (req, res) => {
    const { pickup_id, quantity } = req.body; // quantity harus positif
    try {
        const item = await CartModel.getItem(pickup_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        const newQuantity = item.quantity + quantity; // Menghitung jumlah baru
        await CartModel.updateItemQuantity(pickup_id, newQuantity);
        res.status(200).json({ message: 'Item quantity increased', pickup_id, quantity: newQuantity });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.decreaseCartItemQuantity = async (req, res) => {
    const { pickup_id, quantity } = req.body; // quantity harus positif
    try {
        const item = await CartModel.getItem(pickup_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        const newQuantity = item.quantity - quantity; // Menghitung jumlah baru

        if (newQuantity < 0) {
            return res.status(400).json({ error: 'Quantity cannot be negative' });
        }

        await CartModel.updateItemQuantity(pickup_id, newQuantity);
        res.status(200).json({ message: 'Item quantity decreased', pickup_id, quantity: newQuantity });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.removeItemFromCart = async (req, res) => {
    const { pickup_id } = req.body;
    try {
        const item = await CartModel.getItem(pickup_id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        await CartModel.removeItem(pickup_id);
        res.status(200).json({ message: 'Item removed from cart', pickup_id });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};