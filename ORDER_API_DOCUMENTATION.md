# Order API Documentation

This document describes the Order API endpoints for the Inventory Management System.

## Base URL
All endpoints are prefixed with `/api/orders`

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Orders
- **URL:** `GET /api/orders`
- **Auth Required:** Yes (Admin only)
- **Description:** Retrieve all orders with customer, product, and delivery information
- **Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "productId": 1,
      "inventoryId": 1,
      "quantity": 10.5,
      "unit": "kg",
      "status": "pending",
      "paymentMethod": "cash",
      "orderDate": "2024-01-15T10:30:00.000Z",
      "totalAmount": 525.00,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "customer": {
        "id": 1,
        "customerName": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "product": {
        "id": 1,
        "productName": "Rice",
        "ratePerKg": 50.00,
        "ratePerBori": 2500.00
      },
      "inventory": {
        "id": 1,
        "inventoryName": "Main Warehouse",
        "address": "123 Storage St",
        "contactNumber": "555-0123"
      },
      "delivery": {
        "id": 1,
        "deliveryDate": "2024-01-16T10:00:00.000Z",
        "deliveryStatus": "pending",
        "deliveryAddress": "123 Main St"
      }
    }
  ]
}
```

### 2. Get Order by ID
- **URL:** `GET /api/orders/:id`
- **Auth Required:** Yes (Admin only)
- **Description:** Retrieve a specific order by ID
- **Parameters:**
  - `id` (path parameter): Order ID
- **Response:** Same as single order object from Get All Orders

### 3. Create New Order
- **URL:** `POST /api/orders`
- **Auth Required:** Yes (Admin only)
- **Description:** Create a new order
- **Request Body:**
```json
{
  "customerId": 1,
  "productId": 1,
  "inventoryId": 1,
  "quantity": 10.5,
  "unit": "kg",
  "status": "pending",
  "paymentMethod": "cash",
  "orderDate": "2024-01-15T10:30:00.000Z",
  "totalAmount": 525.00
}
```
- **Required Fields:** `customerId`, `productId`, `inventoryId`, `quantity`, `unit`, `totalAmount`
- **Valid Units:** `kg`, `bori`
- **Valid Statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- **Valid Payment Methods:** `cash`, `cheque`, `card`, `no`
- **Response:** Created order object with associations

### 4. Update Order
- **URL:** `PUT /api/orders/:id`
- **Auth Required:** Yes (Admin only)
- **Description:** Update an existing order
- **Parameters:**
  - `id` (path parameter): Order ID
- **Request Body:** Same as Create Order (all fields optional)
- **Response:** Updated order object with associations

### 5. Delete Order
- **URL:** `DELETE /api/orders/:id`
- **Auth Required:** Yes (Super Admin only)
- **Description:** Delete an order
- **Parameters:**
  - `id` (path parameter): Order ID
- **Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

### 6. Get Orders by Customer
- **URL:** `GET /api/orders/customer/:customerId`
- **Auth Required:** Yes (Admin only)
- **Description:** Retrieve all orders for a specific customer
- **Parameters:**
  - `customerId` (path parameter): Customer ID
- **Response:** Array of orders for the specified customer

### 7. Get Orders by Status
- **URL:** `GET /api/orders/status/:status`
- **Auth Required:** Yes (Admin only)
- **Description:** Retrieve all orders with a specific status
- **Parameters:**
  - `status` (path parameter): Order status
- **Valid Statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- **Response:** Array of orders with the specified status

### 8. Get Orders by Inventory
- **URL:** `GET /api/orders/inventory/:inventoryId`
- **Auth Required:** Yes (Admin only)
- **Description:** Retrieve all orders for a specific inventory
- **Parameters:**
  - `inventoryId` (path parameter): Inventory ID
- **Response:** Array of orders for the specified inventory

### 9. Update Order Status
- **URL:** `PATCH /api/orders/:id/status`
- **Auth Required:** Yes (Admin only)
- **Description:** Update only the status of an order
- **Parameters:**
  - `id` (path parameter): Order ID
- **Request Body:**
```json
{
  "status": "confirmed"
}
```
- **Valid Statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- **Response:** Updated order object with associations

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
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
  "message": "Order not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Notes

1. All timestamps are in ISO 8601 format
2. Monetary amounts are stored as DOUBLE precision numbers
3. Order status follows a typical order lifecycle: pending → confirmed → shipped → delivered
4. Orders can be cancelled at any stage
5. The system validates that referenced customers, products, and inventories exist before creating/updating orders
6. Quantity can be decimal values to support fractional units
7. Payment method "no" indicates no payment method specified or payment pending
8. Each order is now linked to a specific inventory location to track where the order is placed
9. The inventory relationship helps in inventory management and stock tracking
10. Orders can be filtered by inventory to see all orders for a specific warehouse/location