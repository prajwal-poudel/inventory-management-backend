# Inventory Management System - API Documentation

This document provides comprehensive information about all available API endpoints in the Inventory Management System.

## Authentication

All endpoints (except login) require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Permission Levels

- **Public**: All authenticated users can access
- **Admin**: Only admin and superadmin users can access
- **Super Admin**: Only superadmin users can access

## Base URL

```
http://localhost:3000/api
```

---

## User Management

### Authentication
- `POST /users/login` - Login user (Public, no auth required)
- `GET /users/verify-token` - Verify JWT token (Public)

### User CRUD Operations
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user by ID (Owner or Admin)
- `POST /users` - Create new user (Admin)
- `PUT /users/:id` - Update user (Owner or Admin)
- `DELETE /users/:id` - Delete user (Super Admin)

### User Utilities
- `GET /users/role/:role` - Get users by role (Admin)
- `PUT /users/:id/change-password` - Change password (Owner or Admin)

---

## Product Management

### Product CRUD Operations
- `GET /products` - Get all products (Public)
- `GET /products/:id` - Get product by ID (Public)
- `POST /products` - Create new product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Super Admin)

### Product Utilities
- `GET /products/category/:categoryId` - Get products by category (Public)

---

## Category Management

### Category CRUD Operations
- `GET /categories` - Get all categories (Public)
- `GET /categories/:id` - Get category by ID (Public)
- `POST /categories` - Create new category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Super Admin)

### Category Utilities
- `GET /categories/stats/product-count` - Get categories with product count (Public)

---

## Customer Management

### Customer CRUD Operations
- `GET /customers` - Get all customers (Public)
- `GET /customers/:id` - Get customer by ID (Public)
- `POST /customers` - Create new customer (Admin)
- `PUT /customers/:id` - Update customer (Admin)
- `DELETE /customers/:id` - Delete customer (Super Admin)

### Customer Utilities
- `GET /customers/search?query=<search_term>` - Search customers by name or phone (Public)

---

## Driver Management

### Driver CRUD Operations
- `GET /drivers` - Get all drivers (Public)
- `GET /drivers/:id` - Get driver by ID (Public)
- `POST /drivers` - Create new driver (Admin)
- `PUT /drivers/:id` - Update driver (Admin)
- `DELETE /drivers/:id` - Delete driver (Super Admin)

### Driver Utilities
- `GET /drivers/search?query=<search_term>` - Search drivers by name or phone (Public)
- `GET /drivers/stats/delivery-count` - Get drivers with delivery count (Public)

---

## Delivery Management

### Delivery CRUD Operations
- `GET /deliveries` - Get all deliveries (Public)
- `GET /deliveries/:id` - Get delivery by ID (Public)
- `POST /deliveries` - Create new delivery (Admin)
- `PUT /deliveries/:id` - Update delivery (Admin)
- `DELETE /deliveries/:id` - Delete delivery (Super Admin)

### Delivery Utilities
- `GET /deliveries/driver/:driverId` - Get deliveries by driver (Public)
- `GET /deliveries/order/:orderId` - Get delivery by order (Public)

---

## Inventory Management

### Inventory CRUD Operations
- `GET /inventories` - Get all inventories (Public)
- `GET /inventories/:id` - Get inventory by ID (Public)
- `POST /inventories` - Create new inventory (Admin)
- `PUT /inventories/:id` - Update inventory (Admin)
- `DELETE /inventories/:id` - Delete inventory (Super Admin)

### Inventory Utilities
- `GET /inventories/search?query=<search_term>` - Search inventories by name or address (Public)
- `GET /inventories/:id/stats` - Get inventory statistics (Public)

---

## Stock Management

### Stock CRUD Operations
- `GET /stock` - Get all stock records (Public)
- `GET /stock/:id` - Get stock record by ID (Public)
- `POST /stock` - Create new stock record (Admin)
- `PUT /stock/:id` - Update stock record (Admin)
- `DELETE /stock/:id` - Delete stock record (Super Admin)

### Stock Utilities
- `GET /stock/product/:productId` - Get stock by product (Public)
- `GET /stock/inventory/:inventoryId` - Get stock by inventory (Public)
- `GET /stock/low?kgThreshold=10&boriThreshold=5` - Get low stock items (Public)

---

## Manages (User-Inventory Relationships)

### Manages CRUD Operations
- `GET /manages` - Get all manages relationships (Public)
- `GET /manages/:id` - Get manages relationship by ID (Public)
- `POST /manages` - Create new manages relationship (Admin)
- `PUT /manages/:id` - Update manages relationship (Admin)
- `DELETE /manages/:id` - Delete manages relationship (Super Admin)

### Manages Utilities
- `GET /manages/user/:userId` - Get manages relationships by user (Public)
- `GET /manages/inventory/:inventoryId` - Get manages relationships by inventory (Public)

---

## Coordinate Management

### Coordinate CRUD Operations
- `GET /coordinates` - Get all coordinates (Public)
- `GET /coordinates/:id` - Get coordinate by ID (Public)
- `POST /coordinates` - Create new coordinate (Admin)
- `PUT /coordinates/:id` - Update coordinate (Admin)
- `DELETE /coordinates/:id` - Delete coordinate (Super Admin)

### Coordinate Utilities
- `GET /coordinates/customer/:customerId` - Get coordinate by customer (Public)
- `GET /coordinates/radius?lat=<lat>&lng=<lng>&radius=<km>` - Get coordinates within radius (Public)

---

## Request/Response Format

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Example Requests

### Create Product
```bash
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "productName": "Rice",
  "ratePerKg": 50.00,
  "ratePerBori": 2500.00,
  "description": "Premium quality rice",
  "category_id": 1
}
```

### Create Stock Record
```bash
POST /api/stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "stockKg": 100.5,
  "stockBori": 2.0,
  "product_id": 1,
  "inventory_id": 1
}
```

### Search Customers
```bash
GET /api/customers/search?query=john
Authorization: Bearer <token>
```

### Get Low Stock Items
```bash
GET /api/stock/low?kgThreshold=20&boriThreshold=10
Authorization: Bearer <token>
```

---

## Error Codes

- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entries, constraint violations)
- `500` - Internal Server Error (server-side errors)

---

## Notes

1. All timestamps are in ISO 8601 format
2. Numeric values for stock, rates, and coordinates should be provided as numbers
3. Search queries are case-insensitive and support partial matches
4. Deletion operations may fail if the resource has dependent records
5. Coordinate values must be valid latitude (-90 to 90) and longitude (-180 to 180)
6. Stock values cannot be negative
7. Phone numbers and email addresses are validated for format
8. Unique constraints are enforced on email addresses, phone numbers, and names where applicable