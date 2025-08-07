const { Customer, Coordinate, Order } = require('../models');

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: Coordinate,
          as: 'coordinate',
          attributes: ['id', 'lat', 'lng']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Coordinate,
          as: 'coordinate',
          attributes: ['id', 'lat', 'lng']
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderDate', 'totalAmount', 'status']
        }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const { fullname, phoneNumber, address, coordinateId } = req.body;
    
    // Validate required fields
    if (!fullname || !phoneNumber || !address) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone number, and address are required'
      });
    }
    
    // Check if customer with same phone number already exists
    const existingCustomer = await Customer.findOne({ where: { phoneNumber } });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }
    
    // Check if coordinate exists (if coordinateId is provided)
    if (coordinateId) {
      const coordinate = await Coordinate.findByPk(coordinateId);
      if (!coordinate) {
        return res.status(404).json({
          success: false,
          message: 'Coordinate not found'
        });
      }
    }
    
    // Create customer
    const newCustomer = await Customer.create({
      fullname,
      phoneNumber,
      address,
      coordinateId
    });
    
    // Fetch the created customer with associations
    const customerWithAssociations = await Customer.findByPk(newCustomer.id, {
      include: [
        {
          model: Coordinate,
          as: 'coordinate',
          attributes: ['id', 'lat', 'lng']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customerWithAssociations
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, phoneNumber, address, coordinateId } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if phone number is being changed and if it already exists
    if (phoneNumber && phoneNumber !== customer.phoneNumber) {
      const existingCustomer = await Customer.findOne({ where: { phoneNumber } });
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this phone number already exists'
        });
      }
    }
    
    // Check if coordinate exists (if coordinateId is provided)
    if (coordinateId) {
      const coordinate = await Coordinate.findByPk(coordinateId);
      if (!coordinate) {
        return res.status(404).json({
          success: false,
          message: 'Coordinate not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (address) updateData.address = address;
    if (coordinateId !== undefined) updateData.coordinateId = coordinateId;
    
    // Update customer
    await customer.update(updateData);
    
    // Return updated customer with associations
    const updatedCustomer = await Customer.findByPk(id, {
      include: [
        {
          model: Coordinate,
          as: 'coordinate',
          attributes: ['id', 'lat', 'lng']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if customer has orders
    const ordersCount = await Order.count({ where: { customerId: id } });
    if (ordersCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer that has orders. Please delete orders first.'
      });
    }
    
    // Delete customer
    await customer.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Search customers by name or phone
const searchCustomers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const customers = await Customer.findAll({
      where: {
        [require('sequelize').Op.or]: [
          {
            fullname: {
              [require('sequelize').Op.like]: `%${query}%`
            }
          },
          {
            phoneNumber: {
              [require('sequelize').Op.like]: `%${query}%`
            }
          }
        ]
      },
      include: [
        {
          model: Coordinate,
          as: 'coordinate',
          attributes: ['id', 'lat', 'lng']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Customer search completed successfully',
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching customers',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers
};