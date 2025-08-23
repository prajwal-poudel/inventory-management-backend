# Stock Controller Helper Modules

This directory contains helper modules that support the main `stockController.js` file. The code has been refactored to improve maintainability and organization.

## File Structure

### `stockHelpers.js`
Contains utility functions for role-based access control and data processing:
- `getManagedInventoryIds()` - Gets inventory IDs managed by admin users
- `validateInventoryAccess()` - Validates if user has access to specific inventory
- `buildInventoryWhereClause()` - Builds Sequelize where clauses for inventory filtering
- `checkAdminInventoryAccess()` - Checks admin access and returns appropriate responses
- `processAggregatedStock()` - Processes raw stock aggregation results
- `groupTransfersByStock()` - Groups stock transfers by stock combination
- `attachTransfersToStock()` - Attaches transfer data to stock results

### `stockValidators.js`
Contains validation functions for request data:
- `validateStockCreationFields()` - Validates required fields for stock creation
- `validateTransferMethod()` - Validates transfer method requirements
- `validateStockQuantity()` - Validates stock quantity is positive
- `validateInOutField()` - Validates in_out field values
- `validateOperation()` - Validates operation types for quantity updates
- `validateUnitExists()` - Checks if unit exists in database
- `validateProductExists()` - Checks if product exists in database
- `validateInventoryExists()` - Checks if inventory exists in database
- `validateEntitiesExist()` - Validates all required entities exist
- `validateThreshold()` - Validates and parses threshold values

### `stockQueries.js`
Contains Sequelize query builders and configurations:
- `getStockIncludes()` - Full association includes for stock queries
- `getAggregatedIncludes()` - Slim includes for aggregated queries
- `getStockAggregationAttributes()` - Attributes for stock aggregation
- `getStockAggregationOrder()` - Order clauses for stock aggregation
- `getStockAggregationGroup()` - Group clauses for stock aggregation
- `getFullStockGroup()` - Group clauses for full stock queries
- `buildTransferWhereClause()` - Builds where clauses for transfer queries
- `getStockTransferIncludes()` - Includes for stock transfer queries
- `buildLowStockHaving()` - Having clauses for low stock queries
- `getLowStockOrder()` - Order clauses for low stock queries
- Various summary-related query builders

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a specific responsibility
2. **Reusability**: Helper functions can be easily reused across different endpoints
3. **Maintainability**: Easier to locate and modify specific functionality
4. **Testability**: Individual functions can be unit tested more easily
5. **Readability**: Main controller file is now much cleaner and easier to understand

## Usage

The main `stockController.js` imports these helper modules and uses their functions throughout the various endpoints. All role-based access control logic, validation, and query building is now centralized in these helper modules.

## Role-Based Access Control

The refactored code maintains all the role-based access control functionality:
- **SuperAdmin**: Full access to all inventories and stock
- **Admin**: Access only to managed inventories (defined in Manages table)
- **Other roles**: No inventory access

All endpoints properly validate access and return appropriate HTTP status codes (403 for unauthorized access).