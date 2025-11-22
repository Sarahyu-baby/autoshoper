import { searchProductsWithGemini } from '../services/geminiProductSearch.js';
import { storeGeminiProductsWithMetadata, batchProcessGeminiProducts } from '../services/geminiDataTransformer.js';
import { getGeminiModel } from '../config/gemini.js';

/**
 * Test suite for Gemini integration
 */

// Test 1: Verify Gemini API connection
async function testGeminiConnection() {
  console.log('🔌 Testing Gemini API connection...');
  
  try {
    const model = getGeminiModel();
    console.log('✅ Gemini model initialized successfully');
    
    // Test basic generation
    const result = await model.generateContent('Hello, this is a test.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Basic generation test passed');
    console.log(`📝 Response: ${text.substring(0, 50)}...\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Gemini connection test failed:', error.message);
    return false;
  }
}

// Test 2: Test product search with different strategies
async function testProductSearch() {
  console.log('🔍 Testing product search functionality...');
  
  const testCases = [
    { query: 'smartphone under $500', strategy: 'cost-effective' },
    { query: 'premium laptop', strategy: 'fancy' },
    { query: 'budget headphones', strategy: 'price-priority' }
  ];
  
  let passedTests = 0;
  
  for (const { query, strategy } of testCases) {
    try {
      console.log(`🧪 Testing: "${query}" with strategy "${strategy}"`);
      
      const result = await searchProductsWithGemini(query, strategy);
      
      // Validate results
      const hasProducts = result.products && result.products.length > 0;
      const hasMetadata = result.metadata && result.metadata.searchTime > 0;
      const correctStrategy = result.strategy === strategy;
      
      if (hasProducts && hasMetadata && correctStrategy) {
        console.log(`✅ Test passed: Found ${result.products.length} products`);
        passedTests++;
      } else {
        console.log(`❌ Test failed: Missing required data`);
      }
      
      // Log sample product
      if (result.products.length > 0) {
        const product = result.products[0];
        console.log(`📦 Sample product: ${product.name} - $${product.price} (${product.brand})`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed for "${query}":`, error.message);
    }
    console.log('');
  }
  
  console.log(`📊 Product search tests: ${passedTests}/${testCases.length} passed\n`);
  return passedTests === testCases.length;
}

// Test 3: Test data transformation and storage
async function testDataTransformation() {
  console.log('🔄 Testing data transformation...');
  
  const mockGeminiProduct = {
    name: 'Test Product',
    price: 99.99,
    brand: 'TestBrand',
    category: 'Electronics',
    imageUrl: 'https://example.com/image.jpg',
    productUrl: 'https://example.com/product',
    rating: 4.5,
    reviewCount: 100,
    sourcePlatform: 'Gemini',
    description: 'Test product description',
    features: ['Feature 1', 'Feature 2'],
    specifications: { weight: '1kg', color: 'black' }
  };
  
  try {
    // Test transformation
    const { transformGeminiToSupabase } = await import('../services/geminiDataTransformer.js');
    const transformed = transformGeminiToSupabase(mockGeminiProduct);
    
    // Validate transformation
    const requiredFields = ['name', 'price', 'brand', 'category', 'imageUrl', 'productUrl', 'rating', 'reviewCount', 'sourcePlatform'];
    const hasAllFields = requiredFields.every(field => transformed.hasOwnProperty(field));
    
    if (hasAllFields) {
      console.log('✅ Data transformation test passed');
      console.log(`📋 Transformed product: ${transformed.name} - $${transformed.price}`);
    } else {
      console.log('❌ Data transformation test failed: Missing required fields');
      return false;
    }
    
    // Test storage (if Supabase is configured)
    console.log('💾 Testing storage functionality...');
    const storageResult = await storeGeminiProductsWithMetadata([mockGeminiProduct], 'test query', 'test strategy');
    
    if (storageResult.stored > 0) {
      console.log('✅ Storage test passed');
      console.log(`📊 Stored ${storageResult.stored} product(s)`);
    } else if (storageResult.errors.length > 0) {
      console.log('⚠️  Storage test completed with errors (this might be expected if Supabase is not configured)');
      console.log(`❌ Errors: ${storageResult.errors.join(', ')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Data transformation test failed:', error.message);
    return false;
  }
}

// Test 4: Test batch processing
async function testBatchProcessing() {
  console.log('\n📦 Testing batch processing...');
  
  const mockProducts = Array.from({ length: 10 }, (_, i) => ({
    name: `Test Product ${i + 1}`,
    price: 50 + (i * 10),
    brand: 'TestBrand',
    category: 'Electronics',
    imageUrl: 'https://example.com/image.jpg',
    productUrl: 'https://example.com/product',
    rating: 4.0 + (i % 2),
    reviewCount: 50 + (i * 10),
    sourcePlatform: 'Gemini',
    description: `Test product ${i + 1} description`,
    features: [`Feature ${i + 1}`],
    specifications: { test: 'spec' }
  }));
  
  try {
    const result = await batchProcessGeminiProducts(mockProducts, 3, 'test batch', 'test strategy');
    
    console.log(`✅ Batch processing completed`);
    console.log(`📊 Processed: ${result.products.length} products`);
    console.log(`✅ Stored: ${result.stored} products`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('⚠️  Some products failed to store (this might be expected if Supabase is not configured)');
    }
    
    return result.products.length > 0;
    
  } catch (error) {
    console.error('❌ Batch processing test failed:', error.message);
    return false;
  }
}

// Test 5: Test error handling
async function testErrorHandling() {
  console.log('\n🚨 Testing error handling...');
  
  const errorTestCases = [
    { query: '', strategy: 'fancy', expectedError: true },
    { query: 'test', strategy: 'invalid-strategy', expectedError: true },
    { query: 'a'.repeat(1000), strategy: 'cost-effective', expectedError: false } // Very long query
  ];
  
  let handledErrors = 0;
  
  for (const { query, strategy, expectedError } of errorTestCases) {
    try {
      await searchProductsWithGemini(query, strategy);
      if (expectedError) {
        console.log(`⚠️  Expected error not caught for: "${query}"`);
      } else {
        console.log(`✅ No error as expected for: "${query}"`);
        handledErrors++;
      }
    } catch (error) {
      if (expectedError) {
        console.log(`✅ Error properly handled for: "${query}"`);
        console.log(`   Error: ${error.message}`);
        handledErrors++;
      } else {
        console.log(`❌ Unexpected error for: "${query}"`);
        console.log(`   Error: ${error.message}`);
      }
    }
  }
  
  console.log(`📊 Error handling tests: ${handledErrors}/${errorTestCases.length} passed\n`);
  return handledErrors === errorTestCases.length;
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Running Gemini Integration Tests\n');
  console.log('='.repeat(50) + '\n');
  
  const tests = [
    { name: 'Gemini Connection', fn: testGeminiConnection },
    { name: 'Product Search', fn: testProductSearch },
    { name: 'Data Transformation', fn: testDataTransformation },
    { name: 'Batch Processing', fn: testBatchProcessing },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  const results = [];
  
  for (const { name, fn } of tests) {
    console.log(`\n🎯 Starting: ${name}`);
    console.log('-'.repeat(30));
    
    try {
      const passed = await fn();
      results.push({ name, passed, status: passed ? '✅ PASSED' : '❌ FAILED' });
    } catch (error) {
      console.error(`❌ Test "${name}" crashed:`, error.message);
      results.push({ name, passed: false, status: '💥 CRASHED' });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(({ name, status }) => {
    console.log(`${status} ${name}`);
  });
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Gemini integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the configuration and try again.');
  }
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };