const { pool } = require('../config/database');
const { PICKUP_STATUS, isValidStatus } = require('../enums/pickupStatus');

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
    const validStatuses = Object.values(PICKUP_STATUS);
    
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
    try {
        if (!isValidStatus(pickup_status)) {
            throw new Error(`Invalid pickup status: ${pickup_status}`);
        }

        const query = `
            SELECT * FROM pickup_waste 
            WHERE pickup_status = ?
            ORDER BY created_at DESC
        `;

        console.log('Executing query with status:', pickup_status);
        
        const [rows] = await pool.query(query, [pickup_status]);
        
        console.log(`Found ${rows.length} pickups with status: ${pickup_status}`);
        
        return rows;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
  }

  static async createPickup(pickupData) {
    try {
        const [result] = await pool.query(
            `INSERT INTO pickup_waste 
            (user_id, pickup_address, pickup_date, waste_amount, pickup_notes, pickup_status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                pickupData.user_id,
                pickupData.pickup_address,
                pickupData.pickup_date,
                pickupData.waste_amount || 0,
                pickupData.pickup_notes || '',
                pickupData.pickup_status
            ]
        );

        if (result.insertId) {
            return this.getPickupById(result.insertId);
        }
        throw new Error('Failed to create pickup');
    } catch (error) {
        console.error('Error in createPickup model:', error);
        throw error;
    }
  }

  static async deletePickup(pickup_id) {
    try {
        const [result] = await pool.query(
            'DELETE FROM pickup_waste WHERE pickup_id = ?',
            [pickup_id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Pickup not found');
        }

        return true;
    } catch (error) {
        console.error('Error in deletePickup model:', error);
        throw error;
    }
  }

  static async getPickupDetails(pickup_id) {
    try {
        const query = `
            SELECT 
                pd.pickup_id,
                pd.waste_id,
                w.waste_name,
                w.image,
                pd.quantity,
                pd.points
            FROM pickup_detail pd
            LEFT JOIN waste w ON pd.waste_id = w.waste_id
            WHERE pd.pickup_id = ?
        `;

        const [rows] = await pool.query(query, [pickup_id]);
        
        if (rows.length === 0) {
            throw new Error('Pickup details not found');
        }

        return rows;
    } catch (error) {
        console.error('Error in getPickupDetails:', error);
        throw error;
    }
  }

  static async getAllPickupDetails() {
    try {
        const query = `
            SELECT 
                pd.pickup_id,
                pd.waste_id,
                w.waste_name,
                w.image,
                pd.quantity,
                pd.points
            FROM pickup_detail pd
            LEFT JOIN waste w ON pd.waste_id = w.waste_id
        `;

        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error in getAllPickupDetails:', error);
        throw error;
    }
  }
}

module.exports = PickupModel;