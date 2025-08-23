# Inventory Management System API

A comprehensive inventory management system built with Node.js, Express.js, Sequelize ORM, and MySQL. This system provides complete functionality for managing inventories, products, stock, orders, deliveries, and stock transfers between locations.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Admin, SuperAdmin, Driver)
- **Inventory Management**: Multiple warehouse/location support
- **Product Management**: Categorized products with flexible pricing
- **Stock Management**: Real-time stock tracking with multiple units
- **Order Management**: Customer order processing and tracking
- **Delivery Management**: Driver assignment and delivery tracking
- **Stock Transfer**: Inter-inventory stock movement tracking

### Advanced Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different user roles
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Data Validation**: Comprehensive input validation and error handling
- **Pagination**: Efficient data pagination for large datasets
- **Filtering & Search**: Advanced filtering capabilities
- **Audit Trail**: Complete tracking of stock movements and transfers

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Models & Relationships](#models--relationships)
- [Stock Transfer System](#stock-transfer-system)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npx sequelize-cli db:migrate
   
   # Seed database (optional)
   npx sequelize-cli db:seed:all
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=inventory
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🗄️ Database Setup

The system uses MySQL with Sequelize ORM. Make sure you have MySQL installed and running.

```bash
# Create database
mysql -u root -p
CREATE DATABASE inventory;

# Run migrations to create tables
npx sequelize-cli db:migrate

# Seed with sample data
npx sequelize-cli db:seed:all
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Inventories
- `GET /api/inventory` - Get all inventories
- `GET /api/inventory/:id` - Get inventory by ID
- `POST /api/inventory` - Create new inventory
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Stock
- `GET /api/stock` - Get all stock items
- `GET /api/stock/:id` - Get stock by ID
- `POST /api/stock` - Create new stock entry
- `PUT /api/stock/:id` - Update stock
- `DELETE /api/stock/:id` - Delete stock

### Stock Transfers ⭐ **NEW**
- `GET /api/stock-transfers` - Get all stock transfers
- `GET /api/stock-transfers/:id` - Get transfer by ID
- `POST /api/stock-transfers` - Create new stock transfer
- `PATCH /api/stock-transfers/:id/status` - Update transfer status
- `GET /api/stock-transfers/inventory/:inventoryId` - Get transfers by inventory

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Deliveries
- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create new delivery
- `PUT /api/deliveries/:id` - Update delivery
- `DELETE /api/deliveries/:id` - Delete delivery

### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get unit by ID
- `POST /api/units` - Create new unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit

### Summary & Analytics
- `GET /api/summary` - Get system summary and analytics

## 🏗️ Models & Relationships

### Core Models
- **User**: System users with role-based access
- **Inventory**: Warehouse/location management
- **Product**: Product catalog with categories
- **Stock**: Inventory stock tracking
- **Category**: Product categorization
- **Customer**: Customer information
- **Order**: Customer orders
- **Driver**: Delivery personnel
- **Delivery**: Order delivery tracking
- **Unit**: Measurement units
- **StockTransfer**: Inter-inventory stock movements ⭐ **NEW**

### Key Relationships
```
User ──┬── Manages ──── Inventory
       └── StockTransfer (transferredBy)

Inventory ──┬── Stock
            ├── OutgoingTransfers (StockTransfer)
            └── IncomingTransfers (StockTransfer)

Product ──┬── Stock
          ├── Category
          └── Order

Stock ──┬── Product
        ├── Inventory
        ├── Unit
        └── StockTransfer

Customer ──┬── Order
           └── Coordinate

Order ──┬── Customer
        ├── Product
        └── Delivery

Driver ──── Delivery ──── Order
```

## 📦 Stock Transfer System ⭐ **NEW FEATURE**

The Stock Transfer system enables tracking of inventory movements between different locations/warehouses.

### Key Features
- **Multi-Status Tracking**: pending → in_transit → completed/cancelled
- **Audit Trail**: Complete tracking of who, what, when, where
- **Validation**: Ensures sufficient stock and valid transfers
- **Flexible Filtering**: Filter by status, inventory, date ranges
- **Association Rich**: Includes all related data (product, inventories, user)

### Transfer Statuses
- `pending`: Transfer created but not started
- `in_transit`: Transfer is in progress
- `completed`: Transfer has been completed
- `cancelled`: Transfer was cancelled

### Usage Example
```javascript
// Create a stock transfer
POST /api/stock-transfers
{
  "stock_id": 1,
  "fromInventory_id": 1,
  "toInventory_id": 2,
  "transferQuantity": 50.5,
  "notes": "Weekly restocking",
  "transferredBy": 1
}

// Update transfer status
PATCH /api/stock-transfers/1/status
{
  "status": "completed",
  "notes": "Transfer completed successfully"
}

// Get inventory transfer history
GET /api/stock-transfers/inventory/1?type=outgoing
```

For detailed documentation, see: [Stock Transfer API Documentation](./STOCK_TRANSFER_API_DOCUMENTATION.md)

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication with role-based access control.

### User Roles
- **SuperAdmin**: Full system access
- **Admin**: Inventory and user management
- **Driver**: Delivery management and updates

### Authentication Flow
1. Login with email/password
2. Receive JWT token
3. Include token in Authorization header: `Bearer <token>`
4. Token expires based on JWT_EXPIRES_IN configuration

### Protected Routes
All API endpoints (except login/register) require authentication. Include the JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'application/json'
}
```

## 💡 Usage Examples

### Creating a Stock Transfer
```javascript
const transferData = {
  stock_id: 5,
  fromInventory_id: 1,    // Main Warehouse
  toInventory_id: 3,      // Branch Store
  transferQuantity: 25,
  notes: "Weekly restocking for branch store",
  transferredBy: 2
};

const response = await fetch('/api/stock-transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(transferData)
});
```

### Getting Stock with Transfers
```javascript
const stock = await Stock.findByPk(1, {
  include: [
    { model: Product, as: 'product' },
    { model: Inventory, as: 'inventory' },
    { model: StockTransfer, as: 'transfers' }
  ]
});
```

### Filtering Transfers
```javascript
// Get pending transfers from specific inventory
GET /api/stock-transfers?status=pending&fromInventoryId=1

// Get all transfers for an inventory
GET /api/stock-transfers/inventory/1?type=all

// Get only incoming transfers
GET /api/stock-transfers/inventory/2?type=incoming
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

- **Development**: `http://localhost:3000/docs`
- **Production**: `https://your-domain.com/docs`

The documentation includes:
- Complete endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Model definitions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "StockTransfer"

# Run with coverage
npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── config/
│   └── config.json              # Database configuration
├── controller/
│   ├── stockTransferController.js ⭐ NEW
│   ├── userController.js
│   ├── productController.js
│   └── ...
├── middleware/
│   └── authMiddleware.js        # JWT authentication
├── migrations/
│   ├── 20250813163336-create-stock-transfer.js ⭐ NEW
│   └── ...
├── models/
│   ├── stocktransfer.js ⭐ NEW
│   ├── user.js
│   ├── product.js
│   └── ...
├── routes/
│   ├── stockTransferRoutes.js ⭐ NEW
│   ├── userRoutes.js
│   └── ...
├── seeders/
│   ├── 20250813163337-demo-stock-transfer.js ⭐ NEW
│   └── ...
├── app.js                       # Express app configuration
├── server.js                    # Server entry point
├── package.json
├── README.md
└── STOCK_TRANSFER_API_DOCUMENTATION.md ⭐ NEW
```

## 🔄 Recent Updates

### Version 2.1.0 - Stock Transfer System ⭐
- **NEW**: Complete Stock Transfer functionality
- **NEW**: Inter-inventory stock movement tracking
- **NEW**: Transfer status management (pending/in_transit/completed/cancelled)
- **NEW**: Comprehensive API endpoints for stock transfers
- **NEW**: Rich associations with Stock, Inventory, and User models
- **NEW**: Advanced filtering and pagination for transfers
- **NEW**: Complete Swagger documentation for transfer endpoints
- **UPDATED**: Enhanced model relationships
- **UPDATED**: Improved API documentation

### Key Improvements
- Enhanced inventory management with transfer capabilities
- Better stock tracking and audit trails
- Improved data relationships and associations
- More comprehensive API documentation
- Better error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@yourcompany.com or create an issue in the repository.

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Sequelize team for the powerful ORM
- Swagger team for API documentation tools
- All contributors who helped build this system

---

**Happy Inventory Managing! 📦✨**