const bwipjs = require('bwip-js');

class BarcodeService {
  async generateBarcode(text) {
    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128',       // Barcode type
        text: text,            // Text to encode
        scale: 3,              // 3x scaling factor
        height: 10,            // Bar height, in millimeters
        includetext: true,     // Show human-readable text
        textxalign: 'center',  // Always center the text
      });
      return png.toString('base64');
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw new Error('Gagal menghasilkan barcode');
    }
  }
}

module.exports = new BarcodeService();

