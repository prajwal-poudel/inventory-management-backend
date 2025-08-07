# Database Migrations Guide

This directory contains Sequelize migration files for the inventory management system database schema.

## Migration Files Order

The migrations are numbered in the correct order to handle foreign key dependencies:

1. **20241201000001-create-user.js** - Creates user table
2. **20241201000002-create-inventory.js** - Creates inventory table
3. **20241201000003-create-category.js** - Creates category table
4. **20241201000004-create-customer.js** - Creates customer table
5. **20241201000005-create-driver.js** - Creates driver table
6. **20241201000006-create-manages.js** - Creates manages junction table (user ↔ inventory)
7. **20241201000007-create-product.js** - Creates product table (references category)
8. **20241201000008-create-coordinate.js** - Creates coordinate table (references customer)
9. **20241201000009-create-stock.js** - Creates stock table (references product & inventory)
10. **20241201000010-create-order.js** - Creates order table (references customer & product)
11. **20241201000011-create-delivery.js** - Creates delivery table (references order & driver)

## Prerequisites

1. **MySQL Database**: Ensure MySQL is running and accessible
2. **Database Creation**: Create the database named 'inventory'
3. **Configuration**: Update `config/config.json` with your database credentials

### Create Database

```sql
CREATE DATABASE inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Running Migrations

### 1. Run All Migrations

```bash
# Run all pending migrations
npx sequelize-cli db:migrate
```

### 2. Check Migration Status

```bash
# Check which migrations have been run
npx sequelize-cli db:migrate:status
```

### 3. Rollback Migrations

```bash
# Rollback the last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Rollback to a specific migration
npx sequelize-cli db:migrate:undo:all --to 20241201000005-create-driver.js
```

## Migration Features

### Foreign Key Constraints
- **CASCADE**: Updates/deletes cascade to related records
- **RESTRICT**: Prevents deletion if related records exist
- **SET NULL**: Sets foreign key to NULL when parent is deleted

### Indexes Created
- **Primary Keys**: All tables have auto-increment primary keys
- **Foreign Keys**: All foreign key columns are indexed
- **Unique Constraints**: 
  - `user.email` - Unique email addresses
  - `stock.product_id + inventory_id` - One stock record per product per inventory
  - `delivery.order_id` - One delivery per order

### Data Types
- **VARCHAR**: String fields with appropriate lengths
- **INTEGER**: Primary keys and foreign keys
- **DOUBLE**: Numeric fields for rates, quantities, stock
- **DATETIME**: Automatic timestamps (createdAt, updatedAt)

## Table Relationships

```
user ←→ manages ←→ inventory
                     ↓
                   stock ←→ product ←→ category
                     ↑
customer ←→ coordinate
   ↓
 order ←→ delivery ←→ driver
   ↓
 product
```

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Ensure parent tables exist before creating child tables
   - Check that referenced IDs exist in parent tables

2. **Migration Already Exists**
   ```bash
   # If you need to recreate a migration
   npx sequelize-cli db:migrate:undo --name 20241201000001-create-user.js
   ```

3. **Database Connection Issues**
   - Verify MySQL is running
   - Check credentials in `config/config.json`
   - Ensure database 'inventory' exists

### Reset Database

To completely reset the database:

```bash
# Drop all tables
npx sequelize-cli db:migrate:undo:all

# Run all migrations again
npx sequelize-cli db:migrate
```

## Production Deployment

For production deployment:

1. **Backup**: Always backup production database before running migrations
2. **Test**: Test migrations on a copy of production data first
3. **Rollback Plan**: Have a rollback plan ready
4. **Monitoring**: Monitor application after migration deployment

```bash
# Production migration command
NODE_ENV=production npx sequelize-cli db:migrate
```

## Adding New Migrations

To create a new migration:

```bash
# Create a new migration file
npx sequelize-cli migration:generate --name add-new-field-to-product

# Edit the generated file in migrations/ directory
# Run the migration
npx sequelize-cli db:migrate
```

## Seeding Data

After running migrations, you can seed the database with initial data:

```bash
# Create a seeder
npx sequelize-cli seed:generate --name demo-users

# Run all seeders
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```