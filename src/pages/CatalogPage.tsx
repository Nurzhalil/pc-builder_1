import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COMPONENT_TYPES, DEFAULT_COMPONENT_IMAGE } from '../config';
import { Search, Filter, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

// Component type interface
interface ComponentType {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Component interface
interface Component {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  [key: string]: any; // For additional properties based on component type
}

const ComponentCatalogPage: React.FC = () => {
  // State for component types and selected type
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('cpus');
  
  // State for components and loading state
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Initialize component types
  useEffect(() => {
    const types = [
      { id: 'cpus', name: 'Processors (CPUs)', icon: '🔄' },
      { id: 'gpus', name: 'Graphics Cards (GPUs)', icon: '🖥️' },
      { id: 'motherboards', name: 'Motherboards', icon: '🔌' },
      { id: 'ram', name: 'Memory (RAM)', icon: '🧠' },
      { id: 'storage', name: 'Storage', icon: '💾' },
      { id: 'psu', name: 'Power Supplies', icon: '⚡' },
      { id: 'cases', name: 'Cases', icon: '📦' },
      { id: 'coolers', name: 'CPU Coolers', icon: '❄️' },
      { id: 'monitors', name: 'Monitors', icon: '🖥️' },
      { id: 'peripherals', name: 'Peripherals', icon: '🎮' }
    ];
    setComponentTypes(types);
  }, []);

  // Fetch components based on selected type
  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/components/${selectedType}`);
        setComponents(response.data);
      } catch (error) {
        console.error('Error fetching components:', error);
        // For demo purposes, create mock data if API fails
        const mockComponents = generateMockComponents(selectedType, 12);
        setComponents(mockComponents);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [selectedType]);

  // Generate mock components for demo purposes
  const generateMockComponents = (type: string, count: number): Component[] => {
    const mockData: Component[] = [];
    const basePrice = type === 'cpus' ? 200 : 
                      type === 'gpus' ? 400 : 
                      type === 'motherboards' ? 150 : 
                      type === 'ram' ? 80 : 
                      type === 'storage' ? 100 : 
                      type === 'psu' ? 80 : 
                      type === 'cases' ? 100 : 
                      type === 'coolers' ? 50 : 
                      type === 'monitors' ? 250 : 50;
    
    for (let i = 1; i <= count; i++) {
      const randomPrice = basePrice + Math.floor(Math.random() * basePrice * 1.5);
      let mockComponent: Component = {
        id: i,
        name: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} Model ${i}`,
        price: randomPrice,
        image_url: DEFAULT_COMPONENT_IMAGE
      };
      
      // Add specific properties based on component type
      if (type === 'cpus') {
        mockComponent = {
          ...mockComponent,
          name: `Intel Core i${Math.min(3 + Math.floor(i / 3), 9)} Gen ${10 + Math.floor(i / 4)}`,
          socket: i % 2 === 0 ? 'LGA1700' : 'AM5',
          cores: 4 + (i % 8),
          threads: 8 + (i % 8),
          base_clock: 2.5 + (i % 10) / 10,
          boost_clock: 3.5 + (i % 10) / 10,
          tdp: 65 + (i % 3) * 20
        };
      } else if (type === 'gpus') {
        mockComponent = {
          ...mockComponent,
          name: `NVIDIA RTX ${i % 2 === 0 ? '40' : '30'}${i % 9 + 1}0`,
          memory_size: 8 + (i % 3) * 4,
          memory_type: 'GDDR6',
          tdp: 150 + (i % 5) * 30
        };
      }
      
      mockData.push(mockComponent);
    }
    
    return mockData;
  };

  // Filter and sort components
  const filteredComponents = components
    .filter(component => 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      component.price >= priceRange.min && 
      component.price <= priceRange.max
    )
    .sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return 0;
    });

  // Handle price range change
  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (type === 'min' ? 0 : 10000) : parseInt(value);
    setPriceRange(prev => ({ ...prev, [type]: numValue }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Component Catalog</h1>
      
      {/* Component type selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {componentTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="block pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price ($)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price ($)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Component grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No components found matching your criteria.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">Showing {filteredComponents.length} components</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredComponents.map(component => (
                  <Link
                    key={component.id}
                    to={`/catalog/${selectedType}/${component.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        {component.image_url ? (
                          <img
                            src={component.image_url}
                            alt={component.name}
                            className="max-h-full object-contain p-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = DEFAULT_COMPONENT_IMAGE;
                            }}
                          />
                        ) : (
                          <img
                            src={DEFAULT_COMPONENT_IMAGE}
                            alt={component.name}
                            className="max-h-full object-contain p-4"
                          />
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition duration-300">
                          {component.name}
                        </h3>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-gray-900 font-bold">${component.price.toFixed(2)}</span>
                          <span className="text-sm text-blue-600 font-medium">View Details</span>
                        </div>
                        
                        {/* Component-specific info */}
                        {selectedType === 'cpus' && component.cores && (
                          <div className="mt-2 text-sm text-gray-500">
                            {component.cores} Cores | {component.threads} Threads | {component.socket}
                          </div>
                        )}
                        
                        {selectedType === 'gpus' && component.memory_size && (
                          <div className="mt-2 text-sm text-gray-500">
                            {component.memory_size}GB {component.memory_type}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ComponentCatalogPage;