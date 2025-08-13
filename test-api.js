const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test function to verify API endpoints
async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test 1: Get all units
    console.log('1. Testing GET /units');
    const unitsResponse = await axios.get(`${BASE_URL}/units`);
    console.log('✅ Units retrieved successfully');
    console.log(`   Found ${unitsResponse.data.data.length} units`);
    
    // Test 2: Get all categories
    console.log('\n2. Testing GET /categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories retrieved successfully');
    console.log(`   Found ${categoriesResponse.data.data.length} categories`);

    // Test 3: Get all products
    console.log('\n3. Testing GET /products');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products retrieved successfully');
    console.log(`   Found ${productsResponse.data.data.length} products`);
    
    // Test 4: Get all inventories
    console.log('\n4. Testing GET /inventories');
    const inventoriesResponse = await axios.get(`${BASE_URL}/inventories`);
    console.log('✅ Inventories retrieved successfully');
    console.log(`   Found ${inventoriesResponse.data.data.length} inventories`);

    // Test 5: Get all stock
    console.log('\n5. Testing GET /stock');
    const stockResponse = await axios.get(`${BASE_URL}/stock`);
    console.log('✅ Stock retrieved successfully');
    console.log(`   Found ${stockResponse.data.data.length} stock records`);

    // Test 6: Get product units
    console.log('\n6. Testing GET /product-units');
    const productUnitsResponse = await axios.get(`${BASE_URL}/product-units`);
    console.log('✅ Product units retrieved successfully');
    console.log(`   Found ${productUnitsResponse.data.data.length} product-unit combinations`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Units: ${unitsResponse.data.data.length}`);
    console.log(`   - Categories: ${categoriesResponse.data.data.length}`);
    console.log(`   - Products: ${productsResponse.data.data.length}`);
    console.log(`   - Inventories: ${inventoriesResponse.data.data.length}`);
    console.log(`   - Stock records: ${stockResponse.data.data.length}`);
    console.log(`   - Product-unit combinations: ${productUnitsResponse.data.data.length}`);

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testAPI();