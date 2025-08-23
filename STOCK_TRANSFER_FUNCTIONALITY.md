# Stock Transfer Functionality Documentation

## Overview
The stock transfer functionality has been enhanced to automatically handle stock transfers between inventories when creating stock records with `method = 'transfer'` and `in_out = 'out'`.

## How It Works

### When Creating Stock with Transfer Method

When you create a stock record with the following conditions:
- `method = 'transfer'`
- `in_out = 'out'`
- `targetInventoryId` is provided

The system automatically:

1. **Creates an outgoing stock record** in the source inventory
2. **Creates a stock transfer record** to track the transfer
3. **Creates an incoming stock record** in the target inventory

All operations are wrapped in a database transaction to ensure data consistency.

## API Usage

### Request Format

```http
POST /api/stock
Content-Type: application/json

{
  "stockQuantity": 25,
  "unit_id": 1,
  "product_id": 1,
  "inventory_id": 1,           // Source inventory
  "method": "transfer",
  "in_out": "out",
  "targetInventoryId": 2,      // Target inventory (REQUIRED for transfers)
  "notes": "Optional transfer notes",
  "transferredBy": 1           // Optional: User ID who initiated transfer
}
```

### Required Fields for Transfers

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `stockQuantity` | Number | Quantity to transfer | Yes |
| `unit_id` | Integer | Unit ID | Yes |
| `product_id` | Integer | Product ID | Yes |
| `inventory_id` | Integer | Source inventory ID | Yes |
| `method` | String | Must be "transfer" | Yes |
| `in_out` | String | Must be "out" | Yes |
| `targetInventoryId` | Integer | Target inventory ID | **Yes (for transfers)** |
| `notes` | String | Transfer notes | No |
| `transferredBy` | Integer | User ID who initiated | No |

### Response Format

```json
{
  "success": true,
  "message": "Stock transfer created successfully from Main Warehouse to Secondary Storage",
  "data": {
    "outgoingStock": {
      "id": 123,
      "stockQuantity": 25,
      "method": "transfer",
      "in_out": "out",
      "inventory_id": 1,
      "product": { ... },
      "inventory": { ... },
      "unit": { ... }
    },
    "transfer": {
      "id": 45,
      "stock_id": 123,
      "sourceInventory_id": 1,
      "targetInventory_id": 2,
      "transferQuantity": 25,
      "status": "pending",
      "notes": "Optional transfer notes",
      "transferredBy": 1
    },
    "incomingStock": {
      "id": 124,
      "stockQuantity": 25,
      "method": "transfer",
      "in_out": "in",
      "inventory_id": 2,
      "product": { ... },
      "inventory": { ... },
      "unit": { ... }
    }
  }
}
```

## Validations

### Transfer-Specific Validations

1. **Target Inventory Required**: When `method = 'transfer'` and `in_out = 'out'`, `targetInventoryId` is mandatory
2. **Different Inventories**: Source and target inventories must be different
3. **Target Inventory Exists**: The target inventory must exist in the database
4. **Sufficient Stock**: Source inventory must have sufficient available stock

### Standard Validations

- All standard stock validations apply (positive quantity, valid references, etc.)
- Stock availability check for outgoing transfers

## Database Changes

### Stock Transfer Table
The system creates records in the `stock_transfers` table with:
- Link to the outgoing stock record
- Source and target inventory references
- Transfer quantity and status tracking
- Optional user tracking and notes

### Stock Records
Two stock records are created:
1. **Outgoing**: `method = 'transfer'`, `in_out = 'out'` in source inventory
2. **Incoming**: `method = 'transfer'`, `in_out = 'in'` in target inventory

## Transaction Safety

All transfer operations are wrapped in a database transaction:
- If any step fails, all changes are rolled back
- Ensures data consistency across all tables
- Prevents partial transfers

## Error Handling

### Common Error Scenarios

1. **Missing Target Inventory**
```json
{
  "success": false,
  "message": "Target inventory ID is required when method is transfer and in_out is out"
}
```

2. **Same Source and Target**
```json
{
  "success": false,
  "message": "Source and target inventories cannot be the same"
}
```

3. **Target Inventory Not Found**
```json
{
  "success": false,
  "message": "Target inventory not found"
}
```

4. **Insufficient Stock**
```json
{
  "success": false,
  "message": "Insufficient stock. Available: 10, Requested: 25",
  "availableQuantity": 10,
  "requestedQuantity": 25
}
```

## Usage Examples

### Example 1: Basic Transfer
```javascript
// Transfer 50 KG of Basmati Rice from Main Warehouse to Secondary Storage
const response = await fetch('/api/stock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stockQuantity: 50,
    unit_id: 1,           // KG
    product_id: 1,        // Basmati Rice
    inventory_id: 1,      // Main Warehouse
    method: 'transfer',
    in_out: 'out',
    targetInventoryId: 2, // Secondary Storage
    notes: 'Monthly restock transfer'
  })
});
```

### Example 2: Transfer with User Tracking
```javascript
// Transfer with user tracking
const response = await fetch('/api/stock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stockQuantity: 25,
    unit_id: 1,
    product_id: 1,
    inventory_id: 1,
    method: 'transfer',
    in_out: 'out',
    targetInventoryId: 2,
    transferredBy: 123,   // User ID
    notes: 'Emergency restock for high demand'
  })
});
```

## Integration with Existing Features

### Stock Calculation
- Transfer records are included in stock availability calculations
- Outgoing transfers reduce source inventory stock
- Incoming transfers increase target inventory stock

### Stock Queries
- All existing stock query endpoints work with transfer records
- Transfer records appear in stock summaries and reports
- Proper aggregation of incoming/outgoing quantities

### Relationships
- Stock records maintain relationships with transfer records
- Inventories track both outgoing and incoming transfers
- Full audit trail of stock movements

## Testing

Use the provided test scripts:
- `test-stock-transfer.js` - Tests data availability
- `test-transfer-api.js` - Tests actual API functionality

## Future Enhancements

Potential future improvements:
1. Transfer status updates (pending → in_transit → completed)
2. Batch transfers for multiple products
3. Transfer approval workflows
4. Transfer history and reporting
5. Integration with delivery tracking