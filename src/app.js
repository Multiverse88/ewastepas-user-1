require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const wasteRoutes = require('./routes/wasteRoutes');
const wasteTypeRoutes = require('./routes/wasteTypeRoutes');
const pengirimanRoutes = require('./routes/pengirimanRoutes');
const { logger, checkApiKey, errorHandler } = require('./middleware/apiMiddleware');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const cartRoutes = require('./routes/cartRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Tambahkan ini sebelum middleware lainnya
app.set('trust proxy', 1); // Penting! Tambahkan ini untuk Vercel

// Test database connection
testConnection();

app.use(cors());
app.use(express.json());
app.use(logger);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route untuk mengelola API key tidak memerlukan autentikasi
app.use('/api/keys', apiKeyRoutes);

// Semua route lain memerlukan API key
app.use('/api', checkApiKey);
app.use('/api', pengirimanRoutes);
app.use('/api', wasteTypeRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api', wasteRoutes);
// app.use('/api/cart', cartRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/auth', authRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
