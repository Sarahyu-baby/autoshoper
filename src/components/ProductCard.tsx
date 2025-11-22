import { Product } from '../types/product';
import { ShoppingStrategy } from '../types/strategy';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  strategy: ShoppingStrategy;
}

export default function ProductCard({ product, isSelected, onSelect, strategy }: ProductCardProps) {
  const getStrategyColor = () => {
    switch (strategy) {
      case 'fancy':
        return 'border-purple-300 bg-purple-50';
      case 'cost-effective':
        return 'border-green-300 bg-green-50';
      case 'price-priority':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all hover:shadow-lg ${
      isSelected ? getStrategyColor() : 'border-gray-200'
    }`}>
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            {product.sourcePlatform}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
          <span className="text-lg font-bold text-gray-900">${product.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(product.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Select for Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}