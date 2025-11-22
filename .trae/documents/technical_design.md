# Smart Shopper Technical Design Document

## Executive Summary

This technical design document provides comprehensive implementation specifications for the Smart Shopper platform, integrating the frontend React + Vite application with the Node.js backend and LLM services to deliver real-time product truth analysis.

## System Architecture Overview

### Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React + Vite)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Mobile-First PWA with Offline Support                             │ │
│  │  • Camera Integration (WebRTC)                                    │ │
│  │  • Barcode/QR Code Scanning                                       │ │
│  │  • Real-time Product Analysis Dashboard                           │ │
│  │  • Comparison Interface                                           │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API Gateway (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  • Rate Limiting & Throttling                                     │ │
│  │  • Authentication & Authorization                                 │ │
│  │  • Request/Response Transformation                                │ │
│  │  • API Versioning                                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Product Service   │  │ Reliability Engine  │  │    User Service     │
│   (Node.js + TS)    │  │  (Node.js + ML)     │  │   (Node.js + JWT)   │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│ • Product Lookup    │  │ • Truth Score Calc  │  │ • User Auth         │
│ • Barcode Service   │  │ • Bias Detection    │  │ • Preferences       │
│ • Data Aggregation  │  │ • Review Analysis   │  │ • Analytics         │
│ • Caching Strategy  │  │ • LLM Integration │  │ • Privacy Control   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Product Database  │  │   LLM Services      │  │    User Database    │
│  (PostgreSQL +      │  │ • OpenAI API        │  │   (PostgreSQL)     │
│   Redis Cache)      │  │ • Gemini API        │  │                     │
│                     │  │ • Fallback Logic    │  │                     │
│ • Product Info      │  │ • Prompt Engineering  │  │ • User Profiles     │
│ • Review Data       │  │ • Response Parsing    │  │ • Usage History     │
│ • Truth Scores      │  │ • Cost Optimization   │  │ • Saved Products    │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## Frontend Implementation Specifications

### Technology Stack
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 4.x for fast development and building
- **State Management**: Zustand for lightweight state management
- **Styling**: Tailwind CSS with custom design system
- **PWA**: Service Worker implementation for offline functionality
- **Testing**: Jest + React Testing Library

### Core Components Architecture

#### 1. Main Application Structure
```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import ProductAnalysis from './pages/ProductAnalysis';
import Comparison from './pages/Comparison';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/analysis/:productId" element={<ProductAnalysis />} />
          <Route path="/compare" element={<Comparison />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
```

#### 2. Scanner Component Implementation
```typescript
// src/components/Scanner.tsx
import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';

interface ScannerProps {
  onScan: (code: string, format: BarcodeFormat) => void;
  onError: (error: string) => void;
}

export default function Scanner({ onScan, onError }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => cleanupScanner();
  }, []);

  const initializeScanner = async () => {
    try {
      codeReader.current = new BrowserMultiFormatReader();
      
      // Get available cameras
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      setDevices(videoInputDevices);
      
      // Start scanning with first camera
      if (videoInputDevices.length > 0 && videoRef.current) {
        setIsScanning(true);
        await codeReader.current.decodeFromVideoDevice(
          videoInputDevices[0].deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              onScan(result.getText(), result.getBarcodeFormat());
              setIsScanning(false);
            }
            if (error && error.name !== 'NotFoundException') {
              onError(error.message);
            }
          }
        );
      }
    } catch (error) {
      onError('Failed to initialize scanner');
    }
  };

  const cleanupScanner = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      setIsScanning(false);
    }
  };

  return (
    <div className="scanner-container">
      <video
        ref={videoRef}
        className="scanner-video"
        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
      />
      {isScanning && (
        <div className="scanner-overlay">
          <div className="scanning-indicator" />
        </div>
      )}
    </div>
  );
}
```

#### 3. Product Analysis Component
```typescript
// src/components/ProductAnalysis.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProductAnalysisProps {
  productId: string;
}

export default function ProductAnalysis({ productId }: ProductAnalysisProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-analysis', productId],
    queryFn: () => fetchProductAnalysis(productId),
    staleTime: 5 * 60 * 1000,
    enabled: !!productId
  });

  if (isLoading) {
    return <AnalysisSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error.message} />;
  }

  if (!data) {
    return <NoDataMessage />;
  }

  return (
    <div className="analysis-container space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{data.product.name}</CardTitle>
          <p className="text-muted-foreground">{data.product.brand}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="truth-score-section">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">Truth Score</span>
                <Badge variant={getScoreVariant(data.truthScore.overallScore)}>
                  {data.truthScore.overallScore}/100
                </Badge>
              </div>
              <Progress value={data.truthScore.overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {data.truthScore.explanation}
              </p>
            </div>

            <div className="confidence-section">
              <span className="text-sm font-medium">Confidence Level: </span>
              <span className="text-sm text-muted-foreground">
                {data.truthScore.confidence}%
              </span>
            </div>

            <div className="bias-detection-section">
              <h3 className="text-lg font-semibold mb-3">Bias Detection</h3>
              <BiasAnalysis data={data.biasAnalysis} />
            </div>

            <div className="component-breakdown-section">
              <h3 className="text-lg font-semibold mb-3">Analysis Breakdown</h3>
              <ComponentBreakdown components={data.truthScore.components} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function fetchProductAnalysis(productId: string): Promise<ProductAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/analysis`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product analysis');
  }

  return response.json();
}
```

### State Management Implementation
```typescript
// src/store/productStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductStore {
  scannedProducts: Product[];
  savedProducts: Product[];
  comparisonProducts: Product[];
  addScannedProduct: (product: Product) => void;
  saveProduct: (productId: string) => void;
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      scannedProducts: [],
      savedProducts: [],
      comparisonProducts: [],

      addScannedProduct: (product) => {
        set((state) => ({
          scannedProducts: [product, ...state.scannedProducts.slice(0, 19)] // Keep last 20
        }));
      },

      saveProduct: (productId) => {
        const product = get().scannedProducts.find(p => p.id === productId);
        if (product && !get().savedProducts.find(p => p.id === productId)) {
          set((state) => ({
            savedProducts: [...state.savedProducts, product]
          }));
        }
      },

      addToComparison: (product) => {
        if (get().comparisonProducts.length < 3 && !get().comparisonProducts.find(p => p.id === product.id)) {
          set((state) => ({
            comparisonProducts: [...state.comparisonProducts, product]
          }));
        }
      },

      removeFromComparison: (productId) => {
        set((state) => ({
          comparisonProducts: state.comparisonProducts.filter(p => p.id !== productId)
        }));
      },

      clearComparison: () => {
        set({ comparisonProducts: [] });
      }
    }),
    {
      name: 'product-store',
      partialize: (state) => ({ 
        savedProducts: state.savedProducts,
        comparisonProducts: state.comparisonProducts 
      })
    }
  )
);
```

## Backend Implementation Specifications

### Core API Structure
```typescript
// api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

import productRoutes from './routes/products';
import analysisRoutes from './routes/analysis';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/analysis', authenticateToken, analysisRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

### Product Analysis Endpoint
```typescript
// api/src/routes/analysis.ts
import { Router } from 'express';
import { ProductAnalysisService } from '../services/ProductAnalysisService';
import { validateProductId } from '../middleware/validation';

const router = Router();
const analysisService = new ProductAnalysisService();

/**
 * GET /api/analysis/:productId
 * Get comprehensive product analysis including truth score
 */
router.get('/:productId', validateProductId, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check cache first
    const cachedAnalysis = await analysisService.getCachedAnalysis(productId);
    if (cachedAnalysis) {
      return res.json({
        success: true,
        data: cachedAnalysis,
        cached: true
      });
    }

    // Perform new analysis
    const analysis = await analysisService.analyzeProduct(productId, userId);
    
    // Cache the result
    await analysisService.cacheAnalysis(productId, analysis);

    res.json({
      success: true,
      data: analysis,
      cached: false
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/compare
 * Compare multiple products
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 product IDs required for comparison'
      });
    }

    const comparison = await analysisService.compareProducts(productIds);
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Product Analysis Service
```typescript
// api/src/services/ProductAnalysisService.ts
import { LLMService } from './LLMService';
import { DataAggregationService } from './DataAggregationService';
import { ReliabilityEngine } from './ReliabilityEngine';
import { CachingService } from './CachingService';
import { ProductDatabase } from '../database/ProductDatabase';

export class ProductAnalysisService {
  private llmService: LLMService;
  private dataAggregationService: DataAggregationService;
  private reliabilityEngine: ReliabilityEngine;
  private cachingService: CachingService;
  private productDatabase: ProductDatabase;

  constructor() {
    this.llmService = new LLMService();
    this.dataAggregationService = new DataAggregationService();
    this.reliabilityEngine = new ReliabilityEngine();
    this.cachingService = new CachingService();
    this.productDatabase = new ProductDatabase();
  }

  async analyzeProduct(productId: string, userId: string): Promise<ProductAnalysis> {
    try {
      // Fetch product data from multiple sources
      const productData = await this.dataAggregationService.aggregateProductData(productId);
      
      // Get LLM analysis
      const llmAnalysis = await this.llmService.analyzeProduct(productData);
      
      // Calculate truth score using reliability engine
      const truthScore = await this.reliabilityEngine.calculateTruthScore(productData);
      
      // Detect bias
      const biasAnalysis = await this.reliabilityEngine.detectBias(productData.reviews);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(productData, truthScore);

      const analysis: ProductAnalysis = {
        productId,
        product: productData.product,
        truthScore,
        biasAnalysis,
        llmAnalysis,
        recommendations,
        timestamp: new Date().toISOString(),
        dataSources: productData.sources
      };

      // Track analytics (anonymized)
      await this.trackAnalysis(userId, productId, analysis);

      return analysis;
    } catch (error) {
      console.error('Product analysis failed:', error);
      throw new Error('Failed to analyze product');
    }
  }

  async compareProducts(productIds: string[]): Promise<ProductComparison> {
    const analyses = await Promise.all(
      productIds.map(id => this.analyzeProduct(id, 'system'))
    );

    const comparison: ProductComparison = {
      products: analyses.map(a => ({
        id: a.productId,
        name: a.product.name,
        brand: a.product.brand,
        truthScore: a.truthScore.overallScore,
        confidence: a.truthScore.confidence,
        keyStrengths: a.recommendations.strengths,
        keyConcerns: a.recommendations.concerns
      })),
      winner: this.determineWinner(analyses),
      recommendations: this.generateComparisonRecommendations(analyses)
    };

    return comparison;
  }

  private determineWinner(analyses: ProductAnalysis[]): ProductWinner {
    const sorted = analyses.sort((a, b) => 
      b.truthScore.overallScore - a.truthScore.overallScore
    );

    return {
      productId: sorted[0].productId,
      productName: sorted[0].product.name,
      winningScore: sorted[0].truthScore.overallScore,
      reasons: this.generateWinningReasons(sorted[0], sorted[1])
    };
  }

  private async trackAnalysis(userId: string, productId: string, analysis: ProductAnalysis): Promise<void> {
    // Anonymize and track for analytics
    const anonymizedData = {
      timestamp: new Date().toISOString(),
      productCategory: analysis.product.category,
      truthScore: analysis.truthScore.overallScore,
      confidence: analysis.truthScore.confidence,
      biasRisk: analysis.biasAnalysis.riskLevel
    };

    // Store in analytics database (implementation details omitted)
    await this.storeAnalytics(userId, anonymizedData);
  }
}
```

## LLM Integration Implementation

### LLM Service with Fallback
```typescript
// api/src/services/LLMService.ts
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMProvider {
  name: string;
  generateResponse(prompt: string): Promise<LLMResponse>;
  isAvailable(): boolean;
}

export class LLMService {
  private providers: LLMProvider[];
  private currentProviderIndex: number;

  constructor() {
    this.providers = [
      new OpenAIProvider(),
      new GeminiProvider()
    ];
    this.currentProviderIndex = 0;
  }

  async analyzeProduct(productData: ProductData): Promise<LLMResponse> {
    const prompt = this.buildAnalysisPrompt(productData);
    
    // Try each provider with fallback
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[this.currentProviderIndex];
      
      try {
        if (provider.isAvailable()) {
          const response = await provider.generateResponse(prompt);
          return response;
        }
      } catch (error) {
        console.warn(`${provider.name} failed:`, error);
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        continue;
      }
    }

    throw new Error('All LLM providers unavailable');
  }

  private buildAnalysisPrompt(productData: ProductData): string {
    return `
    You are a product analysis expert. Analyze the following product data and provide insights:

    Product: ${productData.name}
    Brand: ${productData.brand}
    Category: ${productData.category}
    Price: $${productData.price}
    
    Customer Reviews Summary:
    - Total Reviews: ${productData.reviews.length}
    - Average Rating: ${productData.averageRating}/5
    - Rating Distribution: ${JSON.stringify(productData.ratingDistribution)}
    
    Key Review Themes:
    ${productData.reviewThemes.map(theme => `- ${theme}`).join('\n')}
    
    Product Claims:
    ${productData.claims.map(claim => `- ${claim}`).join('\n')}
    
    Specifications:
    ${JSON.stringify(productData.specifications, null, 2)}
    
    Please provide analysis in the following JSON format:
    {
      "summary": "Brief product overview",
      "strengths": ["Key product strengths"],
      "concerns": ["Potential issues or concerns"],
      "reviewAuthenticity": "Assessment of review reliability",
      "specificationAccuracy": "Analysis of claimed vs actual specs",
      "valueAssessment": "Price-to-quality evaluation",
      "recommendation": "Buy/Consider/Avoid with reasoning"
    }
    
    Be objective, specific, and provide actionable insights.
    `;
  }
}

class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { rawContent: content };
    } catch (error) {
      return { rawContent: content };
    }
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}

class GeminiProvider implements LLMProvider {
  name = 'Gemini';
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { rawContent: text };
    } catch (error) {
      return { rawContent: text };
    }
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }
}
```

## Database Schema Design

### PostgreSQL Schema
```sql
-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    review_date TIMESTAMP,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Truth scores table
CREATE TABLE truth_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    components JSONB NOT NULL,
    bias_analysis JSONB,
    data_sources JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User analytics (anonymized)
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    truth_score_range VARCHAR(20),
    bias_risk_level VARCHAR(20),
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent_hash VARCHAR(255),
    geographic_region VARCHAR(100)
);

-- Cache table for analysis results
CREATE TABLE analysis_cache (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_truth_scores_product_id ON truth_scores(product_id);
CREATE INDEX idx_truth_scores_overall ON truth_scores(overall_score);
CREATE INDEX idx_user_analytics_timestamp ON user_analytics(analysis_timestamp);
CREATE INDEX idx_analysis_cache_expires ON analysis_cache(expires_at);
```

### Redis Cache Schema
```javascript
// Product data cache
const productCache = {
  key: `product:${productId}`,
  value: {
    data: productData,
    ttl: 3600 // 1 hour
  }
};

// Analysis result cache
const analysisCache = {
  key: `analysis:${productId}`,
  value: {
    analysis: analysisResult,
    ttl: 1800 // 30 minutes
  }
};

// User session cache
const sessionCache = {
  key: `session:${sessionId}`,
  value: {
    userId: userId,
    preferences: userPreferences,
    ttl: 86400 // 24 hours
  }
};

// Rate limiting cache
const rateLimitCache = {
  key: `rate_limit:${ipAddress}`,
  value: {
    count: requestCount,
    windowStart: timestamp,
    ttl: 900 // 15 minutes
  }
};
```

## Security Implementation

### Authentication & Authorization
```typescript
// api/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### Data Validation & Sanitization
```typescript
// api/src/middleware/validation.ts
import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateProductId = [
  param('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateScanRequest = [
  body('barcode')
    .isString()
    .isLength({ min: 8, max: 13 })
    .withMessage('Barcode must be between 8 and 13 characters'),
  body('format')
    .optional()
    .isIn(['UPC-A', 'UPC-E', 'EAN-13', 'EAN-8', 'QR_CODE'])
    .withMessage('Invalid barcode format'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
```

## Deployment & Infrastructure

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Environment Configuration
```bash
# .env.example
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartshopper
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# LLM APIs
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Settings
CACHE_TTL_PRODUCT=3600
CACHE_TTL_ANALYSIS=1800

# Analytics
ANALYTICS_ENABLED=true
ANONYMIZE_USER_DATA=true
```

This technical design document provides the complete implementation blueprint for building the Smart Shopper platform, ensuring scalability, security, and optimal user experience for real-time product truth analysis.