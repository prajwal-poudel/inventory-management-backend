const { Order, Customer, Product, Delivery, Inventory, User, Stock, ProductUnits, Unit, Driver, Manages } = require('../models');
const { Op } = require('sequelize');

// Helper function to get managed inventory IDs for admin users
const getManagedInventoryIds = async (userId, userRole) => {
  try {
    // Superadmin has access to all inventories
    if (userRole === 'superadmin') {
      return null; // null means no restriction
    }
    
    // Admin users can only access inventories they manage
    if (userRole === 'admin') {
      const managedInventories = await Manages.findAll({
        where: { user_id: userId },
        attributes: ['inventory_id']
      });
      
      return managedInventories.map(manage => manage.inventory_id);
    }
    
    // Other roles have no access
    return [];
  } catch (error) {
    console.error('Error getting managed inventory IDs:', error);
    throw new Error('Failed to get managed inventory IDs');
  }
};

// Helper function to validate inventory access for admin users
const validateInventoryAccess = async (userId, userRole, inventoryId) => {
  try {
    // Superadmin has access to all inventories
    if (userRole === 'superadmin') {
      return true;
    }
    
    // Admin users can only access inventories they manage
    if (userRole === 'admin') {
      const managesRecord = await Manages.findOne({
        where: {
          user_id: userId,
          inventory_id: inventoryId
        }
      });
      
      return !!managesRecord;
    }
    
    // Other roles have no access
    return false;
  } catch (error) {
    console.error('Error validating inventory access:', error);
    throw new Error('Failed to validate inventory access');
  }
};

// Helper function to calculate available stock for a product in an inventory with specific unit
const calculateAvailableStock = async (productId, inventoryId, unitId) => {
  try {
    // Get all stock records for this product, inventory, and unit combination
    const stockRecords = await Stock.findAll({
      where: {
        product_id: productId,
        inventory_id: inventoryId,
        unit_id: unitId
      },
      attributes: ['stockQuantity', 'in_out', 'method'],
      order: [['createdAt', 'ASC']]
    });

    if (!stockRecords || stockRecords.length === 0) {
      return {
        available: 0,
        totalIn: 0,
        totalOut: 0,
        records: 0
      };
    }

    let totalIn = 0;
    let totalOut = 0;

    // Calculate total stock in and out
    stockRecords.forEach(record => {
      if (record.in_out === 'in') {
        totalIn += parseFloat(record.stockQuantity);
      } else if (record.in_out === 'out') {
        totalOut += parseFloat(record.stockQuantity);
      }
    });

    const available = totalIn - totalOut;

    return {
      available: Math.max(0, available), // Ensure we don't return negative stock
      totalIn,
      totalOut,
      records: stockRecords.length
    };
  } catch (error) {
    console.error('Error calculating available stock:', error);
    throw new Error('Failed to calculate available stock');
  }
};

// Helper function to validate stock availability for order creation
const validateStockAvailability = async (productId, inventoryId, unitId, requestedQuantity) => {
  try {
    const stockAvailability = await calculateAvailableStock(productId, inventoryId, unitId);
    
    return {
      isAvailable: stockAvailability.available >= requestedQuantity,
      stockDetails: stockAvailability,
      shortfall: Math.max(0, requestedQuantity - stockAvailability.available)
    };
  } catch (error) {
    console.error('Error validating stock availability:', error);
    throw new Error('Failed to validate stock availability');
  }
};

// Helper function to get standard includes for order queries
const getOrderIncludes = () => [
  {
    model: Customer,
    as: 'customer',
    attributes: ['id', 'fullname', 'phoneNumber', 'address']
  },
  {
    model: Product,
    as: 'product',
    attributes: ['id', 'productName', 'description'],
    include: [
      {
        model: ProductUnits,
        as: 'productUnits',
        include: [
          {
            model: Unit,
            as: 'unit',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  },
  {
    model: Inventory,
    as: 'inventory',
    attributes: ['id', 'inventoryName', 'address', 'contactNumber']
  },
  {
    model: User,
    as: 'verifiedBy',
    attributes: ['id', 'fullname', 'email', 'role']
  },
  {
    model: Unit,
    as: 'unit',
    attributes: ['id', 'name']
  },
  {
    model: Delivery,
    as: 'delivery',
    attributes: ['id', 'order_id', 'driver_id', 'createdAt', 'updatedAt'],
    include: [
      {
        model: Driver,
        as: 'driver',
        attributes: ['id', 'user_id', 'phoneNumber'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullname', 'email']
          }
        ]
      }
    ]
  }
];

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get managed inventory IDs for role-based access control
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    // Build where clause based on user role
    let whereClause = {};
    if (managedInventoryIds !== null) {
      // Admin users - filter by managed inventories
      if (managedInventoryIds.length === 0) {
        // Admin with no managed inventories - return empty result
        return res.status(200).json({
          success: true,
          message: 'No orders found - you do not manage any inventories',
          data: []
        });
      }
      whereClause.inventoryId = { [Op.in]: managedInventoryIds };
    }
    // Superadmin - no where clause restriction (managedInventoryIds is null)
    
    const orders = await Order.findAll({
      where: whereClause,
      include: getOrderIncludes(),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const order = await Order.findByPk(id, {
      include: getOrderIncludes()
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate inventory access for admin users
    const hasAccess = await validateInventoryAccess(userId, userRole, order.inventoryId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage this inventory'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { customerId, productId, inventoryId, quantity, unit_id, status, paymentMethod, orderDate } = req.body;
    
    // Get the authenticated user from the request (set by auth middleware)
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate user role - only admin and superadmin can create orders
    if (!['admin', 'superadmin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin and superadmin users can create orders'
      });
    }
    
    // Validate inventory access for admin users
    const hasInventoryAccess = await validateInventoryAccess(userId, userRole, inventoryId);
    if (!hasInventoryAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage this inventory'
      });
    }
    
    // Validate required fields
    if (!customerId || !productId || !inventoryId || !quantity || !unit_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, Product ID, Inventory ID, quantity, and unit ID are required'
      });
    }
    
    // Validate quantity is positive
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid statuses are: pending, confirmed, shipped, delivered, cancelled'
        });
      }
    }
    
    // Validate payment method if provided
    if (paymentMethod) {
      const validPaymentMethods = ['cash', 'cheque', 'card', 'no'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Valid payment methods are: cash, cheque, card, no'
        });
      }
    }
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Validate unit exists
    const unitRecord = await Unit.findByPk(unit_id);
    if (!unitRecord) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Get the rate for this product-unit combination
    const productUnit = await ProductUnits.findOne({
      where: {
        product_id: productId,
        unit_id: unit_id
      },
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: `No rate found for product '${product.productName}' in unit '${unitRecord.name}'. Please set up pricing for this product-unit combination.`
      });
    }
    
    // Calculate total amount
    const totalAmount = parseFloat((productUnit.rate * quantity).toFixed(2));
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Check stock availability using the new helper function
    const stockValidation = await validateStockAvailability(productId, inventoryId, unit_id, quantity);
    
    if (stockValidation.stockDetails.records === 0) {
      return res.status(404).json({
        success: false,
        message: `No stock records found for product '${product.productName}' in inventory '${inventory.inventoryName}' with unit '${unitRecord.name}'`
      });
    }
    
    // Check if sufficient stock is available
    if (!stockValidation.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stockValidation.stockDetails.available} ${unitRecord.name}, Requested: ${quantity} ${unitRecord.name}, Shortfall: ${stockValidation.shortfall} ${unitRecord.name}`,
        stockDetails: {
          totalStockIn: stockValidation.stockDetails.totalIn,
          totalStockOut: stockValidation.stockDetails.totalOut,
          availableStock: stockValidation.stockDetails.available,
          requestedQuantity: quantity,
          shortfall: stockValidation.shortfall,
          unit: unitRecord.name
        }
      });
    }
    
    // Use database transaction to ensure data consistency
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      // Create order
      const newOrder = await Order.create({
        customerId,
        productId,
        inventoryId,
        orderVerifiedBy: userId,
        quantity,
        unit_id,
        status: status || 'pending',
        paymentMethod: paymentMethod || 'no',
        orderDate: orderDate || new Date(),
        totalAmount
      }, { transaction });
      
      // Create a stock record to track the order (stock going out)
      await Stock.create({
        stockQuantity: quantity, // Positive quantity with 'out' indicator
        method: 'order',
        in_out: 'out', // Properly indicate this is stock going out
        unit_id: unit_id,
        product_id: productId,
        inventory_id: inventoryId
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      // Fetch the created order with associations
      const orderWithAssociations = await Order.findByPk(newOrder.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'fullname', 'phoneNumber', 'address']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'productName', 'description'],
            include: [
              {
                model: ProductUnits,
                as: 'productUnits',
                include: [
                  {
                    model: Unit,
                    as: 'unit',
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          },
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['id', 'inventoryName', 'address', 'contactNumber']
          },
          {
            model: User,
            as: 'verifiedBy',
            attributes: ['id', 'fullname', 'email', 'role']
          }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully and stock updated',
        data: {
          order: orderWithAssociations,
          calculation: {
            rate: productUnit.rate,
            quantity: quantity,
            unit: unitRecord.name,
            totalAmount: totalAmount,
            formula: `${productUnit.rate} × ${quantity} = ${totalAmount}`
          },
          stockUpdate: {
            previousAvailableStock: stockValidation.stockDetails.available,
            currentAvailableStock: stockValidation.stockDetails.available - quantity,
            quantityUsed: quantity,
            unit: unitRecord.name,
            stockDetails: {
              totalStockIn: stockValidation.stockDetails.totalIn,
              totalStockOut: stockValidation.stockDetails.totalOut + quantity,
              newAvailableStock: stockValidation.stockDetails.available - quantity
            }
          }
        }
      });
      
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, productId, inventoryId, quantity, unit_id, status, paymentMethod, orderDate, totalAmount } = req.body;
    
    // Get the authenticated user from the request (set by auth middleware)
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate user role - only admin and superadmin can update orders
    if (!['admin', 'superadmin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin and superadmin users can update orders'
      });
    }
    
    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate inventory access for the existing order
    const hasCurrentInventoryAccess = await validateInventoryAccess(userId, userRole, order.inventoryId);
    if (!hasCurrentInventoryAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage the inventory for this order'
      });
    }
    
    // If inventoryId is being updated, validate access to the new inventory
    if (inventoryId && inventoryId !== order.inventoryId) {
      const hasNewInventoryAccess = await validateInventoryAccess(userId, userRole, inventoryId);
      if (!hasNewInventoryAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you do not manage the new inventory'
        });
      }
    }
    
    // Validate unit if provided
    if (unit_id) {
      const unit = await Unit.findByPk(unit_id);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Unit not found'
        });
      }
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid statuses are: pending, confirmed, shipped, delivered, cancelled'
        });
      }
    }
    
    // Validate payment method if provided
    if (paymentMethod) {
      const validPaymentMethods = ['cash', 'cheque', 'card', 'no'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Valid payment methods are: cash, cheque, card, no'
        });
      }
    }
    
    // Check if customer exists (if customerId is provided)
    if (customerId) {
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }
    
    // Check if product exists (if productId is provided)
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    }
    
    // Check if inventory exists (if inventoryId is provided)
    if (inventoryId) {
      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (customerId) updateData.customerId = customerId;
    if (productId) updateData.productId = productId;
    if (inventoryId) updateData.inventoryId = inventoryId;
    if (quantity) updateData.quantity = quantity;
    if (unit_id) updateData.unit_id = unit_id;
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (orderDate) updateData.orderDate = orderDate;
    if (totalAmount) updateData.totalAmount = totalAmount;
    
    // Update order
    await order.update(updateData);
    
    // Return updated order with associations
    const updatedOrder = await Order.findByPk(id, {
      include: getOrderIncludes()
    });
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate inventory access for admin users
    const hasAccess = await validateInventoryAccess(userId, userRole, order.inventoryId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage this inventory'
      });
    }
    
    // Delete order
    await order.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// Get orders by customer
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Get managed inventory IDs for role-based access control
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    // Build where clause based on user role
    let whereClause = { customerId };
    if (managedInventoryIds !== null) {
      // Admin users - filter by managed inventories
      if (managedInventoryIds.length === 0) {
        // Admin with no managed inventories - return empty result
        return res.status(200).json({
          success: true,
          message: 'No orders found - you do not manage any inventories',
          data: []
        });
      }
      whereClause.inventoryId = { [Op.in]: managedInventoryIds };
    }
    // Superadmin - no additional where clause restriction
    
    const orders = await Order.findAll({
      where: whereClause,
      include: getOrderIncludes(),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Orders for customer '${customer.fullname}' retrieved successfully`,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by customer',
      error: error.message
    });
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: pending, confirmed, shipped, delivered, cancelled'
      });
    }
    
    // Get managed inventory IDs for role-based access control
    const managedInventoryIds = await getManagedInventoryIds(userId, userRole);
    
    // Build where clause based on user role
    let whereClause = { status };
    if (managedInventoryIds !== null) {
      // Admin users - filter by managed inventories
      if (managedInventoryIds.length === 0) {
        // Admin with no managed inventories - return empty result
        return res.status(200).json({
          success: true,
          message: 'No orders found - you do not manage any inventories',
          data: []
        });
      }
      whereClause.inventoryId = { [Op.in]: managedInventoryIds };
    }
    // Superadmin - no additional where clause restriction
    
    const orders = await Order.findAll({
      where: whereClause,
      include: getOrderIncludes(),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Orders with status '${status}' retrieved successfully`,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by status',
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: pending, confirmed, shipped, delivered, cancelled'
      });
    }
    
    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Validate inventory access for admin users
    const hasAccess = await validateInventoryAccess(userId, userRole, order.inventoryId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage this inventory'
      });
    }
    
    // Update order status
    await order.update({ status });
    
    // Return updated order with associations
    const updatedOrder = await Order.findByPk(id, {
      include: getOrderIncludes()
    });
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Get orders by inventory
const getOrdersByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
      });
    }
    
    // Validate inventory access for admin users
    const hasAccess = await validateInventoryAccess(userId, userRole, inventoryId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you do not manage this inventory'
      });
    }
    
    const orders = await Order.findAll({
      where: { inventoryId },
      include: getOrderIncludes(),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Orders for inventory '${inventory.inventoryName}' retrieved successfully`,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders by inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by inventory',
      error: error.message
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStatus,
  getOrdersByInventory,
  updateOrderStatus,
  // Helper functions for stock management
  calculateAvailableStock,
  validateStockAvailability
};