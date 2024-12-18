const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Joi = require('joi');
const winston = require('winston');
const { google } = require('googleapis');
const fs = require('fs');

// Konfigurasi logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

class AuthController {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    );
  }

  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      const schema = Joi.object({
        name: Joi.string().min(3).required().messages({
          'string.min': 'Nama harus minimal 3 karakter.',
          'any.required': 'Nama wajib diisi.',
        }),
        email: Joi.string().email().required().messages({
          'string.email': 'Email tidak valid.',
          'any.required': 'Email wajib diisi.',
        }),
        password: Joi.string()
          .min(8)
          .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'))
          .required()
          .messages({
            'string.min': 'Password harus minimal 8 karakter.',
            'string.pattern.base': 'Password harus mengandung huruf kecil, huruf besar, angka, dan karakter khusus.',
            'any.required': 'Password wajib diisi.',
          }),
        confirmPassword: Joi.ref('password'),
      });

      const { error } = schema.validate(req.body);
      if (error) {
        logger.error(`Validation error: ${error.details[0].message}`);
        return res.status(400).json({ message: error.details[0].message });
      }

      const [existingUser] = await pool.query('SELECT * FROM community WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        logger.error('Email sudah digunakan');
        return res.status(400).json({ message: 'Email sudah digunakan' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query(
        'INSERT INTO community (name, email, password, otp_code, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, otp, otpExpiry, 0]
      );

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verifikasi OTP',
        text: `Kode OTP Anda adalah: ${otp}`
      });

      logger.info('Registrasi berhasil!');
      res.status(201).json({ message: 'Registrasi berhasil! OTP telah dikirim ke email.' });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { email, otp_code } = req.body;

      if (!email || !otp_code) {
        logger.error('Email dan kode OTP wajib diisi.');
        return res.status(400).json({ message: 'Email dan kode OTP wajib diisi.' });
      }

      const [results] = await pool.query(
        'SELECT * FROM community WHERE email = ? AND otp_code = ?',
        [email, otp_code]
      );

      if (results.length === 0) {
        logger.error('OTP tidak valid atau email salah.');
        return res.status(400).json({ message: 'OTP tidak valid atau email salah.' });
      }

      const user = results[0];
      if (new Date(user.otp_expiry) < new Date()) {
        logger.error('OTP sudah kedaluwarsa.');
        return res.status(400).json({ message: 'OTP sudah kedaluwarsa.' });
      }

      await pool.query(
        'UPDATE community SET is_verified = 1, otp_code = NULL, otp_expiry = NULL WHERE email = ?',
        [email]
      );

      logger.info('Akun berhasil diverifikasi!');
      res.status(200).json({ message: 'Akun berhasil diverifikasi!' });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      const [results] = await pool.query('SELECT * FROM community WHERE email = ?', [email]);
      
      if (results.length === 0) {
        logger.error('Pengguna tidak ditemukan');
        return res.status(400).json({ message: 'Pengguna tidak ditemukan' });
      }

      const user = results[0];
      if (user.is_verified !== 1) {
        logger.error('Akun belum diverifikasi');
        return res.status(400).json({ message: 'Akun belum diverifikasi' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.error('Password tidak valid');
        return res.status(400).json({ message: 'Password tidak valid' });
      }

      const token = jwt.sign(
        { user: { id: user.community_id, email: user.email } },
        process.env.SECRET_KEY,
        { expiresIn: rememberMe ? '30d' : '1h' }
      );

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        expires: rememberMe 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 60 * 60 * 1000)
      };

      res.cookie('auth_token', token, cookieOptions);
      logger.info('Login berhasil');
      res.json({ message: 'Login berhasil', token });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const [results] = await pool.query('SELECT * FROM community WHERE email = ?', [email]);
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Email tidak ditemukan' });
      }

      const resetUrl = `http://localhost:5173/NewPasswordPage/${email}`;
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        text: `Klik link berikut untuk reset password: ${resetUrl}`
      });

      res.status(200).json({ message: 'Email reset password telah dikirim' });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: 'Password baru harus diisi' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE community SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );

      res.status(200).json({ message: 'Password berhasil diperbarui' });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
    }
  }

  async googleLogin(req, res) {
    const authUrl = this.oauth2Client.generateAuthUrl({
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });

    res.redirect(authUrl);
  }

  async googleCallback(req, res) {
    try {
      const { code } = req.query;
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ auth: this.oauth2Client, version: 'v2' });
      const { data } = await oauth2.userinfo.get();

      if (!data) {
        return res.status(404).json({ error: 'Informasi pengguna tidak ada' });
      }

      const [existingUser] = await pool.query(
        'SELECT * FROM community WHERE email = ?',
        [data.email]
      );

      let user;
      if (existingUser.length === 0) {
        const [result] = await pool.query(
          'INSERT INTO community (email, name, is_verified) VALUES (?, ?, ?)',
          [data.email, data.name, 1]
        );
        user = {
          community_id: result.insertId,
          email: data.email,
          name: data.name
        };
      } else {
        user = existingUser[0];
      }

      const token = jwt.sign(
        { user: { id: user.community_id, email: user.email } },
        process.env.SECRET_KEY,
        { expiresIn: '6h' }
      );

      res.status(200).json({ 
        message: 'Login Berhasil',
        token,
        user: {
          id: user.community_id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      logger.error('Error during Google callback:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { name, email, phone, address } = req.body;
      const userEmail = req.user.email;

      if (!name || !email || !phone || !address) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      let photoPath = req.file ? req.file.path : req.user.photo;

      await pool.query(
        'UPDATE community SET name = ?, email = ?, phone = ?, address = ?, photo = ? WHERE email = ?',
        [name, email, phone, address, photoPath, userEmail]
      );

      if (req.file && req.user.photo) {
        try {
          fs.unlinkSync(req.user.photo);
        } catch (error) {
          logger.error('Error deleting old photo:', error);
        }
      }

      res.status(200).json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'Password baru dan konfirmasi tidak cocok' });
      }

      const [user] = await pool.query(
        'SELECT * FROM community WHERE email = ?',
        [req.user.email]
      );

      const isMatch = await bcrypt.compare(currentPassword, user[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password saat ini salah' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE community SET password = ? WHERE community_id = ?',
        [hashedPassword, user[0].community_id]
      );

      res.status(200).json({ message: 'Password berhasil diubah' });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  logout(req, res) {
    res.clearCookie('auth_token');
    logger.info('User logged out successfully');
    res.status(200).json({ message: 'Berhasil logout' });
  }
}

module.exports = new AuthController();