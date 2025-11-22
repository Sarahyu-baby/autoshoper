# Smart Shopper MVP Backend Architecture (5-Hour Hackathon)

## MVP Backend Philosophy

### Keep It Dead Simple
- **Single Express server** - no microservices
- **Mock data instead of real databases** - use JSON files
- **Single LLM integration** - start with one (OpenAI)
- **No authentication** - skip user management entirely
- **In-memory caching** - no Redis needed

## MVP Backend Architecture

### Single Server Structure
```
src/
├── server.ts          # Express server setup
├── routes/
│   ├── products.ts    # Product search endpoints
│   └── analysis.ts    # Reliability score endpoints
├── services/
│   ├── productService.ts    # Mock product data
│   ├── analysisService.ts   # LLM integration
│   └── mockData.ts         # Pre-defined product data
└── types/
    └── index.ts      # TypeScript interfaces
```

## MVP API Endpoints (3 Total)

### 1. Product Search
```typescript
GET /api/products/search?q=laptop

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "MacBook Air M2",
      "brand": "Apple",
      "category": "Laptops",
      "price": 1199,
      "reliabilityScore": 85,
      "summary": "Great build quality, reliable performance"
    },
    {
      "id": "2",
      "name": "Dell XPS 13",
      "brand": "Dell",
      "category": "Laptops",
      "price": 999,
      "reliabilityScore": 72,
      "summary": "Good value but some quality concerns"
    }
  ]
}
```

### 2. Get Product Details
```typescript
GET /api/products/:id

Response:
{
  "success": true,
  "data": {
    "id": "1",
    "name": "MacBook Air M2",
    "brand": "Apple",
    "category": "Laptops",
    "price": 1199,
    "reliabilityScore": 85,
    "summary": "Great build quality, reliable performance",
    "specifications": {
      "processor": "M2 chip",
      "memory": "8GB unified memory",
      "storage": "256GB SSD"
    }
  }
}
```

### 3. Compare Products
```typescript
POST /api/analysis/compare
Body: { "productIds": ["1", "2", "3"] }

Response:
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "1",
        "name": "MacBook Air M2",
        "reliabilityScore": 85,
        "summary": "Great build quality, reliable performance"
      },
      {
        "id": "3",
        "name": "HP Pavilion",
        "reliabilityScore": 91,
        "summary": "Excellent reliability and customer support"
      }
    ],
    "winner": {
      "id": "3",
      "name": "HP Pavilion",
      "reason": "Higher reliability score (91 vs 85)"
    },
    "recommendation": "HP Pavilion offers better reliability for the price"
  }
}
```

## MVP Mock Data (Pre-defined JSON)

### Mock Products Database
```typescript
// src/services/mockData.ts

export const mockProducts = {
  laptops: [
    {
      id: "1",
      name: "MacBook Air M2",
      brand: "Apple",
      category: "Laptops",
      price: 1199,
      reliabilityScore: 85,
      summary: "Great build quality, reliable performance",
      specifications: {
        processor: "M2 chip",
        memory: "8GB unified memory",
        storage: "256GB SSD"
      }
    },
    {
      id: "2",
      name: "Dell XPS 13",
      brand: "Dell",
      category: "Laptops",
      price: 999,
      reliabilityScore: 72,
      summary: "Good value but some quality concerns",
      specifications: {
        processor: "Intel Core i7",
        memory: "16GB RAM",
        storage: "512GB SSD"
      }
    },
    {
      id: "3",
      name: "HP Pavilion",
      brand: "HP",
      category: "Laptops",
      price: 799,
      reliabilityScore: 91,
      summary: "Excellent reliability and customer support",
      specifications: {
        processor: "AMD Ryzen 7",
        memory: "16GB RAM",
        storage: "1TB SSD"
      }
    }
  ],
  phones: [
    {
      id: "4",
      name: "iPhone 15 Pro",
      brand: "Apple",
      category: "Phones",
      price: 999,
      reliabilityScore: 88,
      summary: "Premium build with consistent performance"
    },
    {
      id: "5",
      name: "Samsung Galaxy S24",
      brand: "Samsung",
      category: "Phones",
      price: 899,
      reliabilityScore: 82,
      summary: "Feature-rich with good reliability"
    },
    {
      id: "6",
      name: "Google Pixel 8",
      brand: "Google",
      category: "Phones",
      price: 699,
      reliabilityScore: 79,
      summary: "Clean software but hardware concerns"
    }
  ],
  headphones: [
    {
      id: "7",
      name: "Sony WH-1000XM5",
      brand: "Sony",
      category: "Headphones",
      price: 399,
      reliabilityScore: 93,
      summary: "Outstanding reliability and sound quality"
    },
    {
      id: "8",
      name: "Bose QuietComfort",
      brand: "Bose",
      category: "Headphones",
      price: 349,
      reliabilityScore: 89,
      summary: "Excellent build and comfort"
    },
    {
      id: "9",
      name: "AirPods Pro",
      brand: "Apple",
      category: "Headphones",
      price: 249,
      reliabilityScore: 76,
      summary: "Good features but battery issues"
    }
  ]
};

export const getMockProducts = (query: string = '') => {
  const lowerQuery = query.toLowerCase();
  const allProducts = Object.values(mockProducts).flat();
  
  if (!query) return allProducts.slice(0, 6); // Return first 6 if no query
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery)
  );
};

export const getProductById = (id: string) => {
  const allProducts = Object.values(mockProducts).flat();
  return allProducts.find(product => product.id === id);
};
```

## MVP Services (Ultra Simple)

### Product Service
```typescript
// src/services/productService.ts
import { getMockProducts, getProductById } from './mockData';

export class ProductService {
  async searchProducts(query: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const products = getMockProducts(query);
    return products;
  }

  async getProductById(id: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const product = getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }
}
```

### Analysis Service (Simple LLM Integration)
```typescript
// src/services/analysisService.ts
import OpenAI from 'openai';

export class AnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateComparisonSummary(products: any[]) {
    // For MVP, we'll use a simple prompt and fallback to mock data if LLM fails
    try {
      const prompt = this.buildComparisonPrompt(products);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      return this.parseComparisonResponse(content, products);
    } catch (error) {
      console.error('LLM failed, using mock comparison:', error);
      return this.getMockComparison(products);
    }
  }

  private buildComparisonPrompt(products: any[]) {
    const productList = products.map(p => 
      `- ${p.name} (${p.brand}): ${p.reliabilityScore}/100 reliability score, $${p.price}`
    ).join('\n');

    return `Compare these products and recommend the best one based on reliability score and value:
${productList}

Provide a brief recommendation (1-2 sentences) and identify the winner. Format as JSON:
{
  "winner": { "id": "product_id", "reason": "why this product wins" },
  "recommendation": "brief recommendation text"
}`;
  }

  private parseComparisonResponse(content: string | null, products: any[]) {
    if (!content) {
      return this.getMockComparison(products);
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
    }

    return this.getMockComparison(products);
  }

  private getMockComparison(products: any[]) {
    // Simple winner determination based on reliability score
    const winner = products.reduce((prev, current) => 
      prev.reliabilityScore > current.reliabilityScore ? prev : current
    );

    return {
      winner: {
        id: winner.id,
        name: winner.name,
        reason: `Highest reliability score (${winner.reliabilityScore}/100)`
      },
      recommendation: `${winner.name} offers the best reliability for the price`
    };
  }
}
```

## MVP Express Server

### Main Server File
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import analysisRoutes from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Shopper MVP Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

### Product Routes
```typescript
// src/routes/products.ts
import express from 'express';
import { ProductService } from '../services/productService';

const router = express.Router();
const productService = new ProductService();

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const products = await productService.searchProducts(q as string || '');
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search products'
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }
});

export default router;
```

### Analysis Routes
```typescript
// src/routes/analysis.ts
import express from 'express';
import { AnalysisService } from '../services/analysisService';

const router = express.Router();
const analysisService = new AnalysisService();

// Compare products
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 product IDs required'
      });
    }

    if (productIds.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 products can be compared'
      });
    }

    // Get product details
    const { ProductService } = await import('../services/productService');
    const productService = new ProductService();
    
    const products = await Promise.all(
      productIds.map(id => productService.getProductById(id))
    );

    // Generate comparison analysis
    const comparison = await analysisService.generateComparisonSummary(products);

    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          reliabilityScore: p.reliabilityScore,
          summary: p.summary
        })),
        ...comparison
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to compare products'
    });
  }
});

export default router;
```

## MVP Environment Setup

### Package.json (Minimal Dependencies)
```json
{
  "name": "smart-shopper-mvp-backend",
  "version": "1.0.0",
  "description": "MVP backend for Smart Shopper",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "openai": "^4.20.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Environment Variables
```bash
# .env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

## MVP Development Timeline (Backend: 2 Hours)

### 30 Minutes: Setup & Basic Structure
- Initialize Node.js project with TypeScript
- Install dependencies
- Set up Express server
- Create basic file structure

### 45 Minutes: Mock Data & Product Routes
- Create mock data with products
- Build product search endpoint
- Build get product by ID endpoint
- Test endpoints with curl/Postman

### 30 Minutes: Analysis Service
- Set up OpenAI integration
- Build comparison prompt
- Create fallback mock comparison
- Test LLM integration

### 15 Minutes: Integration & Testing
- Connect all routes together
- Test complete flow
- Add error handling
- Final testing

## MVP Backend Success Criteria

### Must Work For Demo
- ✅ Search endpoint returns products
- ✅ Product details endpoint works
- ✅ Compare endpoint returns winner + recommendation
- ✅ All endpoints handle errors gracefully
- ✅ CORS enabled for frontend

### Nice to Have For Demo
- ✅ LLM integration (with fallback)
- ✅ Environment configuration
- ✅ Basic error handling
- ✅ Health check endpoint

This MVP backend provides everything needed for the hackathon demo while keeping complexity minimal and development time under 2 hours.