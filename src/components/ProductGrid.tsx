import { Product } from '../types/product';
import { ShoppingStrategy } from '../types/strategy';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedProducts: string[];
  onProductSelect: (productId: string) => void;
  strategy: ShoppingStrategy;
}

export default function ProductGrid({ products, selectedProducts, onProductSelect, strategy }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProducts.includes(product.id)}
          onSelect={onProductSelect}
          strategy={strategy}
        />
      ))}
    </div>
  );
}