const { Delivery, Order, Driver, User } = require('../models');

// Get all deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Deliveries retrieved successfully',
      data: deliveries
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries',
      error: error.message
    });
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status', 'customerId']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ]
    });
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Delivery retrieved successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery',
      error: error.message
    });
  }
};

// Create new delivery
const createDelivery = async (req, res) => {
  try {
    const { order_id, driver_id } = req.body;
    
    // Validate required fields
    if (!order_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and driver ID are required'
      });
    }
    
    // Check if order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if driver exists
    const driver = await Driver.findByPk(driver_id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({ where: { order_id } });
    if (existingDelivery) {
      return res.status(409).json({
        success: false,
        message: 'Delivery already exists for this order'
      });
    }
    
    // Create delivery
    const newDelivery = await Delivery.create({
      order_id,
      driver_id
    });
    
    // Fetch the created delivery with associations
    const deliveryWithAssociations = await Delivery.findByPk(newDelivery.id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      data: deliveryWithAssociations
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery',
      error: error.message
    });
  }
};

// Update delivery
const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, driver_id } = req.body;
    
    // Check if delivery exists
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if order exists (if order_id is provided)
    if (order_id) {
      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Check if another delivery exists for this order (excluding current delivery)
      const existingDelivery = await Delivery.findOne({ 
        where: { 
          order_id,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingDelivery) {
        return res.status(409).json({
          success: false,
          message: 'Another delivery already exists for this order'
        });
      }
    }
    
    // Check if driver exists (if driver_id is provided)
    if (driver_id) {
      const driver = await Driver.findByPk(driver_id);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (order_id) updateData.order_id = order_id;
    if (driver_id) updateData.driver_id = driver_id;
    
    // Update delivery
    await delivery.update(updateData);
    
    // Return updated delivery with associations
    const updatedDelivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Delivery updated successfully',
      data: updatedDelivery
    });
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery',
      error: error.message
    });
  }
};

// Delete delivery
const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if delivery exists
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Delete delivery
    await delivery.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery',
      error: error.message
    });
  }
};

// Get deliveries by driver
const getDeliveriesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Check if driver exists
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    const deliveries = await Delivery.findAll({
      where: { driver_id: driverId },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Re-fetch driver with user to display proper name in message
    const driverWithUser = await Driver.findByPk(driverId, {
      include: [{ model: User, as: 'user', attributes: ['fullname'] }]
    });
    const driverName = driverWithUser && driverWithUser.user ? driverWithUser.user.fullname : `ID ${driverId}`;

    res.status(200).json({
      success: true,
      message: `Deliveries for driver '${driverName}' retrieved successfully`,
      data: deliveries
    });
  } catch (error) {
    console.error('Error fetching deliveries by driver:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries by driver',
      error: error.message
    });
  }
};

// Get delivery by order
const getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const delivery = await Delivery.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        },
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'phoneNumber', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email']
            }
          ]
        }
      ]
    });
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'No delivery found for this order'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Delivery for order retrieved successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Error fetching delivery by order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery by order',
      error: error.message
    });
  }
};

module.exports = {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  getDeliveriesByDriver,
  getDeliveryByOrder
};