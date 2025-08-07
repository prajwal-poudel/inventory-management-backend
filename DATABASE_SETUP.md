# Database Setup Instructions

## Quick Start

### 1. Prerequisites
- MySQL server running
- Node.js and npm installed
- Database credentials configured in `config/config.json`

### 2. Create Database
```sql
CREATE DATABASE inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Run Setup Script
```bash
node setup-database.js
```

Or manually:
```bash
# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

## Available NPM Scripts

```bash
npm run db:migrate          # Run all pending migrations
npm run db:migrate:status    # Check migration status
npm run db:migrate:undo      # Rollback last migration
npm run db:migrate:undo:all  # Rollback all migrations
npm run db:seed             # Run all seeders
npm run db:seed:undo        # Undo all seeders
```

## Database Schema Overview

### Tables Created (in order):
1. `user` - System users
2. `inventory` - Warehouse locations
3. `category` - Product categories
4. `customer` - Customer information
5. `driver` - Delivery drivers
6. `manages` - User-Inventory relationships
7. `product` - Products (references category)
8. `coordinate` - Customer coordinates
9. `stock` - Product stock levels
10. `order` - Customer orders
11. `delivery` - Order deliveries

### Sample Data Included:
- **Categories**: Rice, Wheat, Pulses, Spices, Oil
- **Users**: Admin, Manager, Staff
- **Inventories**: Main Warehouse, Secondary Storage, Cold Storage
- **Products**: Basmati Rice, Wheat Flour, Toor Dal, Turmeric Powder, Sunflower Oil

## Troubleshooting

### Common Issues:
1. **Database connection failed**: Check MySQL is running and credentials are correct
2. **Migration failed**: Ensure database exists and user has proper permissions
3. **Foreign key constraint**: Run migrations in the correct order (they're numbered)

### Reset Database:
```bash
npm run db:migrate:undo:all
npm run db:migrate
```