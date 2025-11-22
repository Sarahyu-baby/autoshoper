/**
 * @typedef {Object} Product
 * @property {string} id - UUID of the product
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} brand - Product brand
 * @property {string} category - Product category
 * @property {string} imageUrl - Product image URL
 * @property {string} productUrl - Product page URL
 * @property {number} rating - Product rating (0-5)
 * @property {number} reviewCount - Number of reviews
 * @property {string} sourcePlatform - Source platform (Amazon, eBay, etc.)
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} CreateProductData
 * @property {string} name - Product name (required)
 * @property {number} price - Product price (required)
 * @property {string} brand - Product brand (required)
 * @property {string} category - Product category (required)
 * @property {string} imageUrl - Product image URL (required)
 * @property {string} productUrl - Product page URL (required)
 * @property {number} [rating] - Product rating (0-5, optional)
 * @property {number} [reviewCount] - Number of reviews (optional, defaults to 0)
 * @property {string} sourcePlatform - Source platform (required)
 */

/**
 * @typedef {Object} UpdateProductData
 * @property {string} [name] - Product name
 * @property {number} [price] - Product price
 * @property {string} [brand] - Product brand
 * @property {string} [category] - Product category
 * @property {string} [imageUrl] - Product image URL
 * @property {string} [productUrl] - Product page URL
 * @property {number} [rating] - Product rating (0-5)
 * @property {number} [reviewCount] - Number of reviews
 * @property {string} [sourcePlatform] - Source platform
 */

/**
 * @typedef {Object} ProductSearchFilters
 * @property {string} [brand] - Filter by brand
 * @property {string} [category] - Filter by category
 * @property {number} [minPrice] - Minimum price filter
 * @property {number} [maxPrice] - Maximum price filter
 * @property {number} [minRating] - Minimum rating filter
 * @property {string} [sourcePlatform] - Filter by source platform
 */

/**
 * @typedef {Object} DatabaseResponse
 * @property {Product[]} data - Array of products
 * @property {Object|null} error - Error object if operation failed
 * @property {number} count - Number of records (for count operations)
 */

export {};