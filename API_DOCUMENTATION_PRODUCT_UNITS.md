# ProductUnits API Documentation

## Overview
The ProductUnits system replaces the old `ratePerKg` and `ratePerBori` fields in the Product model with a flexible many-to-many relationship between Products and Units, allowing different rates for different units per product.

## Database Schema Changes

### New Tables
- **units**: Stores unit types (KG, BORI, etc.)
- **product_units**: Junction table storing product-unit-rate relationships

### Removed Fields
- `ratePerKg` from product table
- `ratePerBori` from product table

## API Endpoints

### Units API (`/api/units`)

#### GET /api/units
Get all units
```json
Response: {
  "success": true,
  "message": "Units retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "KG",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/units/:id
Get unit by ID

#### POST /api/units
Create new unit
```json
Request: {
  "name": "GRAM"
}
```

#### PUT /api/units/:id
Update unit

#### DELETE /api/units/:id
Delete unit

#### GET /api/units/search?name=KG
Search units by name

### ProductUnits API (`/api/product-units`)

#### GET /api/product-units
Get all product units with associations
```json
Response: {
  "success": true,
  "message": "Product units retrieved successfully",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "unit_id": 1,
      "rate": 150.50,
      "product": {
        "id": 1,
        "productName": "Rice",
        "description": "Premium rice"
      },
      "unit": {
        "id": 1,
        "name": "KG"
      }
    }
  ]
}
```

#### GET /api/product-units/product/:productId
Get all units and rates for a specific product

#### GET /api/product-units/unit/:unitId
Get all products that use a specific unit

#### GET /api/product-units/:productId/:unitId
Get specific product-unit combination

#### POST /api/product-units
Create new product unit
```json
Request: {
  "product_id": 1,
  "unit_id": 1,
  "rate": 150.50
}
```

#### POST /api/product-units/bulk
Create multiple product units for a product
```json
Request: {
  "product_id": 1,
  "units": [
    {
      "unit_id": 1,
      "rate": 150.50
    },
    {
      "unit_id": 2,
      "rate": 3000.00
    }
  ]
}
```

#### PUT /api/product-units/:id
Update product unit rate
```json
Request: {
  "rate": 175.00
}
```

#### DELETE /api/product-units/:id
Delete product unit

## Updated Product API

### POST /api/products
Create product with units
```json
Request: {
  "productName": "Premium Rice",
  "description": "High quality rice",
  "category_id": 1,
  "units": [
    {
      "unit_id": 1,
      "rate": 150.50
    },
    {
      "unit_id": 2,
      "rate": 3000.00
    }
  ]
}

Response: {
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "productName": "Premium Rice",
    "description": "High quality rice",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Grains"
    },
    "productUnits": [
      {
        "id": 1,
        "rate": 150.50,
        "unit": {
          "id": 1,
          "name": "KG"
        }
      },
      {
        "id": 2,
        "rate": 3000.00,
        "unit": {
          "id": 2,
          "name": "BORI"
        }
      }
    ]
  }
}
```

### GET /api/products
Get all products (now includes productUnits)
```json
Response: {
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "productName": "Premium Rice",
      "description": "High quality rice",
      "category": {
        "id": 1,
        "name": "Grains"
      },
      "productUnits": [
        {
          "id": 1,
          "rate": 150.50,
          "unit": {
            "id": 1,
            "name": "KG"
          }
        }
      ],
      "stock": {
        "id": 1,
        "stockQuantity": 100,
        "unit": "KG"
      }
    }
  ]
}
```

## Updated Stock API

All stock endpoints now return products with their associated units and rates:

```json
{
  "id": 1,
  "stockQuantity": 100,
  "unit": "KG",
  "product": {
    "id": 1,
    "productName": "Premium Rice",
    "description": "High quality rice",
    "productUnits": [
      {
        "id": 1,
        "rate": 150.50,
        "unit": {
          "id": 1,
          "name": "KG"
        }
      },
      {
        "id": 2,
        "rate": 3000.00,
        "unit": {
          "id": 2,
          "name": "BORI"
        }
      }
    ]
  },
  "inventory": {
    "id": 1,
    "inventoryName": "Main Warehouse"
  }
}
```

## Migration Notes

### Data Migration
- All existing `ratePerKg` and `ratePerBori` values were automatically migrated to the `product_units` table
- KG and BORI units were automatically created
- No data loss occurred during migration

### Backward Compatibility
- Old API responses now include `productUnits` array instead of `ratePerKg`/`ratePerBori` fields
- Frontend applications need to be updated to use the new structure

## Benefits

1. **Flexibility**: Can add any number of units per product
2. **Scalability**: Easy to add new unit types without schema changes
3. **Maintainability**: Centralized unit management
4. **Data Integrity**: Foreign key constraints ensure data consistency
5. **Performance**: Proper indexing on junction table for fast queries

## Usage Examples

### Getting Product Rate for Specific Unit
```javascript
// Find rate for product ID 1 in KG unit
const productUnit = await ProductUnits.findOne({
  where: { product_id: 1, unit_id: 1 }, // unit_id 1 = KG
  include: [{ model: Unit, as: 'unit' }]
});
console.log(`Rate: ${productUnit.rate} per ${productUnit.unit.name}`);
```

### Adding New Unit Type
```javascript
// Add new unit
const newUnit = await Unit.create({ name: 'GRAM' });

// Add rate for existing product in new unit
await ProductUnits.create({
  product_id: 1,
  unit_id: newUnit.id,
  rate: 0.15 // 0.15 per gram
});
```