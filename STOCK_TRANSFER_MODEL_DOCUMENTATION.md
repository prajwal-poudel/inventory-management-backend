# StockTransfer Model Documentation

## Overview
The StockTransfer model manages the transfer of stock items between different inventories. It maintains relationships with Stock and Inventory models, specifically using `targetInventory` as the destination inventory.

## Database Table: `stock_transfers`

### Fields

| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `id` | INTEGER | Primary key | Yes | Auto-increment |
| `stock_id` | INTEGER | Foreign key to Stock table | Yes | - |
| `sourceInventory_id` | INTEGER | Source inventory ID | Yes | - |
| `targetInventory_id` | INTEGER | Target/destination inventory ID | Yes | - |
| `transferQuantity` | DOUBLE | Quantity being transferred | Yes | - |
| `transferDate` | DATE | Date of transfer | Yes | Current timestamp |
| `status` | ENUM | Transfer status | Yes | 'pending' |
| `notes` | TEXT | Additional notes | No | NULL |
| `transferredBy` | INTEGER | User who initiated transfer | No | NULL |
| `receivedBy` | INTEGER | User who received transfer | No | NULL |
| `completedAt` | DATE | Completion timestamp | No | NULL |
| `createdAt` | DATE | Record creation time | Yes | Current timestamp |
| `updatedAt` | DATE | Record update time | Yes | Current timestamp |

### Status Values
- `pending`: Transfer has been created but not started
- `in_transit`: Transfer is in progress
- `completed`: Transfer has been completed
- `cancelled`: Transfer has been cancelled

## Model Relationships

### Belongs To Associations
- **Stock**: `StockTransfer.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' })`
- **Source Inventory**: `StockTransfer.belongsTo(Inventory, { foreignKey: 'sourceInventory_id', as: 'sourceInventory' })`
- **Target Inventory**: `StockTransfer.belongsTo(Inventory, { foreignKey: 'targetInventory_id', as: 'targetInventory' })`
- **Transferrer**: `StockTransfer.belongsTo(User, { foreignKey: 'transferredBy', as: 'transferrer' })`
- **Receiver**: `StockTransfer.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' })`

### Has Many Associations (from other models)
- **Stock**: `Stock.hasMany(StockTransfer, { foreignKey: 'stock_id', as: 'transfers' })`
- **Inventory (Outgoing)**: `Inventory.hasMany(StockTransfer, { foreignKey: 'sourceInventory_id', as: 'outgoingTransfers' })`
- **Inventory (Incoming)**: `Inventory.hasMany(StockTransfer, { foreignKey: 'targetInventory_id', as: 'incomingTransfers' })`

## Validations

### Model-Level Validations
1. **Different Inventories**: Source and target inventories must be different
2. **Transfer Quantity**: Must be greater than 0.01
3. **Automatic Completion**: `completedAt` is automatically set when status changes to 'completed'

### Database-Level Constraints
- Foreign key constraints with CASCADE updates and appropriate delete actions
- Indexes on frequently queried fields for performance

## Usage Examples

### Creating a Stock Transfer
```javascript
const { StockTransfer } = require('./models');

const transfer = await StockTransfer.create({
  stock_id: 1,
  sourceInventory_id: 1,
  targetInventory_id: 2,
  transferQuantity: 50.0,
  transferDate: new Date(),
  status: 'pending',
  notes: 'Transfer for restocking',
  transferredBy: 1
});
```

### Querying with Associations
```javascript
// Get transfer with all related data
const transfer = await StockTransfer.findByPk(1, {
  include: [
    { model: Stock, as: 'stock' },
    { model: Inventory, as: 'sourceInventory' },
    { model: Inventory, as: 'targetInventory' },
    { model: User, as: 'transferrer' },
    { model: User, as: 'receiver' }
  ]
});

// Get all outgoing transfers for an inventory
const outgoingTransfers = await Inventory.findByPk(1, {
  include: [
    { model: StockTransfer, as: 'outgoingTransfers' }
  ]
});

// Get all incoming transfers for an inventory
const incomingTransfers = await Inventory.findByPk(2, {
  include: [
    { model: StockTransfer, as: 'incomingTransfers' }
  ]
});
```

### Updating Transfer Status
```javascript
// Complete a transfer
await transfer.update({
  status: 'completed',
  receivedBy: 2
});
// completedAt will be automatically set due to the beforeUpdate hook
```

## Database Indexes
The following indexes are created for optimal performance:
- `idx_stock_transfers_stock_id`
- `idx_stock_transfers_source_inventory_id`
- `idx_stock_transfers_target_inventory_id`
- `idx_stock_transfers_status`
- `idx_stock_transfers_transfer_date`
- `idx_stock_transfers_transferred_by`
- `idx_stock_transfers_received_by`

## Migration
The migration file `20241201000015-create-stock-transfer.js` creates the table with all necessary constraints and indexes.

To run the migration:
```bash
npx sequelize-cli db:migrate
```

To rollback the migration:
```bash
npx sequelize-cli db:migrate:undo --name 20241201000015-create-stock-transfer.js
```