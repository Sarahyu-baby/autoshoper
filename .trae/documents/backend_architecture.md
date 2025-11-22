# Smart Shopper Backend Architecture & LLM Integration Design

## Overview

This document details the backend architecture for the Smart Shopper platform, focusing on Node.js implementation, LLM integration with Gemini and OpenAI APIs, and the reliability engine that powers the product truth analysis system.

## System Architecture

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                         │
│                  (Express.js + Rate Limiting)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐      ┌────▼────┐      ┌────▼────┐
│Product │      │Reliability│      │  User   │
│Service │      │ Engine    │      │ Service │
└────────┘      └─────────┘      └────────┘
    │                 │                 │
    │                 │                 │
┌───▼────┐      ┌────▼────┐      ┌────▼────┐
│Product │      │  LLM     │      │  Auth   │
│Database│      │Service   │      │ Service │
└────────┘      └─────────┘      └────────┘
```

### Service Descriptions

#### 1. API Gateway Service
- **Technology**: Express.js with Helmet security
- **Responsibilities**: 
  - Request routing and load balancing
  - Rate limiting and throttling
  - Authentication and authorization
  - Request/response transformation
  - API versioning

#### 2. Product Service
- **Technology**: Node.js with TypeScript
- **Responsibilities**:
  - Product data management
  - Barcode lookup and identification
  - Caching strategies
  - External API integrations

#### 3. Reliability Engine Service
- **Technology**: Node.js with TensorFlow.js
- **Responsibilities**:
  - Truth score calculation
  - Bias detection algorithms
  - Multi-source data aggregation
  - Machine learning model management

#### 4. LLM Service
- **Technology**: Node.js with OpenAI/Gemini SDKs
- **Responsibilities**:
  - LLM API integration and management
  - Prompt engineering and optimization
  - Response parsing and validation
  - Cost optimization and caching

#### 5. User Service
- **Technology**: Node.js with JWT authentication
- **Responsibilities**:
  - User authentication and authorization
  - Preference management
  - Usage analytics
  - Privacy compliance

## LLM Integration Architecture

### Multi-Provider Strategy

```javascript
// LLM Provider Configuration
const llmProviders = {
  openai: {
    model: 'gpt-4-turbo-preview',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4000,
    temperature: 0.3,
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 40000
    }
  },
  gemini: {
    model: 'gemini-pro',
    apiKey: process.env.GEMINI_API_KEY,
    maxTokens: 30720,
    temperature: 0.3,
    rateLimit: {
      requestsPerMinute: 60,
      tokensPerMinute: 60000
    }
  }
};
```

### LLM Service Implementation

```javascript
class LLMService {
  private providers: Map<string, LLMProvider>;
  private fallbackQueue: string[];
  private cache: RedisClient;

  constructor() {
    this.providers = new Map();
    this.fallbackQueue = ['openai', 'gemini'];
    this.cache = new RedisClient();
    this.initializeProviders();
  }

  async analyzeProduct(productData: ProductData): Promise<LLMResponse> {
    const cacheKey = this.generateCacheKey(productData);
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Try primary provider, fallback if needed
    for (const providerName of this.fallbackQueue) {
      try {
        const provider = this.providers.get(providerName);
        const result = await this.analyzeWithProvider(provider, productData);
        
        // Cache successful result
        await this.cache.setex(cacheKey, 3600, JSON.stringify(result));
        return result;
      } catch (error) {
        console.error(`${providerName} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All LLM providers failed');
  }

  private async analyzeWithProvider(provider: LLMProvider, data: ProductData): Promise<LLMResponse> {
    const prompt = this.buildAnalysisPrompt(data);
    return await provider.generateResponse(prompt);
  }

  private buildAnalysisPrompt(data: ProductData): string {
    return `
    Analyze the following product data and provide a comprehensive truth assessment:
    
    Product: ${data.name}
    Brand: ${data.brand}
    Claims: ${data.claims.join(', ')}
    Reviews: ${data.reviews.length} reviews, average rating: ${data.averageRating}
    Specifications: ${JSON.stringify(data.specifications)}
    
    Please provide:
    1. Overall truth score (0-100)
    2. Bias detection analysis
    3. Review authenticity assessment
    4. Specification accuracy verification
    5. Key concerns or red flags
    6. Recommendations for consumers
    
    Format response as JSON with the above categories.
    `;
  }
}
```

## Reliability Engine Design

### Truth Score Calculation Algorithm

```javascript
class ReliabilityEngine {
  private weights = {
    reviewAuthenticity: 0.35,
    specificationAccuracy: 0.25,
    brandReputation: 0.20,
    priceConsistency: 0.10,
    expertConsensus: 0.10
  };

  async calculateTruthScore(productData: ProductData): Promise<TruthScore> {
    const components = await Promise.all([
      this.analyzeReviewAuthenticity(productData.reviews),
      this.verifySpecifications(productData.specifications),
      this.assessBrandReputation(productData.brand),
      this.analyzePriceConsistency(productData),
      this.gatherExpertConsensus(productData)
    ]);

    const weightedScore = this.calculateWeightedScore(components);
    const confidence = this.calculateConfidence(components);
    
    return {
      overallScore: Math.round(weightedScore),
      confidence: Math.round(confidence),
      components: components,
      explanation: this.generateExplanation(components),
      lastUpdated: new Date().toISOString()
    };
  }

  private async analyzeReviewAuthenticity(reviews: Review[]): Promise<ScoreComponent> {
    const analysis = {
      verifiedPurchaseRatio: this.calculateVerifiedPurchases(reviews),
      reviewPatternAnalysis: this.analyzeReviewPatterns(reviews),
      languageAuthenticity: this.analyzeLanguagePatterns(reviews),
      reviewerHistory: this.analyzeReviewerHistory(reviews),
      timingAnalysis: this.analyzeReviewTiming(reviews)
    };

    const score = this.calculateComponentScore(analysis);
    const redFlags = this.identifyRedFlags(analysis);

    return {
      name: 'Review Authenticity',
      score: score,
      weight: this.weights.reviewAuthenticity,
      analysis: analysis,
      redFlags: redFlags,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  private analyzeReviewPatterns(reviews: Review[]): ReviewPatternAnalysis {
    const patterns = {
      duplicateContent: this.findDuplicateContent(reviews),
      suspiciousLanguage: this.detectSuspiciousLanguage(reviews),
      ratingDistribution: this.analyzeRatingDistribution(reviews),
      reviewLengthVariance: this.analyzeLengthVariance(reviews),
      emotionalLanguage: this.analyzeEmotionalLanguage(reviews)
    };

    return patterns;
  }
}
```

### Bias Detection Algorithms

```javascript
class BiasDetector {
  private biasIndicators = {
    promotionalLanguage: [
      'amazing', 'incredible', 'life-changing', 'must-buy',
      'revolutionary', 'game-changer', 'best ever'
    ],
    competitorMention: [
      'better than', 'compared to', 'unlike other'
    ],
    incentivizedReviews: [
      'received this product for free', 'honest review', 'discount'
    ]
  };

  detectBias(reviews: Review[]): BiasAnalysis {
    const results = {
      promotionalContent: this.detectPromotionalContent(reviews),
      competitorAttacks: this.detectCompetitorAttacks(reviews),
      incentivizedReviews: this.detectIncentivizedReviews(reviews),
      brandLoyalty: this.analyzeBrandLoyalty(reviews),
      reviewBombing: this.detectReviewBombing(reviews)
    };

    return {
      biasScore: this.calculateBiasScore(results),
      riskLevel: this.determineRiskLevel(results),
      affectedReviews: this.identifyAffectedReviews(results),
      recommendations: this.generateBiasRecommendations(results)
    };
  }

  private detectReviewBombing(reviews: Review[]): ReviewBombingAnalysis {
    const suspiciousPatterns = {
      suddenSpike: this.analyzeReviewSpikes(reviews),
      similarLanguage: this.findSimilarLanguage(reviews),
      coordinatedTiming: this.analyzeCoordinatedTiming(reviews),
      newAccounts: this.identifyNewAccounts(reviews),
      extremeRatings: this.analyzeExtremeRatings(reviews)
    };

    return {
      isReviewBombing: this.isReviewBombing(suspiciousPatterns),
      confidence: this.calculateConfidence(suspiciousPatterns),
      evidence: suspiciousPatterns
    };
  }
}
```

## Data Pipeline Architecture

### Multi-Source Data Aggregation

```javascript
class DataAggregationService {
  private dataSources = [
    'amazon',
    'google_shopping',
    'trustpilot',
    'bbb',
    'consumer_reports',
    'wirecutter',
    'manufacturer_specs',
    'regulatory_databases'
  ];

  async aggregateProductData(productId: string): Promise<AggregatedData> {
    const dataPromises = this.dataSources.map(source => 
      this.fetchFromSource(source, productId)
    );

    const results = await Promise.allSettled(dataPromises);
    const successfulResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    return this.normalizeAndMergeData(successfulResults);
  }

  private async fetchFromSource(source: string, productId: string): Promise<SourceData> {
    const fetcher = this.getFetcher(source);
    
    try {
      const rawData = await fetcher.fetch(productId);
      return {
        source: source,
        data: rawData,
        timestamp: new Date().toISOString(),
        reliability: this.assessSourceReliability(source),
        errors: []
      };
    } catch (error) {
      return {
        source: source,
        data: null,
        timestamp: new Date().toISOString(),
        reliability: 0,
        errors: [error.message]
      };
    }
  }

  private normalizeAndMergeData(results: SourceData[]): AggregatedData {
    const normalized = {
      reviews: this.mergeReviews(results),
      specifications: this.mergeSpecifications(results),
      ratings: this.mergeRatings(results),
      prices: this.mergePrices(results),
      expertOpinions: this.mergeExpertOpinions(results),
      metadata: this.extractMetadata(results)
    };

    return this.validateMergedData(normalized);
  }
}
```

### Caching Strategy

```javascript
class CachingService {
  private redis: RedisClient;
  private localCache: NodeCache;

  constructor() {
    this.redis = new RedisClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });
    
    this.localCache = new NodeCache({
      stdTTL: 300, // 5 minutes
      checkperiod: 60
    });
  }

  async getProductData(productId: string): Promise<CachedData | null> {
    // Check local cache first (fastest)
    const localData = this.localCache.get(productId);
    if (localData) {
      return localData;
    }

    // Check Redis cache
    const redisData = await this.redis.get(`product:${productId}`);
    if (redisData) {
      const parsed = JSON.parse(redisData);
      this.localCache.set(productId, parsed);
      return parsed;
    }

    return null;
  }

  async setProductData(productId: string, data: any): Promise<void> {
    const cacheData = {
      data: data,
      timestamp: new Date().toISOString(),
      ttl: this.calculateTTL(data)
    };

    // Set in both caches
    this.localCache.set(productId, cacheData);
    await this.redis.setex(
      `product:${productId}`,
      cacheData.ttl,
      JSON.stringify(cacheData)
    );
  }

  private calculateTTL(data: any): number {
    // Dynamic TTL based on data freshness requirements
    if (data.isHighPriority) {
      return 1800; // 30 minutes
    } else if (data.isSeasonal) {
      return 7200; // 2 hours
    } else {
      return 3600; // 1 hour default
    }
  }
}
```

## Security & Privacy Architecture

### Data Protection

```javascript
class SecurityService {
  private encryptionKey: string;
  private rateLimiter: RateLimiter;

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
  }

  encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async validateRequest(req: Request): Promise<boolean> {
    // Rate limiting
    const rateLimitResult = await this.rateLimiter.check(req.ip);
    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded');
    }

    // API key validation
    const apiKey = req.headers['x-api-key'];
    if (!this.isValidApiKey(apiKey)) {
      throw new Error('Invalid API key');
    }

    // Request signature validation
    if (!this.validateRequestSignature(req)) {
      throw new Error('Invalid request signature');
    }

    return true;
  }

  sanitizeUserData(data: any): SanitizedData {
    // Remove PII and sensitive information
    const sanitized = {
      ...data,
      userId: this.hashUserId(data.userId),
      location: this.generalizeLocation(data.location),
      timestamp: data.timestamp,
      deviceInfo: this.minimizeDeviceInfo(data.deviceInfo)
    };

    return sanitized;
  }
}
```

### Privacy Compliance

```javascript
class PrivacyService {
  private gdprCompliance: GDPRCompliance;
  private ccpaCompliance: CCPACompliance;

  async handleDataRequest(userId: string, requestType: string): Promise<any> {
    switch (requestType) {
      case 'access':
        return await this.provideDataAccess(userId);
      case 'deletion':
        return await this.deleteUserData(userId);
      case 'portability':
        return await this.exportUserData(userId);
      default:
        throw new Error('Invalid data request type');
    }
  }

  private async provideDataAccess(userId: string): Promise<UserData> {
    const userData = await this.collectUserData(userId);
    
    return {
      personalData: userData.personal,
      usageData: userData.usage,
      analyticsData: userData.analytics,
      thirdPartyData: userData.thirdParty,
      generatedData: userData.generated
    };
  }

  async anonymizeAnalytics(data: any): Promise<AnonymizedData> {
    return {
      timestamp: data.timestamp,
      productCategory: data.productCategory,
      truthScore: data.truthScore,
      userAgent: this.anonymizeUserAgent(data.userAgent),
      sessionId: this.generateSessionId(),
      geographicRegion: this.determineRegion(data.location)
    };
  }
}
```

## Performance Optimization

### Load Balancing Strategy

```javascript
class LoadBalancer {
  private servers: Server[];
  private healthChecker: HealthChecker;
  private algorithm: 'round-robin' | 'least-connections' | 'ip-hash';

  constructor(servers: Server[], algorithm = 'least-connections') {
    this.servers = servers;
    this.algorithm = algorithm;
    this.healthChecker = new HealthChecker();
    this.startHealthChecking();
  }

  async routeRequest(req: Request): Promise<Server> {
    const healthyServers = await this.getHealthyServers();
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }

    switch (this.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyServers);
      case 'least-connections':
        return this.leastConnections(healthyServers);
      case 'ip-hash':
        return this.ipHash(healthyServers, req.ip);
      default:
        return healthyServers[0];
    }
  }

  private async getHealthyServers(): Promise<Server[]> {
    return this.servers.filter(server => 
      this.healthChecker.isHealthy(server)
    );
  }
}
```

### Database Optimization

```javascript
class DatabaseOptimizer {
  async optimizeQueries(): Promise<void> {
    // Create indexes for common queries
    const indexes = [
      { collection: 'products', fields: { barcode: 1 }, unique: true },
      { collection: 'products', fields: { name: 'text', brand: 'text' } },
      { collection: 'reviews', fields: { productId: 1, date: -1 } },
      { collection: 'reviews', fields: { reviewerId: 1, productId: 1 } },
      { collection: 'truth_scores', fields: { productId: 1, timestamp: -1 } }
    ];

    for (const index of indexes) {
      await this.createIndex(index.collection, index.fields, index.unique);
    }
  }

  async implementConnectionPooling(): Promise<void> {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 20,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });

    return pool;
  }
}
```

This backend architecture provides a robust, scalable foundation for the Smart Shopper platform, with sophisticated LLM integration, advanced reliability analysis, and comprehensive privacy and security measures.