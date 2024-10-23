require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const pengirimanRoutes = require('./routes/pengirimanRoutes');
const jenisSampahRoutes = require('./routes/jenisSampahRoutes');
const kategoriSampahRoutes = require('./routes/kategoriSampahRoutes');
const { logger, checkApiKey, errorHandler } = require('./middleware/apiMiddleware');
const penjemputanRoutes = require('./routes/penjemputanRoutes');

const app = express();

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
app.use('/api', sampahElektronikRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
