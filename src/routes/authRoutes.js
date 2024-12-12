const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { handleUpload } = require('../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Konfigurasi logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Rate limiter untuk registrasi
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // maksimal 5 request per IP
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan registrasi. Silakan coba lagi dalam 1 jam.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 percobaan
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware untuk logging requests
const logRequest = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

// Middleware error handler
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server.'
  });
};

// Terapkan middleware logging untuk semua routes
router.use(logRequest);

// Routes untuk autentikasi
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    await AuthController.register(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    await AuthController.verifyOtp(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    await AuthController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    await AuthController.forgotPassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password/:email', async (req, res, next) => {
  try {
    await AuthController.resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

// Routes yang memerlukan autentikasi
router.use(authenticate); // Middleware autentikasi untuk routes di bawah ini

router.put('/profile', handleUpload, async (req, res, next) => {
  try {
    await AuthController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', async (req, res, next) => {
  try {
    await AuthController.changePassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  try {
    AuthController.logout(req, res);
  } catch (error) {
    next(error);
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  try {
    AuthController.googleLogin(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/google/callback', async (req, res, next) => {
  try {
    await AuthController.googleCallback(req, res);
  } catch (error) {
    next(error);
  }
});

// Terapkan error handler
router.use(errorHandler);

module.exports = router;