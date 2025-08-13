const { Order, Customer, Product, Delivery, Inventory, User, Stock, ProductUnits, Unit } = require('../models');

// Helper function to get standard includes for order queries
const getOrderIncludes = () => [
  {
    model: Customer,
    as: 'customer',
    attributes: ['id', 'customerName', 'email', 'phone']
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
    attributes: ['id', 'deliveryDate', 'deliveryStatus', 'deliveryAddress']
  }
];

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
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
    
    const order = await Order.findByPk(id, {
      include: getOrderIncludes()
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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
    
    // Check stock availability
    const stockRecord = await Stock.findOne({
      where: {
        product_id: productId,
        inventory_id: inventoryId,
        unit_id: unit_id
      }
    });
    
    if (!stockRecord) {
      return res.status(404).json({
        success: false,
        message: `No stock record found for this product in the specified inventory with unit ${unitRecord.name}`
      });
    }
    
    // Check if sufficient stock is available
    if (stockRecord.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stockRecord.stockQuantity} ${unitRecord.name}, Requested: ${quantity} ${unitRecord.name}`
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
      
      // Update stock quantity
      await stockRecord.update({
        stockQuantity: stockRecord.stockQuantity - quantity
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      // Fetch the created order with associations
      const orderWithAssociations = await Order.findByPk(newOrder.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'customerName', 'email', 'phone']
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
            previousStock: stockRecord.stockQuantity + quantity,
            currentStock: stockRecord.stockQuantity,
            quantityUsed: quantity,
            unit: unitRecord.name
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
    
    // Check if order exists
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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
    
    // Check if customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const orders = await Order.findAll({
      where: { customerId },
      include: getOrderIncludes(),
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Orders for customer '${customer.customerName}' retrieved successfully`,
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
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: pending, confirmed, shipped, delivered, cancelled'
      });
    }
    
    const orders = await Order.findAll({
      where: { status },
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
    
    // Check if inventory exists
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found'
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
  updateOrderStatus
};