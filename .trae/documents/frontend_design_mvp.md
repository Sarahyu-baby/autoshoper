# Smart Shopper MVP Frontend Design Document

## MVP Design Philosophy (5-Hour Hackathon)

### Core Principles
- **Ultra-simple UI**: Maximum 3 screens total
- **Minimal components**: Reuse components wherever possible
- **No complex state**: Simple React state, no Redux/Zustand needed
- **Basic styling**: Tailwind CSS with minimal custom design
- **Text-first**: No camera integration, just text search

## MVP UI Architecture

### Screen 1: Search Interface
```
┌─────────────────────────────────┐
│      Smart Shopper MVP          │
├─────────────────────────────────┤
│  ┌───────────────────────────┐ │
│  │ Search products...        │ │
│  └───────────────────────────┘ │
│      [Search Button]            │
├─────────────────────────────────┤
│  Recent Searches (optional)     │
│  • iPhone 15                   │
│  • Samsung TV                   │
└─────────────────────────────────┘
```

**Components Needed:**
- Search input field
- Search button
- Simple list for recent searches

**Implementation Time:** ~30 minutes

### Screen 2: Search Results with Reliability Scores
```
┌─────────────────────────────────┐
│  Search: "laptop"              │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ MacBook Air M2              │ │
│ │ Reliability: 85/100 ████░    │ │
│ │ "Great build quality,       │ │
│ │ reliable performance"       │ │
│ │ [Compare Checkbox]          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Dell XPS 13                 │ │
│ │ Reliability: 72/100 ███░░    │ │
│ │ "Good value but some        │ │
│ │ quality concerns"           │ │
│ │ [Compare Checkbox]          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ HP Pavilion                 │ │
│ │ Reliability: 91/100 █████    │ │
│ │ "Excellent reliability      │ │
│ │ and customer support"       │ │
│ │ [Compare Checkbox]          │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [Compare Selected (2)]         │
└─────────────────────────────────┘
```

**Components Needed:**
- Product card component (reusable)
- Reliability score progress bar
- Compare checkbox
- "Compare Selected" button

**Implementation Time:** ~60 minutes

### Screen 3: Product Comparison
```
┌─────────────────────────────────┐
│      Compare Products          │
├─────────────────────────────────┤
│          vs                    │
│ ┌──────────┐ ┌──────────┐   │
│ │MacBook   │ │HP        │   │
│ │Air M2    │ │Pavilion  │   │
│ │          │ │          │   │
│ │85/100    │ │91/100    │   │
│ │████░     │ │█████     │   │
│ └──────────┘ └──────────┘   │
│                               │
│ MacBook: "Great build but     │
│ expensive"                    │
│                               │
│ HP: "Better value with        │
│ superior reliability"          │
│                               │
│ 🏆 Winner: HP Pavilion        │
│    (91 vs 85 reliability)     │
├─────────────────────────────────┤
│ [Search Again] [New Search]    │
└─────────────────────────────────┘
```

**Components Needed:**
- Comparison card component
- Winner badge
- Simple recommendation text

**Implementation Time:** ~45 minutes

## MVP Component Library

### Reusable Components (Build Once, Use Multiple Times)

#### 1. Product Card Component
```tsx
interface ProductCardProps {
  name: string;
  reliabilityScore: number;
  summary: string;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  reliabilityScore,
  summary,
  showCheckbox = false,
  isSelected = false,
  onSelect,
  id
}) => {
  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        {showCheckbox && (
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => onSelect?.(id)}
            className="ml-2"
          />
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Reliability</span>
          <span>{reliabilityScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              reliabilityScore >= 80 ? 'bg-green-500' : 
              reliabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${reliabilityScore}%` }}
          />
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{summary}</p>
    </div>
  );
};
```

#### 2. Search Bar Component
```tsx
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Search products..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
    </form>
  );
};
```

#### 3. Reliability Score Component
```tsx
interface ReliabilityScoreProps {
  score: number;
  showLabel?: boolean;
}

const ReliabilityScore: React.FC<ReliabilityScoreProps> = ({ score, showLabel = true }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Poor';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span>Reliability</span>
          <span>{score}/100</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-center mt-1 text-gray-600">
          {getScoreText(score)}
        </div>
      )}
    </div>
  );
};
```

## MVP State Management (Keep It Simple)

### App State Structure
```tsx
interface AppState {
  currentView: 'search' | 'results' | 'comparison';
  searchQuery: string;
  searchResults: Product[];
  selectedProducts: Product[];
  recentSearches: string[];
}

interface Product {
  id: string;
  name: string;
  reliabilityScore: number;
  summary: string;
  category?: string;
}
```

### Simple State Management (No External Libraries)
```tsx
const App = () => {
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'comparison'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = async (query: string) => {
    // Mock API call - replace with real API
    const mockResults: Product[] = [
      {
        id: '1',
        name: 'MacBook Air M2',
        reliabilityScore: 85,
        summary: 'Great build quality, reliable performance',
        category: 'Laptops'
      },
      {
        id: '2', 
        name: 'Dell XPS 13',
        reliabilityScore: 72,
        summary: 'Good value but some quality concerns',
        category: 'Laptops'
      },
      {
        id: '3',
        name: 'HP Pavilion',
        reliabilityScore: 91,
        summary: 'Excellent reliability and customer support',
        category: 'Laptops'
      }
    ];

    setSearchQuery(query);
    setSearchResults(mockResults);
    setCurrentView('results');
    setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
  };

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else if (prev.length < 3) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedProducts.length >= 2) {
      setCurrentView('comparison');
    }
  };

  // Render different views based on currentView
};
```

## MVP API Mock Data

### Mock API Responses for Quick Development
```tsx
// Mock API responses - replace with real API calls later
const mockSearchResults = {
  'laptop': [
    { id: '1', name: 'MacBook Air M2', reliabilityScore: 85, summary: 'Great build quality, reliable performance' },
    { id: '2', name: 'Dell XPS 13', reliabilityScore: 72, summary: 'Good value but some quality concerns' },
    { id: '3', name: 'HP Pavilion', reliabilityScore: 91, summary: 'Excellent reliability and customer support' }
  ],
  'phone': [
    { id: '4', name: 'iPhone 15 Pro', reliabilityScore: 88, summary: 'Premium build with consistent performance' },
    { id: '5', name: 'Samsung Galaxy S24', reliabilityScore: 82, summary: 'Feature-rich with good reliability' },
    { id: '6', name: 'Google Pixel 8', reliabilityScore: 79, summary: 'Clean software but hardware concerns' }
  ],
  'headphones': [
    { id: '7', name: 'Sony WH-1000XM5', reliabilityScore: 93, summary: 'Outstanding reliability and sound quality' },
    { id: '8', name: 'Bose QuietComfort', reliabilityScore: 89, summary: 'Excellent build and comfort' },
    { id: '9', name: 'AirPods Pro', reliabilityScore: 76, summary: 'Good features but battery issues' }
  ]
};

const getMockResults = (query: string) => {
  const lowerQuery = query.toLowerCase();
  for (const [key, results] of Object.entries(mockSearchResults)) {
    if (lowerQuery.includes(key)) return results;
  }
  return mockSearchResults.laptop; // Default fallback
};
```

## MVP Styling (Minimal Custom CSS)

### Tailwind CSS Configuration
```css
/* Minimal custom styles if needed */
.mvp-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.mvp-button {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.mvp-button-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.mvp-button-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}
```

## MVP Development Timeline (5 Hours)

### Hour 1: Setup & Basic Structure
- Set up React + Vite project
- Install Tailwind CSS
- Create basic app structure
- Build SearchBar component

### Hour 2: Search & Results
- Build ProductCard component
- Implement search functionality
- Create mock API responses
- Build search results view

### Hour 3: Reliability Scores
- Build ReliabilityScore component
- Add comparison checkboxes
- Implement product selection logic
- Style product cards

### Hour 4: Comparison View
- Build comparison component
- Add winner determination logic
- Create comparison layout
- Add basic recommendations

### Hour 5: Polish & Integration
- Connect all views together
- Add navigation between screens
- Polish UI and fix bugs
- Test all functionality

## MVP Success Criteria

### Must Work For Demo
- ✅ Search for products and see results
- ✅ View reliability scores (0-100)
- ✅ Compare 2-3 products side-by-side
- ✅ See basic recommendation text
- ✅ Navigate between 3 screens smoothly

### Nice to Have For Demo
- Category filtering
- Recent searches
- Save comparison results
- Responsive design

This MVP design keeps everything ultra-simple while delivering the core value proposition: helping users quickly assess product reliability and make comparisons.