const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
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

const authenticate = async (req, res, next) => {
  try {
    // Cek token dari header Authorization atau cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

    if (!token) {
      logger.error('Token tidak disertakan');
      return res.status(401).json({ 
        status: 'error',
        message: 'Akses ditolak. Token tidak disertakan.' 
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.user) {
      logger.error('Token tidak valid atau tidak memiliki data user');
      return res.status(401).json({ 
        status: 'error',
        message: 'Token tidak valid.' 
      });
    }

    // Cek apakah user masih ada di database
    const [user] = await pool.query(
      'SELECT community_id, email, name, is_verified FROM community WHERE community_id = ?', 
      [decoded.user.id]
    );

    if (!user.length) {
      logger.error(`User dengan ID ${decoded.user.id} tidak ditemukan`);
      return res.status(401).json({ 
        status: 'error',
        message: 'User tidak ditemukan.' 
      });
    }

    if (!user[0].is_verified) {
      logger.error(`User ${decoded.user.email} belum terverifikasi`);
      return res.status(401).json({ 
        status: 'error',
        message: 'Akun belum terverifikasi.' 
      });
    }

    // Tambahkan data user ke request
    req.user = {
      id: user[0].community_id,
      email: user[0].email,
      name: user[0].name
    };

    logger.info(`User ${req.user.email} berhasil diautentikasi`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.error('Token telah kadaluarsa');
      return res.status(401).json({ 
        status: 'error',
        message: 'Token telah kadaluarsa.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.error('Token tidak valid');
      return res.status(401).json({ 
        status: 'error',
        message: 'Token tidak valid.' 
      });
    }

    logger.error(`Error pada autentikasi: ${error.message}`);
    return res.status(500).json({ 
      status: 'error',
      message: 'Terjadi kesalahan pada server.' 
    });
  }
};

module.exports = authenticate;