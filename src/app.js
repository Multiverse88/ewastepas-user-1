const express = require('express');
const cors = require('cors');
const pengirimanRoutes = require('./routes/pengirimanRoutes');
const jenisSampahRoutes = require('./routes/jenisSampahRoutes');
const kategoriSampahRoutes = require('./routes/kategoriSampahRoutes');
const { logger, checkApiKey, errorHandler } = require('./middleware/apiMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Gunakan checkApiKey untuk semua rute API
app.use('/api', checkApiKey);

// Routes
app.use('/api', pengirimanRoutes);
app.use('/api', jenisSampahRoutes);
app.use('/api', kategoriSampahRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
