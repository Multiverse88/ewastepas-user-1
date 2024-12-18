const { pool } = require('../config/database');

exports.getPickupInfo = async (req, res) => {
    const { pickup_id } = req.query;
    try {
        const result = await PickupModel.getPickupAddress(pickup_id);
        if (!result) {
            return res.status(404).json({ error: 'Pickup not found' });
        }
        res.status(200).json({ address: result.pickup_address });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.schedulePickup = async (req, res) => {
    const { pickup_id, pickup_date } = req.body;
    try {
        await PickupModel.schedulePickup(pickup_id, pickup_date);
        res.status(200).json({ message: 'Pickup scheduled', pickup_id, pickup_date });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

class PickupModel {
  static async updateDeliveryStatus(pickup_id, pickup_status) {
    const validStatuses = ['Menunggu Penjemputan', 'Dalam Perjalanan', ,'Sampah telah dijemput', 'Pesanan Selesai', 'Penjemputan Gagal'];
    
    if (!validStatuses.includes(pickup_status)) {
      throw new Error('Invalid delivery status');
    }

    const [result] = await pool.query(
      'UPDATE pickup_waste SET pickup_status = ?, updated_at = NOW() WHERE pickup_id = ?',
      [pickup_status, pickup_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Pickup not found');
    }

    return this.getPickupById(pickup_id);
  }

  static async getPickupById(pickup_id) {
    const [rows] = await pool.query(
      'SELECT * FROM pickup_waste WHERE pickup_id = ?',
      [pickup_id]
    );
    return rows[0];
  }

  static async getPickupsByStatus(pickup_status) {
    const [rows] = await pool.query(
      'SELECT * FROM pickup_waste WHERE pickup_status = ?',
      [pickup_status]
    );
    return rows;
  }
}

module.exports = PickupModel;