# Stock Management API Documentation

## Overview
The Stock Management API handles inventory stock records with unit references. This API has been updated to use unit IDs instead of hardcoded unit strings, providing better flexibility and data integrity.

## Base URL
```
http://localhost:3000/api/stock
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Get All Stock Records
**GET** `/stock`

**Permission**: Public (authenticated users)

**Description**: Retrieves all stock records with associated product, inventory, and unit information.

**Response Example**:
```json
{
  "success": true,
  "message": "Stock records retrieved successfully",
  "data": [
    {
      "id": 1,
      "stockQuantity": 100.5,
      "unit_id": 1,
      "product_id": 1,
      "inventory_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": 1,
        "productName": "Rice",
        "description": "Premium quality rice"
      },
      "inventory": {
        "id": 1,
        "inventoryName": "Main Warehouse",
        "address": "123 Main St",
        "contactNumber": "123-456-7890"
      },
      "unit": {
        "id": 1,
        "name": "KG"
      }
    }
  ]
}
```

---

### 2. Get Stock Record by ID
**GET** `/stock/:id`

**Permission**: Public (authenticated users)

**Parameters**:
- `id` (path): Stock record ID

**Response**: Same structure as individual record from Get All Stock Records

---

### 3. Create New Stock Record
**POST** `/stock`

**Permission**: Admin

**Request Body**:
```json
{
  "stockQuantity": 100.5,
  "unit_id": 1,
  "product_id": 1,
  "inventory_id": 1
}
```

**Validation Rules**:
- `stockQuantity`: Required, must be non-negative number
- `unit_id`: Required, must exist in units table
- `product_id`: Required, must exist in products table
- `inventory_id`: Required, must exist in inventories table
- Combination of `product_id`, `inventory_id`, and `unit_id` must be unique

**Response**: Created stock record with associations

---

### 4. Update Stock Record
**PUT** `/stock/:id`

**Permission**: Admin

**Parameters**:
- `id` (path): Stock record ID

**Request Body** (all fields optional):
```json
{
  "stockQuantity": 150.0,
  "unit_id": 2,
  "product_id": 1,
  "inventory_id": 1
}
```

**Validation Rules**: Same as create, but all fields are optional

**Response**: Updated stock record with associations

---

### 5. Delete Stock Record
**DELETE** `/stock/:id`

**Permission**: Super Admin

**Parameters**:
- `id` (path): Stock record ID

**Response**:
```json
{
  "success": true,
  "message": "Stock record deleted successfully"
}
```

---

### 6. Get Stock by Product
**GET** `/stock/product/:productId`

**Permission**: Public (authenticated users)

**Parameters**:
- `productId` (path): Product ID

**Description**: Retrieves all stock records for a specific product across all inventories

**Response**: Array of stock records with associations

---

### 7. Get Stock by Inventory
**GET** `/stock/inventory/:inventoryId`

**Permission**: Public (authenticated users)

**Parameters**:
- `inventoryId` (path): Inventory ID

**Description**: Retrieves all stock records for a specific inventory across all products

**Response**: Array of stock records with associations

---

### 8. Get Low Stock Items
**GET** `/stock/low?threshold=10`

**Permission**: Public (authenticated users)

**Query Parameters**:
- `threshold` (optional): Minimum stock quantity threshold (default: 10)

**Description**: Retrieves stock records below the specified threshold, ordered by quantity (ascending)

**Response**: Array of stock records with associations

---

### 9. Get Stock Summary by Product
**GET** `/stock/summary/product/:productId`

**Permission**: Public (authenticated users)

**Parameters**:
- `productId` (path): Product ID

**Description**: Provides aggregated stock information for a product grouped by unit

**Response Example**:
```json
{
  "success": true,
  "message": "Stock summary for product 'Rice' retrieved successfully",
  "data": {
    "product": {
      "id": 1,
      "productName": "Rice",
      "description": "Premium quality rice"
    },
    "summary": [
      {
        "unit_id": 1,
        "totalQuantity": 250.5,
        "inventoryCount": 3,
        "unit": {
          "id": 1,
          "name": "KG"
        }
      }
    ]
  }
}
```

---

### 10. Get Stock Summary by Inventory
**GET** `/stock/summary/inventory/:inventoryId`

**Permission**: Public (authenticated users)

**Parameters**:
- `inventoryId` (path): Inventory ID

**Description**: Provides aggregated stock information for an inventory grouped by unit

**Response Example**:
```json
{
  "success": true,
  "message": "Stock summary for inventory 'Main Warehouse' retrieved successfully",
  "data": {
    "inventory": {
      "id": 1,
      "inventoryName": "Main Warehouse",
      "address": "123 Main St",
      "contactNumber": "123-456-7890"
    },
    "summary": [
      {
        "unit_id": 1,
        "totalQuantity": 500.0,
        "productCount": 5,
        "unit": {
          "id": 1,
          "name": "KG"
        }
      }
    ]
  }
}
```

---

### 11. Update Stock Quantity
**PUT** `/stock/:id/quantity`

**Permission**: Admin

**Parameters**:
- `id` (path): Stock record ID

**Request Body**:
```json
{
  "quantityChange": 50,
  "operation": "ADD"
}
```

**Validation Rules**:
- `quantityChange`: Required, must be positive number
- `operation`: Required, must be either "ADD" or "SUBTRACT"
- For SUBTRACT operations, cannot result in negative stock

**Response Example**:
```json
{
  "success": true,
  "message": "Stock quantity added successfully",
  "data": {
    // Updated stock record with associations
  },
  "operation": {
    "type": "ADD",
    "quantityChange": 50,
    "previousQuantity": 100.5,
    "newQuantity": 150.5
  }
}
```

---

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (stock record, product, inventory, or unit not found)
- `409` - Conflict (duplicate stock record)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Migration Notes

### Changes from Previous Version
1. **Unit Field**: Changed from `unit` (string) to `unit_id` (integer reference)
2. **Validation**: Removed hardcoded unit validation ('KG', 'BORI')
3. **Low Stock**: Simplified from separate KG/BORI thresholds to single threshold
4. **New Endpoints**: Added summary and quantity update endpoints
5. **Associations**: Added Unit model association in all responses

### Breaking Changes
- **Request Body**: `unit` parameter renamed to `unit_id`
- **Query Parameters**: `kgThreshold` and `boriThreshold` replaced with single `threshold`
- **Response Structure**: Unit information now returned as object instead of string

### Migration Steps for Clients
1. Update create/update requests to use `unit_id` instead of `unit`
2. Update low stock queries to use single `threshold` parameter
3. Update response parsing to handle unit as object with `id` and `name` properties
4. Ensure unit IDs are available (query `/api/units` endpoint)

---

## Related Endpoints

### Unit Management
- `GET /api/units` - Get all available units
- `GET /api/units/:id` - Get specific unit details

### Product Management
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get specific product

### Inventory Management
- `GET /api/inventories` - Get all inventories
- `GET /api/inventories/:id` - Get specific inventory