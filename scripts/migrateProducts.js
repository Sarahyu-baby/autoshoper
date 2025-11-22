import { createProduct } from '../api/services/supabaseProductService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Example products to insert into Supabase
 * These will be assigned new UUIDs automatically
 */
const exampleProducts = [
  {
    name: 'iPhone 15 Pro Max',
    price: 1199.00,
    brand: 'Apple',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/iphone-15-pro-max',
    rating: 4.8,
    reviewCount: 2547,
    sourcePlatform: 'Amazon'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.00,
    brand: 'Samsung',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/galaxy-s24-ultra',
    rating: 4.7,
    reviewCount: 1892,
    sourcePlatform: 'Amazon'
  },
  {
    name: 'Google Pixel 8 Pro',
    price: 999.00,
    brand: 'Google',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/pixel-8-pro',
    rating: 4.6,
    reviewCount: 1234,
    sourcePlatform: 'Best Buy'
  },
  {
    name: 'OnePlus 12',
    price: 799.00,
    brand: 'OnePlus',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/oneplus-12',
    rating: 4.5,
    reviewCount: 892,
    sourcePlatform: 'Amazon'
  },
  {
    name: 'Xiaomi 14 Ultra',
    price: 699.00,
    brand: 'Xiaomi',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/xiaomi-14-ultra',
    rating: 4.4,
    reviewCount: 567,
    sourcePlatform: 'AliExpress'
  }
];

/**
 * Insert example products into the database
 */
async function insertExampleProducts() {
  console.log('🚀 Starting product insertion...');
  console.log(`📍 Supabase URL: ${process.env.SUPABASE_URL}`);

  const results = [];
  
  for (const productData of exampleProducts) {
    try {
      console.log(`➕ Inserting: ${productData.name}...`);
      
      const { data, error } = await createProduct(productData);
      
      if (error) {
        console.error(`❌ Failed to insert ${productData.name}:`, error.message);
        results.push({ success: false, name: productData.name, error: error.message });
      } else {
        console.log(`✅ Successfully inserted ${productData.name} with ID: ${data.id}`);
        results.push({ success: true, name: productData.name, id: data.id });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`💥 Unexpected error inserting ${productData.name}:`, error);
      results.push({ success: false, name: productData.name, error: error.message });
    }
  }

  console.log('\n📊 Insertion Summary:');
  console.log(`Total products: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  if (results.some(r => !r.success)) {
    console.log('\n❌ Failed products:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n🎉 Product insertion completed!');
  
  return results;
}

/**
 * Test the database connection
 */
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    const { data, error } = await createProduct({
      name: 'Test Product',
      price: 99.99,
      brand: 'Test Brand',
      category: 'Test Category',
      imageUrl: 'https://via.placeholder.com/300x300',
      productUrl: 'https://example.com/test-product',
      sourcePlatform: 'Test Platform'
    });

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Connection test successful! Product ID:', data.id);
    
    // Clean up test product
    const { supabase } = await import('../api/config/supabase.js');
    await supabase.from('products').delete().eq('id', data.id);
    console.log('🧹 Cleaned up test product');
    
    return true;
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return false;
  }
}

/**
 * Main function to run the insertion script
 */
async function main() {
  console.log('🎯 Supabase Product Migration Script');
  console.log('=====================================\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables:');
    if (!process.env.SUPABASE_URL) console.error('   - SUPABASE_URL');
    if (!process.env.SUPABASE_ANON_KEY) console.error('   - SUPABASE_ANON_KEY');
    console.error('\nPlease copy .env.example to .env and fill in your Supabase credentials.');
    process.exit(1);
  }

  // Test connection first
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('\n❌ Cannot proceed with product insertion. Please check your Supabase configuration.');
    process.exit(1);
  }

  console.log('\n🚀 Starting product insertion...\n');
  
  try {
    await insertExampleProducts();
    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the script if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { insertExampleProducts, testConnection };