# Gemini Integration for Auto-Shopping Software

This module integrates Google Gemini AI to provide intelligent product search capabilities with strategy-based filtering and automatic storage in Supabase.

## Features

- 🤖 **AI-Powered Product Search**: Uses Google Gemini to find products based on customer input
- 🎯 **Strategy-Based Filtering**: Three shopping strategies (fancy, cost-effective, price-priority)
- 💾 **Automatic Storage**: Stores search results directly in Supabase database
- 🔄 **Data Transformation**: Converts Gemini results to database-compatible format
- 📊 **Search Analytics**: Tracks search metadata and performance metrics
- 🛡️ **Error Handling**: Comprehensive error handling and validation
- 🚀 **Batch Processing**: Efficient batch processing for multiple products

## Setup

### 1. Environment Configuration

Add your Google Gemini API key to the `.env` file:

```bash
# Google Gemini API Configuration
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 2. Install Dependencies

```bash
npm install @google/generative-ai uuid
```

### 3. Database Setup

Ensure your Supabase tables are set up with the products schema (see `supabase/migrations/`).

## Usage

### Basic Product Search

```javascript
import { searchProductsWithGemini } from './api/services/geminiProductSearch.js';

// Search for products with a specific strategy
const result = await searchProductsWithGemini('wireless headphones', 'fancy');

console.log(`Found ${result.products.length} products`);
console.log(`Strategy: ${result.strategy}`);
console.log(`Search time: ${result.metadata.searchTime}ms`);

// Access the products
result.products.forEach(product => {
  console.log(`${product.name} - $${product.price} (${product.brand})`);
});
```

### Search and Store in Database

```javascript
import { searchProductsWithGemini } from './api/services/geminiProductSearch.js';
import { storeGeminiProductsWithMetadata } from './api/services/geminiDataTransformer.js';

// Search for products
const searchResult = await searchProductsWithGemini('gaming laptop', 'cost-effective');

// Store in Supabase
const storageResult = await storeGeminiProductsWithMetadata(
  searchResult.products,
  'gaming laptop',
  'cost-effective'
);

console.log(`Stored ${storageResult.stored} products`);
console.log(`Errors: ${storageResult.errors.length}`);
```

### Available Strategies

1. **fancy**: Premium/luxury products with high ratings and quality
2. **cost-effective**: Best value for money, balancing price and quality
3. **price-priority**: Lowest price options, budget-friendly choices

## API Endpoints

### POST /api/gemini/search
Search for products and optionally store them in the database.

**Request Body:**
```json
{
  "query": "wireless headphones",
  "strategy": "fancy",
  "storeInDatabase": true
}
```

**Response:**
```json
{
  "products": [...],
  "strategy": "fancy",
  "metadata": {
    "searchTime": 1500,
    "totalResults": 10
  }
}
```

### POST /api/gemini/search-only
Search for products without storing them in the database.

### GET /api/gemini/strategies
Get available shopping strategies.

### GET /api/gemini/examples
Get example search queries for testing.

## Testing

### Run Integration Tests
```bash
node api/tests/gemini-integration.test.js
```

### Test API Endpoints
```bash
# Start your server first
npm run dev

# Then run API tests
node api/tests/gemini-api-test.js
```

### Run Examples
```bash
node api/examples/gemini-usage.js
```

## Error Handling

The integration includes comprehensive error handling for:

- Invalid API keys
- Network connectivity issues
- Malformed product data
- Database storage failures
- Rate limiting
- Invalid search queries

## Performance Considerations

- **Batch Processing**: Products are processed in batches to avoid rate limiting
- **Delays**: Built-in delays between operations to respect API limits
- **Caching**: Search results can be cached to reduce API calls
- **Validation**: Data is validated before storage to prevent database errors

## Configuration

### Gemini Model Configuration

The default configuration uses:
- Model: `gemini-pro`
- Temperature: `0.7` (balanced creativity/accuracy)
- Max tokens: `2048`
- Safety settings for content filtering

### Data Transformation

Products are automatically transformed from Gemini format to Supabase format:
- URL validation and fixing
- Price normalization
- Rating validation (0-5 scale)
- Required field validation

## Troubleshooting

### Common Issues

1. **"GOOGLE_API_KEY is not configured"**
   - Add your Gemini API key to the `.env` file
   - Ensure the environment variable is loaded

2. **"Failed to store product"**
   - Check Supabase connection
   - Verify database schema matches expected structure
   - Check for duplicate products

3. **"Rate limit exceeded"**
   - Reduce batch size in `batchProcessGeminiProducts()`
   - Increase delays between operations
   - Implement caching for repeated searches

### Debug Mode

Enable debug logging by setting:
```javascript
process.env.DEBUG = 'gemini:*';
```

## Security Notes

- Never expose your Gemini API key in client-side code
- Use environment variables for sensitive configuration
- Implement rate limiting on your API endpoints
- Validate all user input before processing
- Use Supabase RLS policies for data security

## Dependencies

- `@google/generative-ai`: Google Gemini AI SDK
- `uuid`: UUID generation for unique identifiers
- `dotenv`: Environment variable management

## License

This integration is part of the Auto-Shopping Software project.