# Inventory Management System - Sequelize Models

This document describes the Sequelize models created for the inventory management system based on the provided database schema.

## Models Overview

### 1. User Model (`user.js`)
- **Purpose**: Manages system users who can manage inventory
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `fullname` (VARCHAR(16))
  - `email` (VARCHAR(255), Unique)
  - `password` (VARCHAR(32))
  - `role` (VARCHAR(10), Default: 'user')
- **Relationships**:
  - Has many `Manages` (through user_id)

### 2. Inventory Model (`inventory.js`)
- **Purpose**: Represents inventory locations/warehouses
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `inventoryName` (VARCHAR(255))
  - `address` (VARCHAR(45))
  - `contactNumber` (VARCHAR(45))
- **Relationships**:
  - Has many `Manages` (through inventory_id)
  - Has one `Stock` (through inventory_id)

### 3. Manages Model (`manages.js`)
- **Purpose**: Junction table linking users to inventories they manage
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `username` (VARCHAR(16))
  - `email` (VARCHAR(255))
  - `user_id` (INT, Foreign Key)
  - `inventory_id` (INT, Foreign Key)
- **Relationships**:
  - Belongs to `User`
  - Belongs to `Inventory`

### 4. Category Model (`category.js`)
- **Purpose**: Product categorization
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `name` (VARCHAR(255))
  - `categoryCol` (VARCHAR(45))
- **Relationships**:
  - Has many `Product` (through category_id)

### 5. Product Model (`product.js`)
- **Purpose**: Represents products in the inventory
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `productName` (VARCHAR(255))
  - `ratePerKg` (DOUBLE)
  - `ratePerBori` (DOUBLE)
  - `description` (VARCHAR(255))
  - `category_id` (INT, Foreign Key)
- **Relationships**:
  - Belongs to `Category`
  - Has many `Order` (through productId)
  - Has one `Stock` (through product_id)

### 6. Stock Model (`stock.js`)
- **Purpose**: Tracks product quantities in inventory
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `stockKg` (DOUBLE, Default: 0)
  - `stockBori` (DOUBLE, Default: 0)
  - `product_id` (INT, Foreign Key)
  - `inventory_id` (INT, Foreign Key)
- **Relationships**:
  - Belongs to `Product`
  - Belongs to `Inventory`

### 7. Customer Model (`customer.js`)
- **Purpose**: Manages customer information
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `fullname` (VARCHAR(255))
  - `phoneNumber` (VARCHAR(45))
  - `address` (VARCHAR(45))
  - `coordinateId` (INT, Foreign Key)
- **Relationships**:
  - Has many `Order` (through customerId)
  - Has one `Coordinate` (through customer_id)

### 8. Coordinate Model (`coordinate.js`)
- **Purpose**: Stores customer location coordinates
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `lat` (VARCHAR(255))
  - `lng` (VARCHAR(45))
  - `customer_id` (INT, Foreign Key)
- **Relationships**:
  - Belongs to `Customer`

### 9. Order Model (`order.js`)
- **Purpose**: Manages customer orders
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `customerId` (INT, Foreign Key)
  - `productId` (INT, Foreign Key)
  - `quantity` (DOUBLE)
  - `unit` (VARCHAR(5), Values: 'kg' or 'bori')
  - `status` (VARCHAR(45), Default: 'pending')
- **Relationships**:
  - Belongs to `Customer`
  - Belongs to `Product`
  - Has one `Delivery` (through order_id)

### 10. Driver Model (`driver.js`)
- **Purpose**: Manages delivery drivers
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `fullname` (VARCHAR(255))
  - `phoneNumber` (VARCHAR(32))
- **Relationships**:
  - Has many `Delivery` (through driver_id)

### 11. Delivery Model (`delivery.js`)
- **Purpose**: Links orders to drivers for delivery
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `order_id` (INT, Foreign Key)
  - `driver_id` (INT, Foreign Key)
- **Relationships**:
  - Belongs to `Order`
  - Belongs to `Driver`

## Key Features

1. **Automatic Timestamps**: All models include `createdAt` and `updatedAt` timestamps
2. **Foreign Key Constraints**: Proper relationships with referential integrity
3. **Validation**: Email validation for user model, unit validation for orders
4. **Associations**: Proper Sequelize associations for easy querying
5. **Indexes**: Primary keys and foreign keys are properly indexed

## Usage Example

```javascript
const db = require('./models');

// Get all products with their categories
const products = await db.Product.findAll({
  include: [{
    model: db.Category,
    as: 'category'
  }]
});

// Get customer orders with delivery information
const orders = await db.Order.findAll({
  include: [
    {
      model: db.Customer,
      as: 'customer'
    },
    {
      model: db.Product,
      as: 'product'
    },
    {
      model: db.Delivery,
      as: 'delivery',
      include: [{
        model: db.Driver,
        as: 'driver'
      }]
    }
  ]
});
```

## Database Setup

Make sure to:
1. Create the MySQL database named 'inventory'
2. Run migrations to create the tables
3. Seed the database with initial data if needed

The models are now ready to be used with your Express.js application!