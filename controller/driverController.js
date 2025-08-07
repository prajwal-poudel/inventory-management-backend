const { Driver, Delivery, Order, User } = require('../models');

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
        },
        {
          model: Delivery,
          as: 'deliveries',
          attributes: ['id', 'order_id', 'createdAt'],
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderDate', 'totalAmount']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Drivers retrieved successfully',
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message
    });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const driver = await Driver.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
        },
        {
          model: Delivery,
          as: 'deliveries',
          attributes: ['id', 'order_id', 'createdAt'],
          include: [
            {
              model: Order,
              as: 'order',
              attributes: ['id', 'orderDate', 'totalAmount', 'status']
            }
          ]
        }
      ]
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver retrieved successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver',
      error: error.message
    });
  }
};

// Create new driver
const createDriver = async (req, res) => {
  try {
    const { user_id, phoneNumber } = req.body;
    
    // Validate required fields
    if (!user_id || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'User ID and phone number are required'
      });
    }
    
    // Check if user exists and has driver role
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'User must have driver role'
      });
    }
    
    // Check if driver already exists for this user
    const existingDriver = await Driver.findOne({ where: { user_id } });
    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: 'Driver profile already exists for this user'
      });
    }
    
    // Check if driver with same phone number already exists
    const existingPhoneDriver = await Driver.findOne({ where: { phoneNumber } });
    if (existingPhoneDriver) {
      return res.status(409).json({
        success: false,
        message: 'Driver with this phone number already exists'
      });
    }
    
    // Create driver
    const newDriver = await Driver.create({
      user_id,
      phoneNumber
    });
    
    // Fetch the created driver with user information
    const driverWithUser = await Driver.findByPk(newDriver.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driverWithUser
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating driver',
      error: error.message
    });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, phoneNumber } = req.body;
    
    // Check if driver exists
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Check if user exists and has driver role (if user_id is provided)
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.role !== 'driver') {
        return res.status(400).json({
          success: false,
          message: 'User must have driver role'
        });
      }
      
      // Check if another driver exists for this user (excluding current driver)
      const existingDriver = await Driver.findOne({ 
        where: { 
          user_id,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingDriver) {
        return res.status(409).json({
          success: false,
          message: 'Driver profile already exists for this user'
        });
      }
    }
    
    // Check if phone number is being changed and if it already exists
    if (phoneNumber && phoneNumber !== driver.phoneNumber) {
      const existingDriver = await Driver.findOne({ where: { phoneNumber } });
      if (existingDriver) {
        return res.status(409).json({
          success: false,
          message: 'Driver with this phone number already exists'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (user_id) updateData.user_id = user_id;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Update driver
    await driver.update(updateData);
    
    // Return updated driver
    const updatedDriver = await Driver.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role']
        },
        {
          model: Delivery,
          as: 'deliveries',
          attributes: ['id', 'order_id', 'createdAt']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: updatedDriver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating driver',
      error: error.message
    });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if driver exists
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Check if driver has deliveries
    const deliveriesCount = await Delivery.count({ where: { driver_id: id } });
    if (deliveriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver that has deliveries. Please reassign or delete deliveries first.'
      });
    }
    
    // Delete driver
    await driver.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting driver',
      error: error.message
    });
  }
};

// Search drivers by name or phone
const searchDrivers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const drivers = await Driver.findAll({
      where: {
        phoneNumber: {
          [require('sequelize').Op.like]: `%${query}%`
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullname', 'email', 'role'],
          where: {
            fullname: {
              [require('sequelize').Op.like]: `%${query}%`
            }
          },
          required: false
        },
        {
          model: Delivery,
          as: 'deliveries',
          attributes: ['id', 'order_id', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Driver search completed successfully',
      data: drivers
    });
  } catch (error) {
    console.error('Error searching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching drivers',
      error: error.message
    });
  }
};

// Get drivers with delivery count
const getDriversWithDeliveryCount = async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      attributes: {
        include: [
          [
            require('sequelize').fn('COUNT', require('sequelize').col('deliveries.id')),
            'deliveryCount'
          ]
        ]
      },
      include: [
        {
          model: Delivery,
          as: 'deliveries',
          attributes: []
        }
      ],
      group: ['Driver.id'],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Drivers with delivery count retrieved successfully',
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers with delivery count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers with delivery count',
      error: error.message
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  searchDrivers,
  getDriversWithDeliveryCount
};