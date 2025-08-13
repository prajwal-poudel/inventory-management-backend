# Inventory Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [User Routes](#user-routes)
   - [Category Routes](#category-routes)
   - [Product Routes](#product-routes)
   - [Inventory Routes](#inventory-routes)
   - [Stock Routes](#stock-routes)
   - [Unit Routes](#unit-routes)
   - [Product Units Routes](#product-units-routes)
   - [Order Routes](#order-routes)
   - [Customer Routes](#customer-routes)
   - [Driver Routes](#driver-routes)
   - [Delivery Routes](#delivery-routes)

---

## Overview

This is a comprehensive inventory management system built with Node.js, Express.js, and Sequelize ORM. The system manages products, inventory, stock, orders, customers, and deliveries with proper authentication and authorization.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development mode)"
}
```

## Error Handling

Common HTTP status codes used:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

# API Endpoints

## Authentication Routes

### 1. User Registration
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. User Login
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## User Routes

### 1. Get All Users
**GET** `/users`

Retrieve all users (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get User by ID
**GET** `/users/:id`

Retrieve a specific user by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Update User
**PUT** `/users/:id`

Update user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "john_updated",
  "email": "john_updated@example.com",
  "role": "manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "john_updated",
    "email": "john_updated@example.com",
    "role": "manager",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 4. Delete User
**DELETE** `/users/:id`

Delete a user (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Category Routes

### 1. Get All Categories
**GET** `/categories`

Retrieve all product categories.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "categoryCol": "ELEC",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "products": [
        {
          "id": 1,
          "productName": "Laptop",
          "description": "Gaming laptop"
        }
      ]
    }
  ]
}
```

### 2. Get Category by ID
**GET** `/categories/:id`

Retrieve a specific category with its products.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Electronics",
    "categoryCol": "ELEC",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "products": [
      {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      }
    ]
  }
}
```

### 3. Create Category
**POST** `/categories`

Create a new product category.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Furniture",
  "categoryCol": "FURN"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 2,
    "name": "Furniture",
    "categoryCol": "FURN",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Category
**PUT** `/categories/:id`

Update an existing category.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Home Furniture",
  "categoryCol": "HFURN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 2,
    "name": "Home Furniture",
    "categoryCol": "HFURN",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Category
**DELETE** `/categories/:id`

Delete a category.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Product Routes

### 1. Get All Products
**GET** `/products`

Retrieve all products with their categories, stocks, and product units.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop",
      "category_id": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "category": {
        "id": 1,
        "name": "Electronics",
        "categoryCol": "ELEC"
      },
      "stocks": [
        {
          "id": 1,
          "stockQuantity": 50,
          "unit_id": 1,
          "inventory_id": 1,
          "unit": {
            "id": 1,
            "name": "Pieces"
          },
          "inventory": {
            "id": 1,
            "inventoryName": "Main Warehouse"
          }
        }
      ],
      "productUnits": [
        {
          "id": 1,
          "product_id": 1,
          "unit_id": 1,
          "rate": 50000,
          "unit": {
            "id": 1,
            "name": "Pieces"
          }
        }
      ]
    }
  ]
}
```

### 2. Get Product by ID
**GET** `/products/:id`

Retrieve a specific product with all its details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "productName": "Laptop",
    "description": "Gaming laptop",
    "category_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Electronics",
      "categoryCol": "ELEC"
    },
    "stocks": [
      {
        "id": 1,
        "stockQuantity": 50,
        "unit_id": 1,
        "inventory_id": 1,
        "unit": {
          "id": 1,
          "name": "Pieces"
        },
        "inventory": {
          "id": 1,
          "inventoryName": "Main Warehouse"
        }
      }
    ],
    "productUnits": [
      {
        "id": 1,
        "product_id": 1,
        "unit_id": 1,
        "rate": 50000,
        "unit": {
          "id": 1,
          "name": "Pieces"
        }
      }
    ]
  }
}
```

### 3. Create Product
**POST** `/products`

Create a new product with optional units and rates.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productName": "Desktop Computer",
  "description": "High-performance desktop",
  "category_id": 1,
  "units": [
    {
      "unit_id": 1,
      "rate": 75000
    },
    {
      "unit_id": 2,
      "rate": 70000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 2,
    "productName": "Desktop Computer",
    "description": "High-performance desktop",
    "category_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Electronics",
      "categoryCol": "ELEC"
    },
    "productUnits": [
      {
        "id": 2,
        "product_id": 2,
        "unit_id": 1,
        "rate": 75000,
        "unit": {
          "id": 1,
          "name": "Pieces"
        }
      }
    ]
  }
}
```

### 4. Update Product
**PUT** `/products/:id`

Update an existing product.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productName": "Gaming Desktop",
  "description": "High-end gaming desktop",
  "category_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 2,
    "productName": "Gaming Desktop",
    "description": "High-end gaming desktop",
    "category_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z",
    "category": {
      "id": 1,
      "name": "Electronics",
      "categoryCol": "ELEC"
    }
  }
}
```

### 5. Delete Product
**DELETE** `/products/:id`

Delete a product.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 6. Get Products by Category
**GET** `/products/category/:categoryId`

Retrieve all products in a specific category.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop",
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Electronics",
        "categoryCol": "ELEC"
      }
    }
  ]
}
```

---

## Inventory Routes

### 1. Get All Inventories
**GET** `/inventories`

Retrieve all inventories with their stock information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventories retrieved successfully",
  "data": [
    {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Storage St, City",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "stocks": [
        {
          "id": 1,
          "stockQuantity": 50,
          "unit_id": 1,
          "product_id": 1,
          "unit": {
            "id": 1,
            "name": "Pieces"
          }
        }
      ]
    }
  ]
}
```

### 2. Get Inventory by ID
**GET** `/inventories/:id`

Retrieve a specific inventory with detailed stock information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": {
    "id": 1,
    "inventoryName": "Main Warehouse",
    "address": "123 Storage St, City",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "stocks": [
      {
        "id": 1,
        "stockQuantity": 50,
        "unit_id": 1,
        "product_id": 1,
        "unit": {
          "id": 1,
          "name": "Pieces"
        }
      }
    ]
  }
}
```

### 3. Create Inventory
**POST** `/inventories`

Create a new inventory location.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "inventoryName": "Secondary Warehouse",
  "address": "456 Storage Ave, City"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory created successfully",
  "data": {
    "id": 2,
    "inventoryName": "Secondary Warehouse",
    "address": "456 Storage Ave, City",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Inventory
**PUT** `/inventories/:id`

Update an existing inventory.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "inventoryName": "Updated Warehouse",
  "address": "789 New Storage Blvd, City"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "id": 2,
    "inventoryName": "Updated Warehouse",
    "address": "789 New Storage Blvd, City",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Inventory
**DELETE** `/inventories/:id`

Delete an inventory location.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory deleted successfully"
}
```

### 6. Get Inventory Statistics
**GET** `/inventories/stats`

Get comprehensive inventory statistics by units.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory statistics retrieved successfully",
  "data": {
    "totalInventories": 2,
    "stockStatsByUnit": [
      {
        "unit_id": 1,
        "unit_name": "Pieces",
        "totalStock": 150,
        "inventoryCount": 2
      },
      {
        "unit_id": 2,
        "unit_name": "Boxes",
        "totalStock": 25,
        "inventoryCount": 1
      }
    ]
  }
}
```

---

## Stock Routes

### 1. Get All Stock
**GET** `/stock`

Retrieve all stock records with product and inventory details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stock retrieved successfully",
  "data": [
    {
      "id": 1,
      "stockQuantity": 50,
      "unit_id": 1,
      "product_id": 1,
      "inventory_id": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      },
      "unit": {
        "id": 1,
        "name": "Pieces"
      },
      "inventory": {
        "id": 1,
        "inventoryName": "Main Warehouse",
        "address": "123 Storage St, City"
      }
    }
  ]
}
```

### 2. Get Stock by ID
**GET** `/stock/:id`

Retrieve a specific stock record.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stock retrieved successfully",
  "data": {
    "id": 1,
    "stockQuantity": 50,
    "unit_id": 1,
    "product_id": 1,
    "inventory_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 1,
      "name": "Pieces"
    },
    "inventory": {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Storage St, City"
    }
  }
}
```

### 3. Create Stock
**POST** `/stock`

Add new stock to inventory.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stockQuantity": 100,
  "unit_id": 1,
  "product_id": 1,
  "inventory_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Stock created successfully",
  "data": {
    "id": 2,
    "stockQuantity": 100,
    "unit_id": 1,
    "product_id": 1,
    "inventory_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 1,
      "name": "Pieces"
    },
    "inventory": {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Storage St, City"
    }
  }
}
```

### 4. Update Stock
**PUT** `/stock/:id`

Update existing stock quantity.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stockQuantity": 75
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": 2,
    "stockQuantity": 75,
    "unit_id": 1,
    "product_id": 1,
    "inventory_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Stock
**DELETE** `/stock/:id`

Remove stock record.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stock deleted successfully"
}
```

### 6. Get Stock Summary by Product
**GET** `/stock/summary/product`

Get stock summary grouped by products.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Stock summary retrieved successfully",
  "data": [
    {
      "product_id": 1,
      "productName": "Laptop",
      "totalStock": 125,
      "stockRecords": 2
    }
  ]
}
```

---

## Unit Routes

### 1. Get All Units
**GET** `/units`

Retrieve all measurement units.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Units retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Pieces",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Boxes",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get Unit by ID
**GET** `/units/:id`

Retrieve a specific unit.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unit retrieved successfully",
  "data": {
    "id": 1,
    "name": "Pieces",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Unit
**POST** `/units`

Create a new measurement unit.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Kilograms"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Unit created successfully",
  "data": {
    "id": 3,
    "name": "Kilograms",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Unit
**PUT** `/units/:id`

Update an existing unit.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Kg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unit updated successfully",
  "data": {
    "id": 3,
    "name": "Kg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Unit
**DELETE** `/units/:id`

Delete a unit.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unit deleted successfully"
}
```

---

## Product Units Routes

### 1. Get All Product Units
**GET** `/product-units`

Retrieve all product-unit combinations with rates.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product units retrieved successfully",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "unit_id": 1,
      "rate": 50000,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      },
      "unit": {
        "id": 1,
        "name": "Pieces"
      }
    }
  ]
}
```

### 2. Get Product Unit by ID
**GET** `/product-units/:id`

Retrieve a specific product-unit combination.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product unit retrieved successfully",
  "data": {
    "id": 1,
    "product_id": 1,
    "unit_id": 1,
    "rate": 50000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 1,
      "name": "Pieces"
    }
  }
}
```

### 3. Create Product Unit
**POST** `/product-units`

Create a new product-unit rate combination.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "unit_id": 2,
  "rate": 48000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product unit created successfully",
  "data": {
    "id": 2,
    "product_id": 1,
    "unit_id": 2,
    "rate": 48000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 2,
      "name": "Boxes"
    }
  }
}
```

### 4. Update Product Unit
**PUT** `/product-units/:id`

Update a product-unit rate.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rate": 52000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product unit updated successfully",
  "data": {
    "id": 1,
    "product_id": 1,
    "unit_id": 1,
    "rate": 52000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Product Unit
**DELETE** `/product-units/:id`

Delete a product-unit combination.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product unit deleted successfully"
}
```

---

## Order Routes

### 1. Get All Orders
**GET** `/orders`

Retrieve all orders with customer, product, and inventory details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "quantity": 5,
      "unit_id": 1,
      "totalAmount": 250000,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "productId": 1,
      "customerId": 1,
      "inventoryId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "customer": {
        "id": 1,
        "customerName": "John Smith",
        "email": "john.smith@example.com",
        "phone": "+1234567890"
      },
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      },
      "unit": {
        "id": 1,
        "name": "Pieces"
      },
      "inventory": {
        "id": 1,
        "inventoryName": "Main Warehouse",
        "address": "123 Storage St, City"
      }
    }
  ]
}
```

### 2. Get Order by ID
**GET** `/orders/:id`

Retrieve a specific order with all details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "quantity": 5,
    "unit_id": 1,
    "totalAmount": 250000,
    "orderDate": "2024-01-15T10:30:00.000Z",
    "status": "pending",
    "productId": 1,
    "customerId": 1,
    "inventoryId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "customer": {
      "id": 1,
      "customerName": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+1234567890"
    },
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 1,
      "name": "Pieces"
    },
    "inventory": {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Storage St, City"
    }
  }
}
```

### 3. Create Order
**POST** `/orders`

Create a new order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3,
  "unit_id": 1,
  "totalAmount": 150000,
  "orderDate": "2024-01-15T10:30:00.000Z",
  "status": "pending",
  "productId": 1,
  "customerId": 1,
  "inventoryId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 2,
    "quantity": 3,
    "unit_id": 1,
    "totalAmount": 150000,
    "orderDate": "2024-01-15T10:30:00.000Z",
    "status": "pending",
    "productId": 1,
    "customerId": 1,
    "inventoryId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "customer": {
      "id": 1,
      "customerName": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+1234567890"
    },
    "product": {
      "id": 1,
      "productName": "Laptop",
      "description": "Gaming laptop"
    },
    "unit": {
      "id": 1,
      "name": "Pieces"
    },
    "inventory": {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Storage St, City"
    }
  }
}
```

### 4. Update Order
**PUT** `/orders/:id`

Update an existing order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 4,
  "totalAmount": 200000,
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": 2,
    "quantity": 4,
    "unit_id": 1,
    "totalAmount": 200000,
    "orderDate": "2024-01-15T10:30:00.000Z",
    "status": "confirmed",
    "productId": 1,
    "customerId": 1,
    "inventoryId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Order
**DELETE** `/orders/:id`

Delete an order.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

### 6. Get Orders by Customer
**GET** `/orders/customer/:customerId`

Retrieve all orders for a specific customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "quantity": 5,
      "unit_id": 1,
      "totalAmount": 250000,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "productId": 1,
      "customerId": 1,
      "inventoryId": 1,
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      },
      "unit": {
        "id": 1,
        "name": "Pieces"
      }
    }
  ]
}
```

---

## Customer Routes

### 1. Get All Customers
**GET** `/customers`

Retrieve all customers with their coordinate information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": 1,
      "customerName": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+1234567890",
      "address": "123 Main St, City",
      "coordinate_id": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "coordinate": {
        "id": 1,
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Main St, City"
      }
    }
  ]
}
```

### 2. Get Customer by ID
**GET** `/customers/:id`

Retrieve a specific customer with orders and coordinate details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": 1,
    "customerName": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "coordinate_id": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "coordinate": {
      "id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, City"
    },
    "orders": [
      {
        "id": 1,
        "quantity": 5,
        "totalAmount": 250000,
        "orderDate": "2024-01-15T10:30:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

### 3. Create Customer
**POST** `/customers`

Create a new customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerName": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1987654321",
  "address": "456 Oak Ave, City",
  "coordinate_id": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 2,
    "customerName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Ave, City",
    "coordinate_id": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Customer
**PUT** `/customers/:id`

Update an existing customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1987654321",
  "address": "789 Pine St, City"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": 2,
    "customerName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "address": "789 Pine St, City",
    "coordinate_id": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Customer
**DELETE** `/customers/:id`

Delete a customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Driver Routes

### 1. Get All Drivers
**GET** `/drivers`

Retrieve all drivers.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": [
    {
      "id": 1,
      "driverName": "Mike Johnson",
      "licenseNumber": "DL123456789",
      "phone": "+1555123456",
      "vehicleInfo": "Toyota Truck - ABC123",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get Driver by ID
**GET** `/drivers/:id`

Retrieve a specific driver with delivery history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver retrieved successfully",
  "data": {
    "id": 1,
    "driverName": "Mike Johnson",
    "licenseNumber": "DL123456789",
    "phone": "+1555123456",
    "vehicleInfo": "Toyota Truck - ABC123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deliveries": [
      {
        "id": 1,
        "deliveryDate": "2024-01-15T14:30:00.000Z",
        "status": "delivered",
        "orderId": 1
      }
    ]
  }
}
```

### 3. Create Driver
**POST** `/drivers`

Create a new driver.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "driverName": "Sarah Wilson",
  "licenseNumber": "DL987654321",
  "phone": "+1555987654",
  "vehicleInfo": "Ford Van - XYZ789"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "id": 2,
    "driverName": "Sarah Wilson",
    "licenseNumber": "DL987654321",
    "phone": "+1555987654",
    "vehicleInfo": "Ford Van - XYZ789",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Driver
**PUT** `/drivers/:id`

Update an existing driver.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "driverName": "Sarah Johnson",
  "phone": "+1555987655",
  "vehicleInfo": "Ford Van - XYZ790"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver updated successfully",
  "data": {
    "id": 2,
    "driverName": "Sarah Johnson",
    "licenseNumber": "DL987654321",
    "phone": "+1555987655",
    "vehicleInfo": "Ford Van - XYZ790",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Driver
**DELETE** `/drivers/:id`

Delete a driver.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver deleted successfully"
}
```

---

## Delivery Routes

### 1. Get All Deliveries
**GET** `/deliveries`

Retrieve all deliveries with order, customer, and driver details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Deliveries retrieved successfully",
  "data": [
    {
      "id": 1,
      "deliveryDate": "2024-01-15T14:30:00.000Z",
      "status": "delivered",
      "orderId": 1,
      "driverId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "order": {
        "id": 1,
        "quantity": 5,
        "totalAmount": 250000,
        "orderDate": "2024-01-15T10:30:00.000Z",
        "status": "confirmed",
        "customer": {
          "id": 1,
          "customerName": "John Smith",
          "email": "john.smith@example.com",
          "phone": "+1234567890"
        },
        "product": {
          "id": 1,
          "productName": "Laptop",
          "description": "Gaming laptop"
        }
      },
      "driver": {
        "id": 1,
        "driverName": "Mike Johnson",
        "licenseNumber": "DL123456789",
        "phone": "+1555123456",
        "vehicleInfo": "Toyota Truck - ABC123"
      }
    }
  ]
}
```

### 2. Get Delivery by ID
**GET** `/deliveries/:id`

Retrieve a specific delivery with complete details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery retrieved successfully",
  "data": {
    "id": 1,
    "deliveryDate": "2024-01-15T14:30:00.000Z",
    "status": "delivered",
    "orderId": 1,
    "driverId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "order": {
      "id": 1,
      "quantity": 5,
      "totalAmount": 250000,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "confirmed",
      "customer": {
        "id": 1,
        "customerName": "John Smith",
        "email": "john.smith@example.com",
        "phone": "+1234567890"
      },
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      }
    },
    "driver": {
      "id": 1,
      "driverName": "Mike Johnson",
      "licenseNumber": "DL123456789",
      "phone": "+1555123456",
      "vehicleInfo": "Toyota Truck - ABC123"
    }
  }
}
```

### 3. Create Delivery
**POST** `/deliveries`

Create a new delivery assignment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deliveryDate": "2024-01-16T10:00:00.000Z",
  "status": "pending",
  "orderId": 2,
  "driverId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Delivery created successfully",
  "data": {
    "id": 2,
    "deliveryDate": "2024-01-16T10:00:00.000Z",
    "status": "pending",
    "orderId": 2,
    "driverId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "order": {
      "id": 2,
      "quantity": 3,
      "totalAmount": 150000,
      "orderDate": "2024-01-15T10:30:00.000Z",
      "status": "confirmed",
      "customer": {
        "id": 1,
        "customerName": "John Smith",
        "email": "john.smith@example.com",
        "phone": "+1234567890"
      },
      "product": {
        "id": 1,
        "productName": "Laptop",
        "description": "Gaming laptop"
      }
    },
    "driver": {
      "id": 1,
      "driverName": "Mike Johnson",
      "licenseNumber": "DL123456789",
      "phone": "+1555123456",
      "vehicleInfo": "Toyota Truck - ABC123"
    }
  }
}
```

### 4. Update Delivery
**PUT** `/deliveries/:id`

Update delivery status or details.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "in_transit",
  "deliveryDate": "2024-01-16T11:00:00.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery updated successfully",
  "data": {
    "id": 2,
    "deliveryDate": "2024-01-16T11:00:00.000Z",
    "status": "in_transit",
    "orderId": 2,
    "driverId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Delivery
**DELETE** `/deliveries/:id`

Cancel/delete a delivery.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Delivery deleted successfully"
}
```

### 6. Get Deliveries by Driver
**GET** `/deliveries/driver/:driverId`

Get all deliveries assigned to a specific driver.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver deliveries retrieved successfully",
  "data": [
    {
      "id": 1,
      "deliveryDate": "2024-01-15T14:30:00.000Z",
      "status": "delivered",
      "orderId": 1,
      "driverId": 1,
      "order": {
        "id": 1,
        "quantity": 5,
        "totalAmount": 250000,
        "customer": {
          "id": 1,
          "customerName": "John Smith",
          "phone": "+1234567890"
        }
      }
    }
  ]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: Required field missing"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (development mode only)"
}
```

---

## Database Relationships

### Key Relationships:
1. **Product** belongs to **Category**
2. **Product** has many **Stock** records
3. **Product** has many **ProductUnits** (rates for different units)
4. **Stock** belongs to **Product**, **Unit**, and **Inventory**
5. **Order** belongs to **Product**, **Customer**, **Unit**, and **Inventory**
6. **Delivery** belongs to **Order** and **Driver**
7. **Customer** belongs to **Coordinate** (location)

### Important Notes:
- All endpoints require authentication except `/auth/register` and `/auth/login`
- Admin role required for user management operations
- Stock quantities are automatically validated against available inventory
- Orders automatically update stock levels when created/updated
- Delivery status affects order status automatically
- All timestamps are in ISO 8601 format (UTC)

---

## Getting Started for Junior Developers

### 1. Authentication Flow:
1. Register a new user or use existing credentials
2. Login to get JWT token
3. Include token in Authorization header for all subsequent requests

### 2. Basic Workflow:
1. Create categories for products
2. Create measurement units (pieces, kg, boxes, etc.)
3. Create inventory locations
4. Create products and assign them to categories
5. Add stock to inventory for products
6. Set up product-unit rates
7. Create customers
8. Create orders
9. Assign drivers and create deliveries

### 3. Testing the API:
- Use tools like Postman, Insomnia, or curl
- Start with authentication endpoints
- Test CRUD operations for each resource
- Verify relationships between entities

### 4. Common Pitfalls:
- Always include Authorization header after login
- Validate required fields before making requests
- Check stock availability before creating orders
- Ensure proper unit_id references in orders and stock
- Handle error responses appropriately in your frontend

This documentation provides comprehensive coverage of all API endpoints with request/response examples. Use it as a reference while developing frontend applications or integrating with the inventory management system.