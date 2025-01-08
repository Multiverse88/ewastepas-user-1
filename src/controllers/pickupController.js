// src/controllers/pickupController.js
const PickupModel = require('../models/pickupModel');
const { PICKUP_STATUS, isValidStatus } = require('../enums/pickupStatus');

class PickupController {
    async getAllPickups(req, res) {
        try {
            const pickups = await PickupModel.getAllPickups();
            res.status(200).json({
                success: true,
                data: pickups
            });
        } catch (error) {
            console.error('Error in getAllPickups:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getPickupsByStatus(req, res) {
        const { status } = req.query;
        
        try {
            console.log('Request received:', {
                status,
                query: req.query,
                availableStatuses: PICKUP_STATUS
            });

            if (!status) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Status parameter is required',
                    availableStatuses: PICKUP_STATUS
                });
            }

            if (!isValidStatus(status)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid status value',
                    providedStatus: status,
                    availableStatuses: PICKUP_STATUS
                });
            }

            const pickups = await PickupModel.getPickupsByStatus(status);
            
            return res.status(200).json({ 
                success: true,
                data: pickups,
                status: status
            });
        } catch (error) {
            console.error('Error in getPickupsByStatus:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getPickupById(req, res) {
        const { pickup_id } = req.params;
        try {
            const pickup = await PickupModel.getPickupById(pickup_id);
            if (!pickup) {
                return res.status(404).json({
                    success: false,
                    error: 'Pickup not found'
                });
            }
            res.status(200).json({
                success: true,
                data: pickup
            });
        } catch (error) {
            console.error('Error in getPickupById:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async updatePickupStatus(req, res) {
        const { pickup_id } = req.params;
        const { pickup_status } = req.body;

        try {
            const updatedPickup = await PickupModel.updateDeliveryStatus(pickup_id, pickup_status);
            res.status(200).json({
                success: true,
                message: 'Pickup status updated successfully',
                data: updatedPickup
            });
        } catch (error) {
            console.error('Error in updatePickupStatus:', error);
            if (error.message === 'Invalid delivery status') {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getPickupsByUser(req, res) {
        const { user_id } = req.params;
        try {
            const pickups = await PickupModel.getPickupsByUser(user_id);
            res.status(200).json({
                success: true,
                data: pickups
            });
        } catch (error) {
            console.error('Error in getPickupsByUser:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async createPickup(req, res) {
        try {
            const { 
                user_id, 
                pickup_address, 
                pickup_date,
                waste_amount,
                pickup_notes
            } = req.body;

            // Validasi input
            if (!user_id || !pickup_address || !pickup_date) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }

            const newPickup = await PickupModel.createPickup({
                user_id,
                pickup_address,
                pickup_date,
                waste_amount,
                pickup_notes,
                pickup_status: PICKUP_STATUS.WAITING // Status default
            });

            res.status(201).json({
                success: true,
                message: 'Pickup created successfully',
                data: newPickup
            });
        } catch (error) {
            console.error('Error in createPickup:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async deletePickup(req, res) {
        const { pickup_id } = req.params;
        try {
            await PickupModel.deletePickup(pickup_id);
            res.status(200).json({
                success: true,
                message: 'Pickup deleted successfully'
            });
        } catch (error) {
            console.error('Error in deletePickup:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getPickupDetails(req, res) {
        const { pickup_id } = req.params;
        
        try {
            const pickupDetails = await PickupModel.getPickupDetails(pickup_id);
            
            return res.status(200).json({
                success: true,
                data: pickupDetails
            });
        } catch (error) {
            console.error('Error in getPickupDetails:', error);
            if (error.message === 'Pickup details not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Pickup details not found'
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getAllPickupDetails(req, res) {
        try {
            const allPickupDetails = await PickupModel.getAllPickupDetails();
            
            return res.status(200).json({
                success: true,
                data: allPickupDetails
            });
        } catch (error) {
            console.error('Error in getAllPickupDetails:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    async getCourierInfo(req, res) {
        const { pickup_id } = req.params;
        
        try {
            const courierInfo = await PickupModel.getCourierInfo(pickup_id);
            
            if (!courierInfo.courier_id) {
                return res.status(404).json({ 
                    error: 'No courier assigned to this pickup yet'
                });
            }

            res.status(200).json(courierInfo);
        } catch (error) {
            console.error('Error getting courier info:', error);
            res.status(500).json({ 
                error: 'Failed to get courier information',
                details: error.message 
            });
        }
    }
}

module.exports = new PickupController();