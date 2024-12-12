const nodemailer = require('nodemailer');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

// Konfigurasi logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Template paths
    this.templateDir = path.join(__dirname, '../templates/emails');
    
    // Memastikan direktori template ada
    if (!fs.existsSync(this.templateDir)) {
      fs.mkdirSync(this.templateDir, { recursive: true });
    }
  }

  // Membaca dan compile template HTML
  async getTemplate(templateName, data) {
    try {
      const filePath = path.join(this.templateDir, `${templateName}.html`);
      const template = fs.readFileSync(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      logger.error(`Error membaca template email: ${error.message}`);
      throw error;
    }
  }

  // Kirim email OTP
  async sendOtpEmail(email, otp) {
    try {
      const html = await this.getTemplate('otp', {
        otp,
        validityPeriod: '10 menit'
      });

      const mailOptions = {
        from: `"E-Waste Pas" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Kode Verifikasi OTP',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email OTP terkirim ke ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error mengirim email OTP: ${error.message}`);
      throw error;
    }
  }

  // Kirim email reset password
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const html = await this.getTemplate('reset-password', {
        resetUrl,
        validityPeriod: '1 jam'
      });

      const mailOptions = {
        from: `"E-Waste Pas" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Password',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email reset password terkirim ke ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error mengirim email reset password: ${error.message}`);
      throw error;
    }
  }

  // Kirim email selamat datang
  async sendWelcomeEmail(email, name) {
    try {
      const html = await this.getTemplate('welcome', {
        name,
        loginUrl: process.env.FRONTEND_URL
      });

      const mailOptions = {
        from: `"E-Waste Pas" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Selamat Datang di E-Waste Pas',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email selamat datang terkirim ke ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error mengirim email selamat datang: ${error.message}`);
      throw error;
    }
  }

  // Kirim notifikasi perubahan password
  async sendPasswordChangeNotification(email) {
    try {
      const html = await this.getTemplate('password-changed', {
        supportEmail: process.env.SUPPORT_EMAIL
      });

      const mailOptions = {
        from: `"E-Waste Pas" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Anda Telah Diubah',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email notifikasi perubahan password terkirim ke ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error mengirim email notifikasi perubahan password: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();