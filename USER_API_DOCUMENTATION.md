# User API Documentation

## Base URL
All user endpoints are prefixed with `/api/users`

## Authentication
This API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Access Levels
- **Public**: No authentication required
- **User**: Requires valid JWT token
- **Admin**: Requires admin or superadmin role
- **Super Admin**: Requires superadmin role
- **Owner/Admin**: User can access own resources, admin can access any

## Endpoints

### Authentication Endpoints

#### 1. Login
- **URL:** `POST /api/users/login`
- **Access:** Public
- **Description:** Authenticate user and get JWT token
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Verify Token
- **URL:** `GET /api/users/verify-token`
- **Access:** User (requires valid token)
- **Description:** Verify if JWT token is valid
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "tokenData": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "iat": 1701388800,
      "exp": 1701475200
    }
  }
}
```

#### 3. Change Password
- **URL:** `PUT /api/users/:id/change-password`
- **Access:** Owner/Admin
- **Description:** Change user password
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### CRUD Endpoints

#### 4. Get All Users
- **URL:** `GET /api/users`
- **Access:** Admin
- **Description:** Retrieve all users (passwords excluded)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "Super Admin",
      "email": "superadmin@inventory.com",
      "role": "superadmin",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ]
}
```

#### 5. Get User by ID
- **URL:** `GET /api/users/:id`
- **Access:** Owner/Admin
- **Description:** Retrieve a specific user by ID
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:** 
  - `id` (path parameter) - User ID
- **Response:** Same as above but for single user

#### 6. Get Users by Role
- **URL:** `GET /api/users/role/:role`
- **Access:** Admin
- **Description:** Retrieve users by role
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:** 
  - `role` (path parameter) - Role (admin, superadmin, user)
- **Response:** Array of users with specified role

#### 7. Create User
- **URL:** `POST /api/users`
- **Access:** Admin
- **Description:** Create a new user
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 6,
    "fullname": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-12-01T00:00:00.000Z",
    "updatedAt": "2024-12-01T00:00:00.000Z"
  }
}
```

#### 8. Update User
- **URL:** `PUT /api/users/:id`
- **Access:** Owner/Admin
- **Description:** Update an existing user
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:** 
  - `id` (path parameter) - User ID
- **Request Body:** (all fields optional)
```json
{
  "fullname": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```
- **Response:** Updated user object

#### 9. Delete User
- **URL:** `DELETE /api/users/:id`
- **Access:** Super Admin
- **Description:** Delete a user
- **Headers:** `Authorization: Bearer <token>`
- **Parameters:** 
  - `id` (path parameter) - User ID
- **Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Full name, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

```json
{
  "success": false,
  "message": "Access token required"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role: admin or superadmin"
}
```

```json
{
  "success": false,
  "message": "Access denied. You can only access your own resources."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating user",
  "error": "Detailed error message"
}
```

## User Roles
- `user` - Regular user (default)
- `admin` - Administrator
- `superadmin` - Super administrator

## Security Features
- Passwords are automatically hashed using bcrypt
- Passwords are never returned in API responses
- Email uniqueness is enforced
- Input validation for required fields

## Demo Users (from seed data)
- **Super Admin:** superadmin@inventory.com / adminPassword
- **Admin:** admin@inventory.com / managerPassword
- **Staff:** staff@inventory.com / staffPassword
- **User:** user@inventory.com / userPassword
- **John Doe:** john.doe@inventory.com / userPassword

## JWT Token Information
- **Secret:** Configured in environment variable `JWT_SECRET`
- **Expiration:** 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Payload includes:** user ID, email, and role
- **Algorithm:** HS256

## Middleware Usage
The API includes several middleware functions for authentication and authorization:

### `authenticateToken`
Verifies JWT token and adds user information to request object.

### `requireRole(roles)`
Checks if authenticated user has one of the specified roles.

### `requireAdmin`
Shorthand for requiring admin or superadmin role.

### `requireSuperAdmin`
Requires superadmin role only.

### `requireOwnershipOrAdmin`
Allows access if user owns the resource (same user ID) or has admin privileges.

## Example Usage

### 1. Login and get token
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@inventory.com", "password": "userPassword"}'
```

### 2. Use token to access protected route
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3. Change password
```bash
curl -X PUT http://localhost:3000/api/users/1/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "userPassword", "newPassword": "newpassword123"}'
```