import { ShoppingStrategy } from '../types/strategy';

interface StrategySelectorProps {
  selectedStrategy: ShoppingStrategy;
  onStrategyChange: (strategy: ShoppingStrategy) => void;
}

export default function StrategySelector({ selectedStrategy, onStrategyChange }: StrategySelectorProps) {
  const strategies = [
    {
      id: 'fancy' as ShoppingStrategy,
      title: 'Fancy',
      description: 'Prioritizes premium products with excellent design and brand reputation',
      icon: '✨',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 'cost-effective' as ShoppingStrategy,
      title: 'Cost-Effective',
      description: 'Balances price and quality for the best value-for-money products',
      icon: '💰',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 'price-priority' as ShoppingStrategy,
      title: 'Price Priority',
      description: 'Focuses on the most affordable options while maintaining basic quality',
      icon: '🏷️',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Shopping Strategy</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedStrategy === strategy.id
                ? strategy.color + ' border-opacity-100'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onStrategyChange(strategy.id)}
          >
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">{strategy.icon}</div>
              <h3 className="text-lg font-semibold">{strategy.title}</h3>
            </div>
            <p className="text-sm text-gray-600 text-center">{strategy.description}</p>
            {selectedStrategy === strategy.id && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-current bg-opacity-20">
                  Selected
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}