const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Inventory Management System API',
    description: 'Complete API documentation for the Inventory Management System',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@inventorymanagement.com'
    }
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Users',
      description: 'User management operations'
    },
    {
      name: 'Categories',
      description: 'Product category management'
    },
    {
      name: 'Products',
      description: 'Product management operations'
    },
    {
      name: 'Inventory',
      description: 'Inventory location management'
    },
    {
      name: 'Stock',
      description: 'Stock management operations'
    },
    {
      name: 'Customers',
      description: 'Customer management operations'
    },
    {
      name: 'Orders',
      description: 'Order management operations'
    },
    {
      name: 'Drivers',
      description: 'Driver management operations'
    },
    {
      name: 'Deliveries',
      description: 'Delivery management operations'
    },
    {
      name: 'Units',
      description: 'Unit of measurement management'
    },
    {
      name: 'Product Units',
      description: 'Product unit pricing management'
    }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token in format: Bearer <token>'
    }
  },
  definitions: {
    User: {
      id: 1,
      fullname: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    UserLogin: {
      email: 'john@example.com',
      password: 'password123'
    },
    UserCreate: {
      fullname: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'admin'
    },
    Category: {
      id: 1,
      categoryName: 'Electronics',
      description: 'Electronic products',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Product: {
      id: 1,
      productName: 'Laptop',
      description: 'High-performance laptop',
      categoryId: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Inventory: {
      id: 1,
      inventoryName: 'Main Warehouse',
      address: '123 Main St',
      contactNumber: '+1234567890',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Stock: {
      id: 1,
      productId: 1,
      inventoryId: 1,
      stockQuantity: 100,
      unit: 'KG',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Customer: {
      id: 1,
      customerName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567890',
      address: '456 Oak St',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Order: {
      id: 1,
      customerId: 1,
      productId: 1,
      inventoryId: 1,
      orderVerifiedBy: 1,
      quantity: 10,
      unit: 'KG',
      status: 'pending',
      paymentMethod: 'cash',
      orderDate: '2024-01-01T00:00:00.000Z',
      totalAmount: 1000.00,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Driver: {
      id: 1,
      driverName: 'Mike Johnson',
      licenseNumber: 'DL123456',
      phone: '+1234567890',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Delivery: {
      id: 1,
      orderId: 1,
      driverId: 1,
      deliveryDate: '2024-01-01T00:00:00.000Z',
      deliveryStatus: 'pending',
      deliveryAddress: '789 Pine St',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    Unit: {
      id: 1,
      name: 'KG',
      description: 'Kilogram',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    ProductUnit: {
      id: 1,
      productId: 1,
      unitId: 1,
      rate: 100.00,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    ApiResponse: {
      success: true,
      message: 'Operation completed successfully',
      data: {}
    },
    ErrorResponse: {
      success: false,
      message: 'Error message',
      error: 'Detailed error information'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);