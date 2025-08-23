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

### 12. StockTransfer Model (`stocktransfer.js`) ⭐ **NEW**
- **Purpose**: Tracks stock movements between inventories
- **Fields**:
  - `id` (INT, Primary Key, Auto Increment)
  - `stock_id` (INT, Foreign Key)
  - `fromInventory_id` (INT, Foreign Key)
  - `toInventory_id` (INT, Foreign Key)
  - `transferQuantity` (DOUBLE)
  - `transferDate` (DATETIME, Default: NOW)
  - `status` (ENUM: 'pending', 'in_transit', 'completed', 'cancelled')
  - `notes` (TEXT, Optional)
  - `transferredBy` (INT, Foreign Key, Optional)
- **Relationships**:
  - Belongs to `Stock` (as 'stock')
  - Belongs to `Inventory` (as 'fromInventory')
  - Belongs to `Inventory` (as 'toInventory')
  - Belongs to `User` (as 'transferredByUser')
- **Reverse Relationships**:
  - `Stock` has many `StockTransfer` (as 'transfers')
  - `Inventory` has many outgoing `StockTransfer` (as 'outgoingTransfers')
  - `Inventory` has many incoming `StockTransfer` (as 'incomingTransfers')
  - `User` has many `StockTransfer` (as 'initiatedTransfers')

## Key Features

1. **Automatic Timestamps**: All models include `createdAt` and `updatedAt` timestamps
2. **Foreign Key Constraints**: Proper relationships with referential integrity
3. **Validation**: Email validation for user model, unit validation for orders, stock transfer validation
4. **Associations**: Proper Sequelize associations for easy querying
5. **Indexes**: Primary keys and foreign keys are properly indexed
6. **⭐ Stock Transfer System**: Complete inter-inventory stock movement tracking with status management
7. **Rich Relationships**: Complex associations supporting multiple inventory transfers and audit trails

## Usage Examples

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

// ⭐ NEW: Get stock transfers with all related data
const stockTransfers = await db.StockTransfer.findAll({
  include: [
    {
      model: db.Stock,
      as: 'stock',
      include: [
        { model: db.Product, as: 'product' },
        { model: db.Unit, as: 'unit' }
      ]
    },
    { model: db.Inventory, as: 'fromInventory' },
    { model: db.Inventory, as: 'toInventory' },
    { model: db.User, as: 'transferredByUser' }
  ]
});

// ⭐ NEW: Get inventory with all incoming and outgoing transfers
const inventoryWithTransfers = await db.Inventory.findByPk(1, {
  include: [
    {
      model: db.StockTransfer,
      as: 'outgoingTransfers',
      include: [
        { model: db.Stock, as: 'stock' },
        { model: db.Inventory, as: 'toInventory' }
      ]
    },
    {
      model: db.StockTransfer,
      as: 'incomingTransfers',
      include: [
        { model: db.Stock, as: 'stock' },
        { model: db.Inventory, as: 'fromInventory' }
      ]
    }
  ]
});

// ⭐ NEW: Get stock with transfer history
const stockWithTransfers = await db.Stock.findByPk(1, {
  include: [
    { model: db.Product, as: 'product' },
    { model: db.Inventory, as: 'inventory' },
    {
      model: db.StockTransfer,
      as: 'transfers',
      include: [
        { model: db.Inventory, as: 'fromInventory' },
        { model: db.Inventory, as: 'toInventory' },
        { model: db.User, as: 'transferredByUser' }
      ]
    }
  ]
});
```

## Database Setup

Make sure to:
1. Create the MySQL database named 'inventory'
2. Run migrations to create the tables (including the new StockTransfer table)
3. Seed the database with initial data if needed

```bash
# Run all migrations (including StockTransfer)
npx sequelize-cli db:migrate

# Seed with sample data (including StockTransfer examples)
npx sequelize-cli db:seed:all

# Or seed just the StockTransfer data
npx sequelize-cli db:seed --seed 20250813163337-demo-stock-transfer.js
```

## Recent Updates ⭐

### StockTransfer System Added
- **New Model**: `StockTransfer` for tracking inter-inventory stock movements
- **New Migration**: Creates `stock_transfer` table with proper relationships
- **Enhanced Associations**: Updated existing models with transfer relationships
- **Sample Data**: Seeder for demonstration and testing
- **Status Management**: Tracks transfer lifecycle (pending → in_transit → completed/cancelled)

The models are now ready to be used with your Express.js application with full stock transfer capabilities!