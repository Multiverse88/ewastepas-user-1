const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
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

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
  }

  // Generate URL untuk login Google
  generateAuthUrl() {
    try {
      const url = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.scopes,
        prompt: 'consent'
      });

      logger.info('URL autentikasi Google berhasil dibuat');
      return url;
    } catch (error) {
      logger.error(`Error generating Google auth URL: ${error.message}`);
      throw error;
    }
  }

  // Verifikasi token Google
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      logger.info(`Token Google berhasil diverifikasi untuk email: ${payload.email}`);
      return payload;
    } catch (error) {
      logger.error(`Error verifying Google token: ${error.message}`);
      throw error;
    }
  }

  // Mendapatkan token dari kode otorisasi
  async getTokenFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      logger.info('Token berhasil didapatkan dari kode otorisasi');
      return tokens;
    } catch (error) {
      logger.error(`Error getting tokens from code: ${error.message}`);
      throw error;
    }
  }

  // Mendapatkan informasi profil pengguna
  async getUserProfile(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2'
      });

      const { data } = await oauth2.userinfo.get();
      logger.info(`Informasi profil berhasil didapatkan untuk email: ${data.email}`);
      return data;
    } catch (error) {
      logger.error(`Error getting user profile: ${error.message}`);
      throw error;
    }
  }

  // Memperbarui token
  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      logger.info('Access token berhasil diperbarui');
      return credentials;
    } catch (error) {
      logger.error(`Error refreshing access token: ${error.message}`);
      throw error;
    }
  }

  // Validasi konfigurasi
  validateConfig() {
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      const error = new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      logger.error(error.message);
      throw error;
    }

    logger.info('Google Auth konfigurasi valid');
    return true;
  }

  // Revoke akses
  async revokeAccess(accessToken) {
    try {
      await this.oauth2Client.revokeToken(accessToken);
      logger.info('Akses Google berhasil dicabut');
      return true;
    } catch (error) {
      logger.error(`Error revoking access: ${error.message}`);
      throw error;
    }
  }
}

// Export instance tunggal dari service
module.exports = new GoogleAuthService();