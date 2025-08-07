// Simple test script to demonstrate authentication
// Run this after starting the server and running migrations/seeds

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/users';

async function testAuthentication() {
  try {
    console.log('🔐 Testing User Authentication System\n');

    // Test 1: Login with demo user
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'user@inventory.com',
      password: 'userPassword'
    });

    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user.fullname);
    console.log('Role:', loginResponse.data.data.user.role);
    
    const token = loginResponse.data.data.token;
    console.log('Token received:', token.substring(0, 50) + '...\n');

    // Test 2: Verify token
    console.log('2. Testing token verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Token verification successful!');
    console.log('Token is valid for user:', verifyResponse.data.data.user.fullname, '\n');

    // Test 3: Access protected route (own profile)
    console.log('3. Testing access to own profile...');
    const userId = loginResponse.data.data.user.id;
    const profileResponse = await axios.get(`${BASE_URL}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Profile access successful!');
    console.log('Profile data:', profileResponse.data.data.fullname, '\n');

    // Test 4: Try to access admin-only route (should fail)
    console.log('4. Testing access to admin-only route (should fail)...');
    try {
      await axios.get(`${BASE_URL}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ This should have failed!');
    } catch (error) {
      console.log('✅ Access denied as expected:', error.response.data.message, '\n');
    }

    // Test 5: Login as admin
    console.log('5. Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@inventory.com',
      password: 'managerPassword'
    });

    console.log('✅ Admin login successful!');
    const adminToken = adminLoginResponse.data.data.token;

    // Test 6: Access admin route with admin token
    console.log('6. Testing admin access to all users...');
    const allUsersResponse = await axios.get(`${BASE_URL}/`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('✅ Admin access successful!');
    console.log('Total users found:', allUsersResponse.data.data.length, '\n');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Only run if axios is available
if (require.resolve('axios')) {
  testAuthentication();
} else {
  console.log('Please install axios to run this test: npm install axios');
  console.log('Or test manually using curl commands from the documentation.');
}