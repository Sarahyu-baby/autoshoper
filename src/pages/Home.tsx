import { useState } from 'react';
import ProductSearch from '../components/ProductSearch';
import StrategySelector from '../components/StrategySelector';
import ProductGrid from '../components/ProductGrid';
import { Product } from '../types/product';
import { ShoppingStrategy } from '../types/strategy';
import { generateRecommendations } from '../utils/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [strategy, setStrategy] = useState<ShoppingStrategy>('cost-effective');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleSearchResults = (results: any) => {
    setProducts(results.products);
    setSelectedProducts([]);
    setShowRecommendations(false);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleGenerateRecommendations = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product for analysis.');
      return;
    }

    setIsLoading(true);
    try {
      const recommendations = await generateRecommendations({
        products: selectedProducts,
        strategy: strategy
      });
      
      setRecommendations(recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Recommendation error:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoShopping Assistant</h1>
          <p className="text-lg text-gray-600">
            Make smarter shopping decisions with AI-powered comment analysis and personalized strategies
          </p>
        </div>

        <StrategySelector 
          selectedStrategy={strategy} 
          onStrategyChange={setStrategy} 
        />

        <ProductSearch 
          onSearchResults={handleSearchResults}
          onLoading={setIsLoading}
        />

        {products.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Search Results ({products.length})
              </h2>
              {selectedProducts.length > 0 && (
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Analyzing...' : `Analyze ${selectedProducts.length} Selected`}
                </button>
              )}
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800">
                  <span className="font-medium">{selectedProducts.length} products selected</span> - 
                  Click "Analyze" to get AI-powered recommendations based on your {strategy} strategy.
                </p>
              </div>
            )}
            
            <ProductGrid
              products={products}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              strategy={strategy}
            />
          </div>
        )}

        {showRecommendations && recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Recommendations ({strategy} strategy)</h2>
            <div className="space-y-6">
              {recommendations.map((rec, index) => {
                const product = products.find(p => p.id === rec.productId);
                if (!product) return null;
                
                return (
                  <div key={rec.productId} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {rec.ranking}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">${product.price}</div>
                            <div className="text-sm text-gray-600">Score: {rec.score}/1.0</div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-800 mb-1">Why this recommendation:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.reasoning.map((reason: string, i: number) => (
                              <li key={i}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-green-700 mb-1">Pros:</h5>
                            <ul className="text-gray-600 space-y-1">
                              {rec.pros.map((pro: string, i: number) => (
                                <li key={i}>+ {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-red-700 mb-1">Cons:</h5>
                            <ul className="text-gray-600 space-y-1">
                              {rec.cons.map((con: string, i: number) => (
                                <li key={i}>- {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${rec.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}