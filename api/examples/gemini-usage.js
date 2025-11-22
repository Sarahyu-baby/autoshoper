import { searchProductsWithGemini } from '../services/geminiProductSearch.js';
import { storeGeminiProductsWithMetadata } from '../services/geminiDataTransformer.js';
import { generateSearchMetadata } from '../services/geminiDataTransformer.js';

/**
 * Example usage of Gemini product search functionality
 */

// Example 1: Search for products with different strategies
async function exampleSearch() {
  console.log('🚀 Starting Gemini product search examples...\n');

  const searchQueries = [
    {
      query: 'wireless headphones for gaming',
      strategy: 'fancy',
      description: 'Premium gaming headphones'
    },
    {
      query: 'laptop for students',
      strategy: 'cost-effective',
      description: 'Budget-friendly student laptops'
    },
    {
      query: 'smartphone',
      strategy: 'price-priority',
      description: 'Best value smartphones'
    }
  ];

  for (const { query, strategy, description } of searchQueries) {
    console.log(`🔍 Searching: ${description}`);
    console.log(`   Query: "${query}"`);
    console.log(`   Strategy: ${strategy}\n`);

    try {
      // Search for products
      const result = await searchProductsWithGemini(query, strategy);
      
      console.log(`✅ Found ${result.products.length} products`);
      console.log(`🎯 Strategy applied: ${result.strategy}`);
      console.log(`⏱️  Search time: ${result.metadata.searchTime}ms\n`);

      // Display first few products
      if (result.products.length > 0) {
        console.log('📦 Top products:');
        result.products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.brand})`);
          console.log(`      Rating: ${product.rating}/5 (${product.reviewCount} reviews)`);
          console.log(`      Category: ${product.category}\n`);
        });
      }

      // Generate and display search metadata
      const metadata = generateSearchMetadata(query, strategy, result.products);
      console.log(`📊 Search Metadata:`);
      console.log(`   Products found: ${metadata.productCount}`);
      console.log(`   Price range: $${metadata.priceRange.min} - $${metadata.priceRange.max}`);
      console.log(`   Average price: $${metadata.priceRange.average.toFixed(2)}`);
      console.log(`   Unique brands: ${metadata.brandCount}`);
      console.log(`   Categories: ${metadata.categoryCount}\n`);

      console.log('─'.repeat(60) + '\n');

    } catch (error) {
      console.error(`❌ Error searching for "${query}":`, error.message);
      console.log('─'.repeat(60) + '\n');
    }
  }
}

// Example 2: Search and store products in Supabase
async function exampleSearchAndStore() {
  console.log('🗄️  Starting search and store example...\n');

  const searchConfig = {
    query: 'gaming mouse',
    strategy: 'fancy',
    storeInDatabase: true
  };

  try {
    console.log(`🔍 Searching and storing: "${searchConfig.query}"`);
    console.log(`   Strategy: ${searchConfig.strategy}`);
    console.log(`   Store in database: ${searchConfig.storeInDatabase}\n`);

    // Search for products
    const searchResult = await searchProductsWithGemini(searchConfig.query, searchConfig.strategy);
    
    if (searchResult.products.length === 0) {
      console.log('⚠️  No products found to store');
      return;
    }

    // Store products in Supabase
    const storageResult = await storeGeminiProductsWithMetadata(
      searchResult.products,
      searchConfig.query,
      searchConfig.strategy
    );

    console.log(`✅ Storage Results:`);
    console.log(`   Products stored: ${storageResult.stored}`);
    console.log(`   Errors: ${storageResult.errors.length}`);
    
    if (storageResult.errors.length > 0) {
      console.log('   Error details:');
      storageResult.errors.forEach(error => console.log(`     - ${error}`));
    }

    console.log('\n📦 Stored Products:');
    storageResult.products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Features: ${product.features?.slice(0, 3).join(', ')}...`);
    });

  } catch (error) {
    console.error('❌ Error in search and store:', error.message);
  }
}

// Example 3: Batch processing example
async function exampleBatchProcessing() {
  console.log('\n📦 Starting batch processing example...\n');

  // Simulate multiple search results
  const mockGeminiProducts = [
    {
      name: 'Premium Wireless Headphones',
      price: 299.99,
      brand: 'Sony',
      category: 'Electronics',
      imageUrl: 'https://example.com/headphones.jpg',
      productUrl: 'https://example.com/product/123',
      rating: 4.5,
      reviewCount: 150,
      sourcePlatform: 'Gemini',
      description: 'High-quality wireless headphones with noise cancellation',
      features: ['Noise Cancellation', 'Wireless', 'Long Battery Life'],
      specifications: { battery: '30 hours', weight: '250g' }
    },
    {
      name: 'Gaming Laptop',
      price: 1299.99,
      brand: 'ASUS',
      category: 'Computers',
      imageUrl: 'https://example.com/laptop.jpg',
      productUrl: 'https://example.com/product/456',
      rating: 4.3,
      reviewCount: 89,
      sourcePlatform: 'Gemini',
      description: 'High-performance gaming laptop with RTX graphics',
      features: ['RTX Graphics', 'High Refresh Rate', 'RGB Keyboard'],
      specifications: { ram: '16GB', storage: '512GB SSD' }
    }
  ];

  try {
    const { batchProcessGeminiProducts } = await import('../services/geminiDataTransformer.js');
    
    console.log(`🔄 Processing ${mockGeminiProducts.length} products in batches...`);
    
    const result = await batchProcessGeminiProducts(
      mockGeminiProducts,
      2, // batch size
      'gaming electronics',
      'fancy'
    );

    console.log(`✅ Batch Processing Results:`);
    console.log(`   Products stored: ${result.stored}`);
    console.log(`   Errors: ${result.errors.length}`);
    console.log(`   Total products processed: ${result.products.length}`);

  } catch (error) {
    console.error('❌ Error in batch processing:', error.message);
  }
}

// Main execution function
async function runExamples() {
  console.log('🎯 Gemini Auto-Shopping Examples\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Run all examples
    await exampleSearch();
    await exampleSearchAndStore();
    await exampleBatchProcessing();

    console.log('\n🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export { exampleSearch, exampleSearchAndStore, exampleBatchProcessing };