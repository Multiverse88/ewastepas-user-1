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

class UserModel {
  // Membuat user baru
  async createUser(userData) {
    try {
      const { name, email, password, otp_code, otp_expiry } = userData;
      const [result] = await pool.query(
        `INSERT INTO community (name, email, password, otp_code, otp_expiry, is_verified) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, password, otp_code, otp_expiry, 0]
      );
      
      logger.info(`User baru dibuat dengan ID: ${result.insertId}`);
      return result.insertId;
    } catch (error) {
      logger.error(`Error saat membuat user: ${error.message}`);
      throw error;
    }
  }

  // Mendapatkan user berdasarkan email
  async getUserByEmail(email) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM community WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      logger.error(`Error saat mengambil user by email: ${error.message}`);
      throw error;
    }
  }

  // Mendapatkan user berdasarkan ID
  async getUserById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM community WHERE community_id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      logger.error(`Error saat mengambil user by ID: ${error.message}`);
      throw error;
    }
  }

  // Update profil user
  async updateProfile(userId, userData) {
    try {
      const { name, email, phone, address, photo } = userData;
      const [result] = await pool.query(
        `UPDATE community 
         SET name = ?, email = ?, phone = ?, address = ?, photo = ?, 
             updated_at = CURRENT_TIMESTAMP
         WHERE community_id = ?`,
        [name, email, phone, address, photo, userId]
      );
      
      logger.info(`Profil user ${userId} berhasil diupdate`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error saat update profil: ${error.message}`);
      throw error;
    }
  }

  // Update password
  async updatePassword(userId, hashedPassword) {
    try {
      const [result] = await pool.query(
        `UPDATE community 
         SET password = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE community_id = ?`,
        [hashedPassword, userId]
      );
      
      logger.info(`Password user ${userId} berhasil diupdate`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error saat update password: ${error.message}`);
      throw error;
    }
  }

  // Update OTP
  async updateOtp(email, otpCode, otpExpiry) {
    try {
      const [result] = await pool.query(
        `UPDATE community 
         SET otp_code = ?, otp_expiry = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE email = ?`,
        [otpCode, otpExpiry, email]
      );
      
      logger.info(`OTP untuk email ${email} berhasil diupdate`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error saat update OTP: ${error.message}`);
      throw error;
    }
  }

  // Verifikasi user
  async verifyUser(email) {
    try {
      const [result] = await pool.query(
        `UPDATE community 
         SET is_verified = 1, otp_code = NULL, otp_expiry = NULL, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE email = ?`,
        [email]
      );
      
      logger.info(`User ${email} berhasil diverifikasi`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error saat verifikasi user: ${error.message}`);
      throw error;
    }
  }

  // Cek apakah email sudah ada
  async isEmailExist(email) {
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM community WHERE email = ?',
        [email]
      );
      return rows[0].count > 0;
    } catch (error) {
      logger.error(`Error saat cek email: ${error.message}`);
      throw error;
    }
  }

  // Hapus user (soft delete)
  async deleteUser(userId) {
    try {
      const [result] = await pool.query(
        `UPDATE community 
         SET is_active = 0, deleted_at = CURRENT_TIMESTAMP 
         WHERE community_id = ?`,
        [userId]
      );
      
      logger.info(`User ${userId} berhasil di-nonaktifkan`);
      return result.affectedRows > 0;
    } catch (error) {
      logger.error(`Error saat delete user: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserModel();