# Forgot Password Functionality Documentation

## Overview

The forgot password functionality allows users to reset their passwords via email when they can't remember their current password. This implementation includes secure token generation, email notifications, and proper validation.

## Features

1. **Request Password Reset**: Users can request a password reset by providing their email
2. **Email Notification**: Users receive an email with a secure reset link
3. **Token Validation**: Reset tokens are validated for authenticity and expiration
4. **Password Reset**: Users can set a new password using the valid token
5. **Security**: Tokens expire after 1 hour and are single-use

## Database Changes

### Migration: `add-reset-token-to-users`

Added two new columns to the `user` table:
- `resetPasswordToken`: VARCHAR - Stores the reset token
- `resetPasswordExpires`: DATETIME - Stores token expiration time

### User Model Updates

Updated the User model to include the new fields:
```javascript
resetPasswordToken: {
  type: DataTypes.STRING,
  allowNull: true
},
resetPasswordExpires: {
  type: DataTypes.DATE,
  allowNull: true
}
```

## API Endpoints

### 1. Request Password Reset

**POST** `/api/users/forgot-password`

**Description**: Sends a password reset email to the user

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Security Note**: The response is the same whether the email exists or not, to prevent email enumeration attacks.

### 2. Validate Reset Token

**GET** `/api/users/validate-reset-token/:token`

**Description**: Validates if a reset token is valid and not expired

**Parameters**:
- `token` (path): The reset token from the email

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Reset token is valid",
  "data": {
    "email": "user@example.com",
    "fullname": "User Name"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

### 3. Reset Password

**POST** `/api/users/reset-password`

**Description**: Resets the user's password using a valid token

**Request Body**:
```json
{
  "token": "abc123def456...",
  "newPassword": "newSecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Email Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration for Password Reset
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### Other Email Services

You can use other email services by changing the `EMAIL_SERVICE` variable:
- `gmail`
- `outlook`
- `yahoo`
- Or configure custom SMTP settings in `emailService.js`

## Email Templates

### Password Reset Email

The system sends an HTML email with:
- Personalized greeting
- Reset button/link
- Token expiration notice (1 hour)
- Security disclaimer

### Password Reset Confirmation Email

After successful password reset:
- Confirmation message
- Security recommendations
- Contact information for unauthorized changes

## Security Features

1. **Token Expiration**: Tokens expire after 1 hour
2. **Single Use**: Tokens are cleared after successful password reset
3. **Secure Generation**: Uses crypto.randomBytes(32) for token generation
4. **Email Enumeration Protection**: Same response for existing/non-existing emails
5. **Password Validation**: Minimum 6 characters (customizable)
6. **Database Cleanup**: Failed email sends clear the token from database

## Usage Flow

1. **User requests password reset**:
   ```bash
   POST /api/users/forgot-password
   {
     "email": "user@example.com"
   }
   ```

2. **User receives email** with reset link:
   ```
   http://localhost:3000/reset-password?token=abc123def456...
   ```

3. **Frontend validates token** (optional):
   ```bash
   GET /api/users/validate-reset-token/abc123def456...
   ```

4. **User submits new password**:
   ```bash
   POST /api/users/reset-password
   {
     "token": "abc123def456...",
     "newPassword": "newSecurePassword123"
   }
   ```

5. **User receives confirmation email**

## Testing

Use the provided test file:
```bash
node test-forgot-password.js
```

### Manual Testing Steps

1. Start your server
2. Configure email settings in `.env`
3. Request password reset with a valid email
4. Check your email for the reset link
5. Extract the token from the URL
6. Test token validation endpoint
7. Reset password with the token
8. Verify the password was changed by logging in

## Error Handling

The implementation includes comprehensive error handling:
- Invalid/missing email
- Email sending failures
- Invalid/expired tokens
- Database errors
- Password validation errors

## Dependencies

- `nodemailer`: For sending emails
- `crypto`: For secure token generation (built-in Node.js module)
- `bcrypt`: For password hashing
- `sequelize`: For database operations

## Frontend Integration

Your frontend should:
1. Provide a "Forgot Password" form
2. Handle the reset password page with token parameter
3. Validate tokens before showing the reset form
4. Provide feedback for all operations
5. Redirect to login after successful reset

## Customization

You can customize:
- Token expiration time (currently 1 hour)
- Password validation rules
- Email templates in `emailService.js`
- Frontend URL structure
- Email service provider