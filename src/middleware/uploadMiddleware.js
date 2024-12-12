const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Membuat direktori uploads jika belum ada
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Membuat nama file yang unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file yang diizinkan
const fileFilter = (req, file, cb) => {
  // Daftar mime type yang diizinkan
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan format JPG, JPEG, PNG, atau GIF.'), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB
  }
});

// Middleware error handling untuk multer
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('photo');

  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Error dari multer
      logger.error(`Multer error: ${err.message}`);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'Ukuran file terlalu besar. Maksimal 5MB.'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'Error saat upload file.'
      });
    } else if (err) {
      // Error custom dari fileFilter
      logger.error(`Upload error: ${err.message}`);
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    
    // Jika tidak ada file yang diupload
    if (!req.file) {
      logger.info('Tidak ada file yang diupload');
      return res.status(400).json({
        status: 'error',
        message: 'Silakan pilih file untuk diupload.'
      });
    }

    logger.info(`File berhasil diupload: ${req.file.filename}`);
    next();
  });
};

// Fungsi untuk menghapus file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File berhasil dihapus: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error saat menghapus file: ${error.message}`);
  }
};

module.exports = {
  handleUpload,
  deleteFile,
  uploadDir
};