import { Router } from 'express';
import { searchAndStoreProducts, searchProductsWithGemini } from '../services/geminiProductSearch.js';
import { ShoppingStrategy } from '../types/strategy.js';

const router = Router();

/**
 * POST /api/gemini/search
 * Search for products using Gemini AI based on customer input and strategy
 */
router.post('/search', async (req, res) => {
  try {
    const { customerInput, strategy, storeResults = true } = req.body;

    // Validate required fields
    if (!customerInput || typeof customerInput !== 'string' || customerInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer input is required and must be a non-empty string'
      });
    }

    if (!strategy || !strategy.type) {
      return res.status(400).json({
        success: false,
        error: 'Strategy object with type is required'
      });
    }

    // Validate strategy type
    const validStrategies: ShoppingStrategy['type'][] = ['fancy', 'cost-effective', 'price-priority'];
    if (!validStrategies.includes(strategy.type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid strategy type. Must be one of: ${validStrategies.join(', ')}`
      });
    }

    // Validate strategy parameters
    if (strategy.maxPrice !== undefined && (typeof strategy.maxPrice !== 'number' || strategy.maxPrice < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Max price must be a non-negative number'
      });
    }

    if (strategy.minPrice !== undefined && (typeof strategy.minPrice !== 'number' || strategy.minPrice < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Min price must be a non-negative number'
      });
    }

    if (strategy.minRating !== undefined && (typeof strategy.minRating !== 'number' || strategy.minRating < 0 || strategy.minRating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Min rating must be a number between 0 and 5'
      });
    }

    if (strategy.preferredBrands && !Array.isArray(strategy.preferredBrands)) {
      return res.status(400).json({
        success: false,
        error: 'Preferred brands must be an array'
      });
    }

    if (strategy.excludedBrands && !Array.isArray(strategy.excludedBrands)) {
      return res.status(400).json({
        success: false,
        error: 'Excluded brands must be an array'
      });
    }

    console.log(`🔍 Gemini search request: "${customerInput}" with ${strategy.type} strategy`);

    // Perform search and optionally store results
    const result = await searchAndStoreProducts(customerInput, strategy, storeResults);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.errors[0] || 'Failed to search products'
      });
    }

    res.json({
      success: true,
      data: {
        products: result.products,
        stored: result.stored,
        totalFound: result.products.length,
        strategy: strategy.type
      },
      message: storeResults 
        ? `Found ${result.products.length} products and stored ${result.stored} in database`
        : `Found ${result.products.length} products`
    });

  } catch (error) {
    console.error('❌ Error in Gemini search route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during product search'
    });
  }
});

/**
 * POST /api/gemini/search-only
 * Search for products using Gemini AI without storing in database
 */
router.post('/search-only', async (req, res) => {
  try {
    const { customerInput, strategy } = req.body;

    // Validate required fields (same as above)
    if (!customerInput || typeof customerInput !== 'string' || customerInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer input is required and must be a non-empty string'
      });
    }

    if (!strategy || !strategy.type) {
      return res.status(400).json({
        success: false,
        error: 'Strategy object with type is required'
      });
    }

    console.log(`🔍 Gemini search-only request: "${customerInput}" with ${strategy.type} strategy`);

    // Perform search without storing
    const result = await searchProductsWithGemini(customerInput, strategy);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to search products'
      });
    }

    res.json({
      success: true,
      data: {
        products: result.products,
        totalFound: result.products.length,
        strategy: strategy.type
      },
      message: `Found ${result.products.length} products`
    });

  } catch (error) {
    console.error('❌ Error in Gemini search-only route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during product search'
    });
  }
});

/**
 * GET /api/gemini/strategies
 * Get available shopping strategies with descriptions
 */
router.get('/strategies', (req, res) => {
  const strategies = [
    {
      type: 'fancy',
      name: 'Fancy',
      description: 'Prioritizes premium products with excellent design and brand reputation',
      icon: '✨',
      characteristics: [
        'Focuses on luxury and premium brands',
        'Emphasizes high-quality materials and craftsmanship',
        'Prioritizes latest technology and features',
        'Values brand reputation and prestige'
      ],
      examplePrompts: [
        'Find me the most premium smartphone',
        'I want the best quality laptop money can buy',
        'Show me luxury headphones with excellent design'
      ]
    },
    {
      type: 'cost-effective',
      name: 'Cost-Effective',
      description: 'Balances price and quality for the best value-for-money products',
      icon: '💰',
      characteristics: [
        'Optimizes price-to-performance ratio',
        'Looks for reliable mid-range options',
        'Considers long-term value and durability',
        'Balances features with affordability'
      ],
      examplePrompts: [
        'Find me a good value smartphone under $500',
        'Best laptop for the money',
        'Affordable headphones with decent quality'
      ]
    },
    {
      type: 'price-priority',
      name: 'Price Priority',
      description: 'Focuses on the most affordable options while maintaining basic quality',
      icon: '🏷️',
      characteristics: [
        'Prioritizes lowest price options',
        'Accepts basic functionality over premium features',
        'Focuses on essential needs only',
        'Minimizes cost while maintaining usability'
      ],
      examplePrompts: [
        'Cheapest smartphone that works well',
        'Most affordable laptop for basic tasks',
        'Budget headphones under $50'
      ]
    }
  ];

  res.json({
    success: true,
    data: strategies,
    message: 'Available shopping strategies'
  });
});

/**
 * GET /api/gemini/examples
 * Get example search queries for testing
 */
router.get('/examples', (req, res) => {
  const examples = {
    fancy: [
      { query: 'Premium iPhone with best camera and design', expected: 'iPhone 15 Pro Max or similar flagship' },
      { query: 'Luxury smartwatch with premium materials', expected: 'Apple Watch Ultra or high-end Garmin' },
      { query: 'High-end gaming laptop with top specs', expected: 'Alienware, Razer Blade, or similar premium gaming laptop' }
    ],
    'cost-effective': [
      { query: 'Good smartphone under $500 with decent camera', expected: 'Google Pixel 7a, Samsung Galaxy A54' },
      { query: 'Reliable laptop for work under $800', expected: 'ThinkPad E series, HP Pavilion' },
      { query: 'Quality wireless headphones under $150', expected: 'Sony WH-CH720N, Bose QC35' }
    ],
    'price-priority': [
      { query: 'Cheapest smartphone that can make calls and text', expected: 'Basic Android phone under $100' },
      { query: 'Most affordable laptop for web browsing', expected: 'Chromebook or basic Windows laptop under $300' },
      { query: 'Budget headphones under $30', expected: 'Basic wired or wireless headphones' }
    ]
  };

  res.json({
    success: true,
    data: examples,
    message: 'Example search queries by strategy'
  });
});

export default router;