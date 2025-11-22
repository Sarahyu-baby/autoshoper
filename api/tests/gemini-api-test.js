import axios from 'axios';

/**
 * API testing script for Gemini product search endpoints
 * Usage: node api-tests/gemini-api-test.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
      
      const response = await axiosInstance.post('/gemini/search', testCase);
      
      console.log(`✅ Response received (${response.status})`);
      console.log(`📊 Found ${response.data.products?.length || 0} products`);
      console.log(`🎯 Strategy: ${response.data.strategy}`);
      console.log(`⏱️  Search time: ${response.data.metadata?.searchTime}ms`);
      
      // Show first product as example
      if (response.data.products?.length > 0) {
        const product = response.data.products[0];
        console.log(`📦 Top product: ${product.name} - $${product.price} (${product.brand})`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.response?.data || error.message);
    }
  }
}

/**
 * Test the search-only endpoint (without database storage)
 */
async function testSearchOnly() {
  console.log('\n🔍 Testing search-only endpoint...');
  
  const testData = {
    query: 'gaming mouse',
    strategy: 'fancy'
  };
  
  try {
    const response = await axiosInstance.post('/gemini/search-only', testData);
    
    console.log(`✅ Response received (${response.status})`);
    console.log(`📊 Found ${response.data.products?.length || 0} products`);
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
    const response = await axiosInstance.get('/gemini/strategies');
    
    console.log(`✅ Response received (${response.status})`);
    console.log(`📋 Available strategies:`);
    
    if (response.data.strategies) {
      response.data.strategies.forEach(strategy => {
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
    const response = await axiosInstance.get('/gemini/examples');
    
    console.log(`✅ Response received (${response.status})`);
    console.log(`💬 Example queries:`);
    
    if (response.data.examples) {
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
      
      const response = await axiosInstance.post('/gemini/search', testCase.data);
      
      if (testCase.expectedError) {
        console.log(`⚠️  Expected error but got success response`);
      } else {
        console.log(`✅ No error as expected`);
      }
      
    } catch (error) {
      if (testCase.expectedError) {
        console.log(`✅ Error properly handled: ${error.response?.data?.error || error.message}`);
      } else {
        console.log(`❌ Unexpected error: ${error.response?.data?.error || error.message}`);
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