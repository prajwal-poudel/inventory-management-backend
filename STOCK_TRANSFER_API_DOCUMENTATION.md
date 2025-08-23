# Stock Transfer API Documentation

## Overview

The Stock Transfer API allows you to manage the transfer of stock items between different inventories. This is useful for scenarios like:

- Moving stock from a main warehouse to branch locations
- Redistributing stock between stores
- Consolidating stock from multiple locations
- Emergency stock transfers

## Model Structure

### StockTransfer Model

The `StockTransfer` model represents a transfer of stock from one inventory to another.

**Fields:**
- `id` (INTEGER, Primary Key): Auto-generated unique identifier
- `stock_id` (INTEGER, Required): Reference to the stock being transferred
- `fromInventory_id` (INTEGER, Required): Source inventory ID
- `toInventory_id` (INTEGER, Required): Destination inventory ID
- `transferQuantity` (DOUBLE, Required): Amount being transferred
- `transferDate` (DATE): When the transfer was initiated
- `status` (ENUM): Current status of the transfer
  - `pending`: Transfer has been created but not started
  - `in_transit`: Transfer is in progress
  - `completed`: Transfer has been completed
  - `cancelled`: Transfer was cancelled
- `notes` (TEXT, Optional): Additional information about the transfer
- `transferredBy` (INTEGER, Optional): User who initiated the transfer
- `createdAt` (DATE): Record creation timestamp
- `updatedAt` (DATE): Record last update timestamp

### Associations

**StockTransfer belongs to:**
- `Stock` (via `stock_id`) - The stock item being transferred
- `Inventory` (via `fromInventory_id`) - Source inventory (aliased as `fromInventory`)
- `Inventory` (via `toInventory_id`) - Destination inventory (aliased as `toInventory`)
- `User` (via `transferredBy`) - User who initiated the transfer (aliased as `transferredByUser`)

**Other models have associations:**
- `Stock` has many `StockTransfer` (aliased as `transfers`)
- `Inventory` has many outgoing `StockTransfer` (aliased as `outgoingTransfers`)
- `Inventory` has many incoming `StockTransfer` (aliased as `incomingTransfers`)
- `User` has many `StockTransfer` (aliased as `initiatedTransfers`)

## API Endpoints

### 1. Get All Stock Transfers

**GET** `/api/stock-transfers`

**Query Parameters:**
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 10): Items per page
- `status` (string): Filter by transfer status
- `fromInventoryId` (integer): Filter by source inventory
- `toInventoryId` (integer): Filter by destination inventory

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stock_id": 1,
      "fromInventory_id": 1,
      "toInventory_id": 2,
      "transferQuantity": 50.5,
      "transferDate": "2024-01-15T10:30:00Z",
      "status": "pending",
      "notes": "Transfer for restocking",
      "transferredBy": 1,
      "stock": {
        "id": 1,
        "stockQuantity": 100,
        "product": { "id": 1, "productName": "Product A" },
        "unit": { "id": 1, "name": "KG" }
      },
      "fromInventory": { "id": 1, "inventoryName": "Main Warehouse" },
      "toInventory": { "id": 2, "inventoryName": "Branch Store" },
      "transferredByUser": { "id": 1, "fullname": "John Doe" }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

### 2. Get Stock Transfer by ID

**GET** `/api/stock-transfers/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "stock_id": 1,
    "fromInventory_id": 1,
    "toInventory_id": 2,
    "transferQuantity": 50.5,
    "status": "pending",
    // ... includes all related data
  }
}
```

### 3. Create Stock Transfer

**POST** `/api/stock-transfers`

**Request Body:**
```json
{
  "stock_id": 1,
  "fromInventory_id": 1,
  "toInventory_id": 2,
  "transferQuantity": 50.5,
  "notes": "Transfer for restocking",
  "transferredBy": 1
}
```

**Validation Rules:**
- `stock_id`, `fromInventory_id`, `toInventory_id`, and `transferQuantity` are required
- `fromInventory_id` and `toInventory_id` must be different
- Stock must exist and have sufficient quantity
- Stock must belong to the specified source inventory

**Response:**
```json
{
  "success": true,
  "message": "Stock transfer created successfully",
  "data": {
    "id": 1,
    // ... transfer details with related data
  }
}
```

### 4. Update Transfer Status

**PATCH** `/api/stock-transfers/{id}/status`

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Transfer completed successfully"
}
```

**Valid Status Values:**
- `pending`
- `in_transit`
- `completed`
- `cancelled`

### 5. Get Transfers by Inventory

**GET** `/api/stock-transfers/inventory/{inventoryId}`

**Query Parameters:**
- `type` (string, default: "all"): Type of transfers to retrieve
  - `incoming`: Only transfers coming to this inventory
  - `outgoing`: Only transfers going from this inventory
  - `all`: Both incoming and outgoing transfers

## Usage Examples

### Example 1: Creating a Stock Transfer

```javascript
// Create a transfer of 25 KG of rice from Main Warehouse to Branch Store
const transferData = {
  stock_id: 5,           // ID of the rice stock record
  fromInventory_id: 1,   // Main Warehouse
  toInventory_id: 3,     // Branch Store
  transferQuantity: 25,  // 25 units
  notes: "Weekly restocking for branch store",
  transferredBy: 2       // Manager's user ID
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

### Example 2: Tracking Transfer Status

```javascript
// Update transfer status to completed
const statusUpdate = {
  status: 'completed',
  notes: 'Stock received and verified at destination'
};

const response = await fetch('/api/stock-transfers/1/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(statusUpdate)
});
```

### Example 3: Getting Inventory Transfer History

```javascript
// Get all outgoing transfers from inventory ID 1
const response = await fetch('/api/stock-transfers/inventory/1?type=outgoing', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

## Business Logic Considerations

### Stock Quantity Management

Currently, the API creates transfer records but doesn't automatically update stock quantities. You may want to implement additional logic to:

1. **On Transfer Creation**: Optionally reserve the quantity in the source inventory
2. **On Status Update to 'completed'**: 
   - Reduce quantity in source inventory
   - Create new stock record in destination inventory
   - Or update existing stock record in destination inventory

### Validation Rules

The API includes several validation rules:
- Source and destination inventories must be different
- Stock must exist and belong to the source inventory
- Transfer quantity cannot exceed available stock quantity
- Only valid status transitions are allowed

### Permissions

Consider implementing role-based permissions:
- **Inventory Managers**: Can create and update transfers for their managed inventories
- **Admins**: Can manage all transfers
- **Drivers**: Can update transfer status (e.g., mark as 'in_transit')

## Database Schema

The migration creates the following table structure:

```sql
CREATE TABLE stock_transfer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_id INT NOT NULL,
  fromInventory_id INT NOT NULL,
  toInventory_id INT NOT NULL,
  transferQuantity DOUBLE NOT NULL,
  transferDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  transferredBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (stock_id) REFERENCES stock(id),
  FOREIGN KEY (fromInventory_id) REFERENCES inventory(id),
  FOREIGN KEY (toInventory_id) REFERENCES inventory(id),
  FOREIGN KEY (transferredBy) REFERENCES user(id)
);
```

## Testing

You can test the API using the provided seeder data:

```bash
# Run the seeder to create sample transfers
npx sequelize-cli db:seed --seed 20250813163337-demo-stock-transfer.js

# Test the API endpoints
curl -X GET "http://localhost:3000/api/stock-transfers" \
  -H "Authorization: Bearer your-jwt-token"
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized
- `404`: Resource not found
- `500`: Server error

Error responses include descriptive messages to help with debugging and user feedback.