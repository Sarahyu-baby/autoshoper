# AutoShopping Software - Technical Architecture Document

## System Architecture Overview

The auto-shopping software consists of a React frontend and Node.js backend that work together to provide intelligent product recommendations based on comment analysis and shopping strategies.

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **HTTP Client**: Axios for API calls

### Component Structure
```
src/
├── components/
│   ├── ProductSearch.tsx          # Product search interface
│   ├── StrategySelector.tsx       # Shopping strategy selection
│   ├── ProductComparison.tsx      # Multi-product comparison view
│   ├── CommentAnalysis.tsx        # Comment analysis display
│   ├── RecommendationCard.tsx     # Individual recommendation display
│   └── LoadingSpinner.tsx         # Loading states
├── pages/
│   ├── Home.tsx                   # Landing page
│   ├── SearchResults.tsx          # Search results page
│   ├── ProductDetails.tsx         # Detailed product view
│   └── Settings.tsx               # User preferences
├── hooks/
│   ├── useProductSearch.ts        # Product search logic
│   ├── useCommentAnalysis.ts      # Comment analysis logic
│   └── useRecommendations.ts      # Recommendation logic
├── stores/
│   ├── searchStore.ts             # Search state management
│   ├── strategyStore.ts           # Strategy preferences
│   └── userStore.ts               # User preferences
├── utils/
│   ├── api.ts                     # API utility functions
│   ├── formatters.ts              # Data formatting helpers
│   └── constants.ts               # Application constants
└── types/
    ├── product.ts                 # Product type definitions
    ├── comment.ts                 # Comment type definitions
    └── strategy.ts                # Strategy type definitions
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT with Supabase Auth
- **External APIs**: E-commerce platform APIs

### API Structure
```
api/
├── controllers/
│   ├── productController.ts       # Product search and aggregation
│   ├── commentController.ts       # Comment analysis endpoints
│   ├── strategyController.ts     # Strategy engine endpoints
│   └── recommendationController.ts # Recommendation generation
├── services/
│   ├── productService.ts          # Product data aggregation
│   ├── commentAnalysisService.ts  # Comment analysis algorithms
│   ├── strategyEngine.ts          # Shopping strategy logic
│   └── recommendationService.ts   # Recommendation algorithms
├── models/
│   ├── Product.ts                 # Product data model
│   ├── Comment.ts                 # Comment data model
│   └── UserPreference.ts          # User preferences model
├── middleware/
│   ├── auth.ts                    # Authentication middleware
│   ├── validation.ts              # Request validation
│   └── rateLimit.ts               # Rate limiting
├── utils/
│   ├── sentimentAnalyzer.ts       # Sentiment analysis utility
│   ├── keywordExtractor.ts        # Keyword extraction utility
│   └── apiClients.ts              # External API clients
└── routes/
    ├── products.ts                 # Product routes
    ├── comments.ts                 # Comment routes
    ├── strategies.ts               # Strategy routes
    └── recommendations.ts          # Recommendation routes
```

## Data Flow Architecture

### 1. Product Search Flow
1. User enters search query in frontend
2. Frontend sends request to `/api/products/search`
3. Backend queries multiple e-commerce APIs
4. Products are normalized and cached
5. Response returns structured product data

### 2. Comment Analysis Flow
1. For each product, fetch comments/reviews
2. Clean and preprocess comment text
3. Apply sentiment analysis algorithms
4. Extract keywords and quality indicators
5. Store analyzed data in database
6. Return analysis results to frontend

### 3. Strategy Application Flow
1. User selects shopping strategy
2. Frontend sends strategy preference to backend
3. Strategy engine applies specific weighting rules
4. Products are scored based on strategy criteria
5. Ranked recommendations are generated
6. Results returned with explanation

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  brand VARCHAR(100),
  category VARCHAR(100),
  image_url TEXT,
  product_url TEXT,
  rating DECIMAL(3,2),
  review_count INTEGER,
  source_platform VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  content TEXT NOT NULL,
  rating INTEGER,
  helpful_votes INTEGER,
  sentiment_score DECIMAL(3,2),
  keywords TEXT[],
  quality_indicators TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  preferred_strategy VARCHAR(50),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  preferred_brands TEXT[],
  excluded_keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Strategy Engine Implementation

### Fancy Strategy Algorithm
```typescript
class FancyStrategy implements ShoppingStrategy {
  calculateScore(product: Product, analysis: CommentAnalysis): number {
    let score = 0;
    
    // Brand reputation weight (30%)
    score += this.getBrandScore(product.brand) * 0.3;
    
    // Premium feature mentions (25%)
    score += this.countPremiumMentions(analysis.keywords) * 0.25;
    
    // Quality indicators (25%)
    score += this.analyzeQualityMentions(analysis.qualityIndicators) * 0.25;
    
    // Design/aesthetic mentions (20%)
    score += this.countDesignMentions(analysis.keywords) * 0.2;
    
    return score;
  }
}
```

### Cost-Effective Strategy Algorithm
```typescript
class CostEffectiveStrategy implements ShoppingStrategy {
  calculateScore(product: Product, analysis: CommentAnalysis): number {
    let score = 0;
    
    // Value-for-money ratio (40%)
    score += this.calculateValueRatio(product.price, analysis.qualityIndicators) * 0.4;
    
    // Durability mentions (30%)
    score += this.countDurabilityMentions(analysis.keywords) * 0.3;
    
    // "Worth it" mentions (20%)
    score += this.countWorthItMentions(analysis.content) * 0.2;
    
    // Long-term satisfaction (10%)
    score += this.analyzeLongTermSatisfaction(analysis) * 0.1;
    
    return score;
  }
}
```

### Price-Priority Strategy Algorithm
```typescript
class PricePriorityStrategy implements ShoppingStrategy {
  calculateScore(product: Product, analysis: CommentAnalysis): number {
    let score = 0;
    
    // Price competitiveness (50%)
    score += this.calculatePriceCompetitiveness(product.price) * 0.5;
    
    // Basic quality threshold (30%)
    score += this.checkBasicQualityThreshold(analysis) * 0.3;
    
    // Avoid concerning issues (20%)
    score += this.checkForConcerningIssues(analysis) * 0.2;
    
    return score;
  }
}
```

## External API Integration

### E-commerce APIs
- **Amazon Product Advertising API**: Product data and reviews
- **eBay Browse API**: Product listings and pricing
- **Shopify API**: Product information for Shopify stores

### Review Aggregation Services
- **Trustpilot API**: Customer reviews and ratings
- **Google Shopping API**: Product reviews and ratings
- **Social media APIs**: User-generated content analysis

## Security Considerations

### API Security
- Rate limiting on all endpoints
- API key authentication for external services
- Input validation and sanitization
- CORS configuration for frontend

### Data Privacy
- User data encryption at rest
- Secure API communication (HTTPS)
- GDPR compliance for user data
- Regular security audits

## Performance Optimization

### Caching Strategy
- Redis for frequently accessed product data
- Database query optimization
- CDN for static assets
- Browser caching for frontend resources

### Scalability
- Horizontal scaling for backend services
- Database connection pooling
- Async processing for comment analysis
- Load balancing for high traffic

## Monitoring and Analytics

### Application Monitoring
- Error tracking and logging
- Performance metrics collection
- User behavior analytics
- API response time monitoring

### Business Metrics
- Recommendation accuracy tracking
- User engagement metrics
- Strategy effectiveness analysis
- Conversion rate monitoring