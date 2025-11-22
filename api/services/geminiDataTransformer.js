import { createProduct } from './supabaseProductService.js';
import crypto from 'node:crypto';

/**
 * @typedef {Object} GeminiProduct
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} brand - Product brand
 * @property {string} category - Product category
 * @property {string} imageUrl - Product image URL
 * @property {string} productUrl - Product page URL
 * @property {number} rating - Product rating (0-5)
 * @property {number} reviewCount - Number of reviews
 * @property {string} sourcePlatform - Source platform
 * @property {string} description - Product description
 * @property {string[]} features - Key product features
 * @property {Object} specifications - Product specifications
 */

/**
 * @typedef {Object} SupabaseProduct
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} brand - Product brand
 * @property {string} category - Product category
 * @property {string} imageUrl - Product image URL
 * @property {string} productUrl - Product page URL
 * @property {number} rating - Product rating (0-5)
 * @property {number} reviewCount - Number of reviews
 * @property {string} sourcePlatform - Source platform
 */

/**
 * @typedef {Object} TransformedProduct
 * @property {string} id - UUID
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} brand - Product brand
 * @property {string} category - Product category
 * @property {string} imageUrl - Product image URL
 * @property {string} productUrl - Product page URL
 * @property {number} rating - Product rating (0-5)
 * @property {number} reviewCount - Number of reviews
 * @property {string} sourcePlatform - Source platform
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Update timestamp
 * @property {string} description - Product description
 * @property {string[]} features - Product features
 * @property {Object} specifications - Product specifications
 */

/**
 * Transform Gemini product data to Supabase format
 */
export function transformGeminiToSupabase(geminiProduct) {
  return {
    name: geminiProduct.name.trim(),
    price: Math.max(0, parseFloat(geminiProduct.price.toString()) || 0),
    brand: geminiProduct.brand.trim(),
    category: geminiProduct.category.trim(),
    imageUrl: validateAndFixUrl(geminiProduct.imageUrl),
    productUrl: validateAndFixUrl(geminiProduct.productUrl),
    rating: Math.max(0, Math.min(5, parseFloat(geminiProduct.rating?.toString() || '0'))),
    reviewCount: Math.max(0, parseInt(geminiProduct.reviewCount?.toString() || '0')),
    sourcePlatform: geminiProduct.sourcePlatform.trim() || 'Gemini'
  };
}

/**
 * Transform and store Gemini products in Supabase with additional metadata
 */
export async function storeGeminiProductsWithMetadata(
  geminiProducts,
  searchQuery,
  strategy
) {
  const results = {
    stored: 0,
    errors: [] as string[],
    products: [] as TransformedProduct[]
  };

  for (const geminiProduct of geminiProducts) {
    try {
      // Transform to Supabase format
      const supabaseData = transformGeminiToSupabase(geminiProduct);
      
      // Validate required fields
      if (!supabaseData.name || !supabaseData.brand || !supabaseData.category) {
        throw new Error('Missing required fields (name, brand, or category)');
      }

      if (supabaseData.price <= 0) {
        throw new Error('Invalid price: must be greater than 0');
      }

      // Store in Supabase
      const { data, error } = await createProduct(supabaseData);

      if (error) {
        results.errors.push(`Failed to store ${geminiProduct.name}: ${error.message}`);
        continue;
      }

      if (data) {
        // Create transformed product with metadata
        const transformedProduct = {
          ...data,
          description: geminiProduct.description || '',
          features: geminiProduct.features || [],
          specifications: geminiProduct.specifications || {},
          searchMetadata: {
            searchQuery,
            strategy,
            source: 'gemini'
          }
        };

        results.products.push(transformedProduct);
        results.stored++;
        console.log(`✅ Stored: ${data.name} (${data.brand}) - $${data.price}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMessage = `Error storing ${geminiProduct.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMessage);
      console.error('❌', errorMessage);
    }
  }

  console.log(`📊 Storage complete: ${results.stored} products stored, ${results.errors.length} errors`);
  return results;
}

/**
 * Validate and fix common URL issues
 */
function validateAndFixUrl(url) {
  if (!url || typeof url !== 'string') {
    return 'https://via.placeholder.com/300x300';
  }

  let fixedUrl = url.trim();
  
  // Fix common URL issues
  if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
    fixedUrl = 'https://' + fixedUrl;
  }

  // Validate URL format
  try {
    new URL(fixedUrl);
    return fixedUrl;
  } catch {
    // If URL is invalid, return placeholder
    return 'https://via.placeholder.com/300x300';
  }
}

/**
 * Batch process Gemini products with error handling
 */
export async function batchProcessGeminiProducts(
  geminiProducts,
  batchSize = 5,
  searchQuery,
  strategy
) {
  const allResults = {
    stored: 0,
    errors: [] as string[],
    products: [] as TransformedProduct[]
  };

  // Process in batches
  for (let i = 0; i < geminiProducts.length; i += batchSize) {
    const batch = geminiProducts.slice(i, i + batchSize);
    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(geminiProducts.length / batchSize)}`);
    
    try {
      const batchResult = await storeGeminiProductsWithMetadata(batch, searchQuery, strategy);
      
      allResults.stored += batchResult.stored;
      allResults.errors.push(...batchResult.errors);
      allResults.products.push(...batchResult.products);
      
      // Delay between batches
      if (i + batchSize < geminiProducts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      const batchError = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      allResults.errors.push(batchError);
      console.error('❌ Batch error:', batchError);
    }
  }

  return allResults;
}

/**
 * Generate search metadata for tracking
 */
export function generateSearchMetadata(
  searchQuery,
  strategy,
  geminiProducts
) {
  const prices = geminiProducts.map(p => p.price).filter(p => p > 0);
  const brands = [...new Set(geminiProducts.map(p => p.brand).filter(Boolean))];
  const categories = [...new Set(geminiProducts.map(p => p.category).filter(Boolean))];

  return {
    searchId: crypto.randomUUID(),
    timestamp: new Date(),
    query: searchQuery,
    strategy,
    productCount: geminiProducts.length,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      average: prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
    },
    brandCount: brands.length,
    categoryCount: categories.length
  };
}