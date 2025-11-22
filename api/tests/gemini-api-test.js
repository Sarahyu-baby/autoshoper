/**
 * API testing script for Gemini product search endpoints
 * Usage: node api/tests/gemini-api-test.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

/**
 * Test the Gemini search endpoint
 */
async function testGeminiSearch() {
  console.log('🔍 Testing Gemini search endpoint...');
  
  const testCases = [
    {
      query: 'wireless headphones',
      strategy: 'fancy',
      storeInDatabase: false
    },
    {
      query: 'budget laptop',
      strategy: 'cost-effective',
      storeInDatabase: true
    },
    {
      query: 'smartphone',
      strategy: 'price-priority',
      storeInDatabase: false
    }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: "${testCase.query}" with strategy "${testCase.strategy}"`);
      const body = {
        customerInput: testCase.query,
        strategy: { type: testCase.strategy },
        storeResults: testCase.storeInDatabase,
        realtime: true
      };
      const res = await fetch(`${API_BASE_URL}/gemini/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      console.log(`✅ Response received (${res.status})`);
      const data = json.data || json;
      const products = data.products || [];
      console.log(`📊 Found ${products.length} products`);
      console.log(`🎯 Strategy: ${data.strategy}`);
      console.log(`🌐 Realtime: ${data.realtime ? 'yes' : 'no'}`);
      if (products.length > 0) {
        const product = products[0];
        console.log(`📦 Top product: ${product.name} - $${product.price} (${product.brand})`);
      }
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
}

/**
 * Test the search-only endpoint (without database storage)
 */
async function testSearchOnly() {
  console.log('\n🔍 Testing search-only endpoint...');
  
  const testData = {
    customerInput: 'gaming mouse',
    strategy: { type: 'fancy' },
    realtime: true
  };
  
  try {
    const res = await fetch(`${API_BASE_URL}/gemini/search-only`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const json = await res.json();
    const products = (json.data && json.data.products) || [];
    console.log(`✅ Response received (${res.status})`);
    console.log(`📊 Found ${products.length} products`);
    console.log(`📝 Note: Products were not stored in database`);
    
  } catch (error) {
    console.error(`❌ Test failed:`, error.response?.data || error.message);
  }
}

/**
 * Test the strategies endpoint
 */
async function testStrategiesEndpoint() {
  console.log('\n🎯 Testing strategies endpoint...');
  
  try {
    const res = await fetch(`${API_BASE_URL}/gemini/strategies`);
    const response = await res.json();
    
    console.log(`✅ Response received (${response.status})`);
    console.log(`📋 Available strategies:`);
    
    if (response.data) {
      response.data.forEach(strategy => {
        console.log(`   • ${strategy.name}: ${strategy.description}`);
      });
    }
    
  } catch (error) {
    console.error(`❌ Test failed:`, error.response?.data || error.message);
  }
}

/**
 * Test the examples endpoint
 */
async function testExamplesEndpoint() {
  console.log('\n💡 Testing examples endpoint...');
  
  try {
    const res = await fetch(`${API_BASE_URL}/gemini/examples`);
    const response = await res.json();
    
    console.log(`✅ Response received (${response.status})`);
    console.log(`💬 Example queries:`);
    
    if (response.data) {
      response.data.examples.forEach((example, index) => {
        console.log(`   ${index + 1}. "${example.query}" (${example.strategy})`);
      });
    }
    
  } catch (error) {
    console.error(`❌ Test failed:`, error.response?.data || error.message);
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n🚨 Testing error handling...');
  
  const errorTestCases = [
    {
      name: 'Empty query',
      data: { query: '', strategy: 'fancy' },
      expectedError: true
    },
    {
      name: 'Invalid strategy',
      data: { query: 'test', strategy: 'invalid-strategy' },
      expectedError: true
    },
    {
      name: 'Missing strategy',
      data: { query: 'test' },
      expectedError: true
    },
    {
      name: 'Missing query',
      data: { strategy: 'fancy' },
      expectedError: true
    }
  ];
  
  for (const testCase of errorTestCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      
      const res = await fetch(`${API_BASE_URL}/gemini/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      });
      if (testCase.expectedError) {
        console.log(`⚠️  Expected error but got success response (${res.status})`);
      } else {
        console.log(`✅ No error as expected`);
      }
    } catch (error) {
      if (testCase.expectedError) {
        console.log(`✅ Error properly handled: ${error.message}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }
}

/**
 * Run all API tests
 */
async function runAllApiTests() {
  console.log('🚀 Running Gemini API Tests');
  console.log('='.repeat(50));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(50) + '\n');
  
  try {
    await testGeminiSearch();
    await testSearchOnly();
    await testStrategiesEndpoint();
    await testExamplesEndpoint();
    await testErrorHandling();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All API tests completed!');
    console.log('💡 Check the results above to see if everything is working correctly.');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    console.log('\n💡 Make sure your server is running and the API is accessible.');
    console.log('   Run: npm run dev (in the api directory)');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllApiTests().catch(console.error);
}

export { runAllApiTests };