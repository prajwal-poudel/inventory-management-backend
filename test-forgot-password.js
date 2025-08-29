const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/users';

// Test forgot password functionality
async function testForgotPassword() {
  console.log('=== Testing Forgot Password Functionality ===\n');
  
  try {
    // Test 1: Request password reset
    console.log('1. Testing forgot password request...');
    const forgotResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'admin@example.com' // Use an existing email from your database
    });
    
    console.log('✅ Forgot password request successful:');
    console.log(forgotResponse.data);
    console.log();
    
    // Test 2: Validate reset token (you would get this from the email)
    // Note: In a real scenario, you'd get the token from the email
    console.log('2. Testing token validation...');
    console.log('⚠️  To test token validation, you need to:');
    console.log('   - Check your email for the reset link');
    console.log('   - Extract the token from the URL');
    console.log('   - Use GET /api/users/validate-reset-token/:token');
    console.log();
    
    // Test 3: Reset password (you would use the token from email)
    console.log('3. Testing password reset...');
    console.log('⚠️  To test password reset, you need to:');
    console.log('   - Get the token from the email');
    console.log('   - Use POST /api/users/reset-password with token and newPassword');
    console.log();
    
    // Test 4: Test with invalid email
    console.log('4. Testing with invalid email...');
    const invalidEmailResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'nonexistent@example.com'
    });
    
    console.log('✅ Invalid email test (should still return success for security):');
    console.log(invalidEmailResponse.data);
    console.log();
    
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.response?.data || error.message);
  }
}

// Test with missing email
async function testValidation() {
  console.log('=== Testing Validation ===\n');
  
  try {
    console.log('1. Testing forgot password without email...');
    await axios.post(`${BASE_URL}/forgot-password`, {});
  } catch (error) {
    console.log('✅ Validation error (expected):');
    console.log(error.response.data);
    console.log();
  }
  
  try {
    console.log('2. Testing reset password without token...');
    await axios.post(`${BASE_URL}/reset-password`, {
      newPassword: 'newpassword123'
    });
  } catch (error) {
    console.log('✅ Validation error (expected):');
    console.log(error.response.data);
    console.log();
  }
  
  try {
    console.log('3. Testing reset password with invalid token...');
    await axios.post(`${BASE_URL}/reset-password`, {
      token: 'invalid-token',
      newPassword: 'newpassword123'
    });
  } catch (error) {
    console.log('✅ Invalid token error (expected):');
    console.log(error.response.data);
    console.log();
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Forgot Password API Tests...\n');
  console.log('⚠️  Make sure your server is running on http://localhost:3000\n');
  console.log('⚠️  Make sure you have configured email settings in .env file\n');
  
  await testForgotPassword();
  await testValidation();
  
  console.log('✅ All tests completed!');
  console.log('\n📧 Don\'t forget to:');
  console.log('   1. Configure your email settings in .env file');
  console.log('   2. Use a real email address for testing');
  console.log('   3. Check your email for the reset link');
  console.log('   4. Test the complete flow with a real token');
}

// Run the tests
runTests().catch(console.error);