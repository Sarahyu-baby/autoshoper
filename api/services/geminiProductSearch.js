import genAI, { getGeminiModel } from '../config/gemini.js';
import { createProduct } from './supabaseProductService.js';
// no external uuid dependency

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
 * @typedef {Object} SearchStrategy
 * @property {'fancy' | 'cost-effective' | 'price-priority'} type - Strategy type
 * @property {number} [maxPrice] - Maximum price limit
 * @property {number} [minPrice] - Minimum price limit
 * @property {string[]} [preferredBrands] - Preferred brands
 * @property {string[]} [excludedBrands] - Brands to exclude
 * @property {number} [minRating] - Minimum rating requirement
 */

/**
 * Generate a product search prompt for Gemini based on customer input and strategy
 */
function generateSearchPrompt(customerInput, strategy) {
  const basePrompt = `You are a product search assistant. Based on the customer's request and their shopping strategy, find the best products.

Customer Request: "${customerInput}"

Shopping Strategy: ${strategy.type}
${strategy.maxPrice ? `Maximum Price: $${strategy.maxPrice}` : ''}
${strategy.minPrice ? `Minimum Price: $${strategy.minPrice}` : ''}
${strategy.preferredBrands?.length ? `Preferred Brands: ${strategy.preferredBrands.join(', ')}` : ''}
${strategy.excludedBrands?.length ? `Excluded Brands: ${strategy.excludedBrands.join(', ')}` : ''}
${strategy.minRating ? `Minimum Rating: ${strategy.minRating}/5` : ''}

Please provide a JSON array of 5-10 products that match this criteria. Each product should include:
{
  "name": "Product Name",
  "price": 999.99,
  "brand": "Brand Name",
  "category": "Category",
  "imageUrl": "https://example.com/image.jpg",
  "productUrl": "https://example.com/product",
  "rating": 4.5,
  "reviewCount": 100,
  "sourcePlatform": "Amazon/BestBuy/etc",
  "description": "Brief product description",
  "features": ["feature1", "feature2", "feature3"],
  "specifications": {
    "key": "value"
  }
}

Strategy Guidelines:
- **Fancy**: Focus on premium brands, high-quality materials, luxury features, latest technology
- **Cost-effective**: Balance price and quality, good value for money, reliable brands
- **Price-priority**: Lowest price options, basic functionality, acceptable quality

Return only the JSON array, no additional text.`;

  return basePrompt;
}

/**
 * Search for products using Gemini AI based on customer input and strategy
 */
export async function searchProductsWithGemini(
  customerInput,
  strategy
) {
  try {
    if (!customerInput || customerInput.trim().length === 0) {
      throw new Error('Customer input is required');
    }

    if (!strategy || !strategy.type) {
      throw new Error('Search strategy is required');
    }

    let products = [];
    const useRealtime = !!strategy.realtime && !!process.env.SERPAPI_KEY;

    if (useRealtime) {
      console.log('🌐 Using real-time shopping data source (SerpAPI)');
      products = await fetchSerpApiShoppingResults(customerInput);
    } else {
      const prompt = generateSearchPrompt(customerInput, strategy);
      console.log(`🔍 Searching for: "${customerInput}" with ${strategy.type} strategy [LLM-only]`);
      let model = await getGeminiModel();
      let text;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (err) {
        const isNotFound = (err && (err.status === 404 || /Not Found/i.test(String(err))));
        if (isNotFound) {
          const candidates = ['gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
          let success = false;
          for (const name of candidates) {
            try {
              model = await getGeminiModel(name);
              const r = await model.generateContent(prompt);
              const resp = await r.response;
              text = resp.text();
              success = true;
              break;
            } catch (e) {
              continue;
            }
          }
          if (!success) throw err;
        } else {
          throw err;
        }
      }
      console.log('🤖 Gemini Response:', String(text).substring(0, 200) + '...');
      try {
        products = JSON.parse(text);
      } catch (parseError) {
        const jsonMatch = String(text).match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          products = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from Gemini');
        }
      }
    }

    // Validate and filter products based on strategy
    const validatedProducts = validateAndFilterProducts(products, strategy);
    
    console.log(`✅ Found ${validatedProducts.length} validated products`);
    
    return {
      products: validatedProducts,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Error searching products with Gemini:', error);
    const msg = String(error?.message || '');
    const isModelError = /not found for API version/i.test(msg) || /supported for generateContent/i.test(msg) || /404/i.test(msg);
    if (isModelError) {
      const mock = generateMockProducts(customerInput, strategy);
      console.warn('⚠️ Using mock products due to model/version mismatch');
      return { products: mock, success: true };
    }
    return {
      products: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validate and filter products based on strategy criteria
 */
function validateAndFilterProducts(products, strategy) {
  if (!Array.isArray(products)) {
    console.warn('⚠️ Gemini response is not an array');
    return [];
  }

  return products
    .filter(product => {
      // Basic validation
      if (!product.name || !product.price || !product.brand || !product.category) {
        return false;
      }

      // Price validation
      if (typeof product.price !== 'number' || product.price < 0) {
        return false;
      }

      // Strategy-specific filtering
      if (strategy.maxPrice && product.price > strategy.maxPrice) {
        return false;
      }

      if (strategy.minPrice && product.price < strategy.minPrice) {
        return false;
      }

      // Rating validation
      if (product.rating && (typeof product.rating !== 'number' || product.rating < 0 || product.rating > 5)) {
        return false;
      }

      if (strategy.minRating && (product.rating || 0) < strategy.minRating) {
        return false;
      }

      // Brand filtering
      if (strategy.preferredBrands?.length && !strategy.preferredBrands.includes(product.brand)) {
        return false;
      }

      if (strategy.excludedBrands?.length && strategy.excludedBrands.includes(product.brand)) {
        return false;
      }

      return true;
    })
    .map(product => ({
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl || product.image_url || 'https://via.placeholder.com/300x300',
      productUrl: product.productUrl || product.product_url || '#',
      rating: product.rating || 0,
      reviewCount: product.reviewCount || product.review_count || 0,
      sourcePlatform: product.sourcePlatform || product.source_platform || 'Unknown',
      description: product.description || '',
      features: product.features || [],
      specifications: product.specifications || {}
    }));
}

function generateMockProducts(query, strategy) {
  const brands = ['Acme', 'Contoso', 'Globex', 'Umbrella', 'Initech'];
  const categories = ['Electronics', 'Computers', 'Audio', 'Mobile', 'Accessories'];
  const basePrice = strategy?.type === 'price-priority' ? 29 : strategy?.type === 'cost-effective' ? 99 : 299;
  return Array.from({ length: 6 }, (_, i) => ({
    name: `${query} - Model ${i + 1}`,
    price: Math.round((basePrice + i * (strategy?.type === 'price-priority' ? 5 : strategy?.type === 'cost-effective' ? 20 : 50)) * 100) / 100,
    brand: brands[i % brands.length],
    category: categories[i % categories.length],
    imageUrl: 'https://via.placeholder.com/300x200',
    productUrl: '#',
    rating: strategy?.type === 'fancy' ? 4.5 : strategy?.type === 'cost-effective' ? 4.0 : 3.8,
    reviewCount: 50 + i * 10,
    sourcePlatform: 'Gemini (mock)',
    description: `Placeholder result for "${query}" aligned to ${strategy?.type} strategy`,
    features: ['Feature A', 'Feature B', 'Feature C'],
    specifications: { weight: `${0.5 + i * 0.1}kg` }
  }));
}

/**
 * Fetch real-time products from SerpAPI Google Shopping
 */
async function fetchSerpApiShoppingResults(query) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn('SERPAPI_KEY not configured; falling back to LLM-only');
    return [];
  }

  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: query,
    api_key: apiKey,
    num: '10'
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpAPI error: ${res.status} ${text}`);
  }
  const data = await res.json();
  const items = Array.isArray(data.shopping_results) ? data.shopping_results : [];

  return items.map((item) => ({
    name: item.title || item.product_title || 'Unknown',
    price: parsePrice(item.price || item.extracted_price),
    brand: item.brand || item.source || 'Unknown',
    category: item.product_category || 'Unknown',
    imageUrl: item.thumbnail || item.product_photos?.[0] || 'https://via.placeholder.com/300x300',
    productUrl: item.link || item.product_link || '#',
    rating: typeof item.rating === 'number' ? item.rating : (item.reviews_rating || 0),
    reviewCount: typeof item.reviews === 'number' ? item.reviews : (item.reviews_count || 0),
    sourcePlatform: 'Google Shopping',
    description: item.description || '',
    features: [],
    specifications: {}
  })).filter(p => typeof p.price === 'number' && p.price > 0);
}

function parsePrice(input) {
  if (typeof input === 'number') return input;
  if (typeof input !== 'string') return 0;
  const cleaned = input.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Store Gemini search results in Supabase database
 */
export async function storeGeminiProducts(products) {
  const results = {
    stored: 0,
    errors: []
  };

  for (const product of products) {
    try {
      // Transform Gemini product format to Supabase format
      const productData = {
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        productUrl: product.productUrl,
        rating: product.rating,
        reviewCount: product.reviewCount,
        sourcePlatform: product.sourcePlatform,
      };

      const { data, error } = await createProduct(productData);

      if (error) {
        results.errors.push(`Failed to store ${product.name}: ${error.message}`);
      } else {
        results.stored++;
        console.log(`✅ Stored product: ${product.name} (ID: ${data?.id})`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMessage = `Unexpected error storing ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMessage);
      console.error('❌', errorMessage);
    }
  }

  console.log(`📊 Storage complete: ${results.stored} products stored, ${results.errors.length} errors`);
  return results;
}

/**
 * Combined function: Search with Gemini and store in Supabase
 */
export async function searchAndStoreProducts(
  customerInput,
  strategy,
  storeResults = true
) {
  console.log(`🚀 Starting Gemini search and store process...`);
  
  // Search for products using Gemini
  const searchResult = await searchProductsWithGemini(customerInput, strategy);
  
  if (!searchResult.success) {
    return {
      products: [],
      stored: 0,
      errors: [searchResult.error || 'Search failed'],
      success: false
    };
  }

  console.log(`🔍 Found ${searchResult.products.length} products via Gemini`);

  // Store results in Supabase if requested
  let storageResult = { stored: 0, errors: [] };
  
  if (storeResults && searchResult.products.length > 0) {
    console.log('💾 Storing products in Supabase...');
    storageResult = await storeGeminiProducts(searchResult.products);
  }

  return {
    products: searchResult.products,
    stored: storageResult.stored,
    errors: storageResult.errors,
    success: true
  };
}