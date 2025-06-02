import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL, COMPONENT_TYPES, BUILD_PURPOSES, BUDGET_RANGES } from '../config';
import { 
  Cpu, Monitor, HardDrive, Save, RefreshCw, AlertTriangle, Check, 
  X, ChevronRight, DollarSign, Zap, ListFilter, Search
} from 'lucide-react';

interface Component {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  [key: string]: any;
}

interface PCBuild {
  cpu?: Component;
  gpu?: Component;
  motherboard?: Component;
  ram?: Component;
  storage?: Component;
  psu?: Component;
  case?: Component;
  cooler?: Component;
  [key: string]: Component | undefined;
}

interface BuildSummary {
  totalPrice: number;
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
  performance: {
    gaming: number;
    productivity: number;
    content: number;
  };
}

const componentIcons: { [key: string]: React.ReactNode } = {
  cpu: <Cpu className="h-5 w-5" />,
  gpu: <Monitor className="h-5 w-5" />,
  motherboard: <HardDrive className="h-5 w-5" />,
  ram: <HardDrive className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  psu: <Zap className="h-5 w-5" />,
  case: <HardDrive className="h-5 w-5" />,
  cooler: <HardDrive className="h-5 w-5" />
};

const BuilderPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for current build
  const [currentBuild, setCurrentBuild] = useState<PCBuild>({});
  
  // State for automatic build
  const [showAutoBuildForm, setShowAutoBuildForm] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<string>('gaming');
  const [budget, setBudget] = useState<string>('mid-range');
  const [customBudget, setCustomBudget] = useState<number>(1000);
  
  // State for build summary
  const [buildSummary, setBuildSummary] = useState<BuildSummary>({
    totalPrice: 0,
    compatibility: {
      compatible: true,
      issues: []
    },
    performance: {
      gaming: 0,
      productivity: 0,
      content: 0
    }
  });
  
  // State for component selection
  const [selectingComponentType, setSelectingComponentType] = useState<string | null>(null);
  const [compatibleComponents, setCompatibleComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  
  // Handle adding component from component detail page
  useEffect(() => {
    if (location.state?.addComponent) {
      const { type, component } = location.state.addComponent;
      const componentType = type.slice(0, -1); // Remove 's' from plural
      
      setCurrentBuild(prev => ({
        ...prev,
        [componentType]: component
      }));
      
      // Clear location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);
  
  // Calculate build summary whenever build changes
  useEffect(() => {
    // Calculate total price
    const totalPrice = Object.values(currentBuild).reduce(
      (sum, component) => sum + (component?.price || 0),
      0
    );
    
    // Check compatibility
    const compatibilityIssues: string[] = [];
    let compatible = true;
    
    // CPU and motherboard socket compatibility
    if (currentBuild.cpu && currentBuild.motherboard) {
      if (currentBuild.cpu.socket !== currentBuild.motherboard.socket) {
        compatibilityIssues.push(`CPU socket ${currentBuild.cpu.socket} is not compatible with motherboard socket ${currentBuild.motherboard.socket}`);
        compatible = false;
      }
    }
    
    // PSU wattage check
    if (currentBuild.psu && (currentBuild.cpu || currentBuild.gpu)) {
      const requiredWattage = (currentBuild.cpu?.tdp || 0) + (currentBuild.gpu?.tdp || 0) + 150; // 150W buffer
      if (currentBuild.psu.power < requiredWattage) {
        compatibilityIssues.push(`PSU wattage (${currentBuild.psu.power}W) may be insufficient for this build (recommended: ${requiredWattage}W)`);
        compatible = false;
      }
    }
    
    // Calculate theoretical performance scores
    let gamingScore = 0;
    let productivityScore = 0;
    let contentScore = 0;
    
    if (currentBuild.cpu) {
      const cpuScore = (currentBuild.cpu.cores || 4) * (currentBuild.cpu.base_clock || 2.5);
      gamingScore += cpuScore * 0.4;
      productivityScore += cpuScore * 0.6;
      contentScore += cpuScore * 0.5;
    }
    
    if (currentBuild.gpu) {
      const gpuScore = (currentBuild.gpu.memory_size || 4) * (currentBuild.gpu.tdp || 150) / 30;
      gamingScore += gpuScore * 0.6;
      productivityScore += gpuScore * 0.3;
      contentScore += gpuScore * 0.5;
    }
    
    if (currentBuild.ram) {
      const ramScore = (currentBuild.ram.capacity || 8) * (currentBuild.ram.speed || 3200) / 1000;
      gamingScore += ramScore * 0.1;
      productivityScore += ramScore * 0.2;
      contentScore += ramScore * 0.2;
    }
    
    // Scale scores to 0-100
    gamingScore = Math.min(100, Math.round(gamingScore));
    productivityScore = Math.min(100, Math.round(productivityScore));
    contentScore = Math.min(100, Math.round(contentScore));
    
    setBuildSummary({
      totalPrice,
      compatibility: {
        compatible,
        issues: compatibilityIssues
      },
      performance: {
        gaming: gamingScore,
        productivity: productivityScore,
        content: contentScore
      }
    });
  }, [currentBuild]);
  
  // Function to fetch compatible components
  const fetchCompatibleComponents = async (type: string) => {
    setSelectingComponentType(type);
    try {
      // In a real app, we would filter by compatibility with current build
      const response = await axios.get(`${API_URL}/api/components/${type}s/compatible`, {
        params: {
          buildComponents: JSON.stringify(currentBuild)
        }
      });
      setCompatibleComponents(response.data);
    } catch (error) {
      console.error('Error fetching compatible components:', error);
      
      // For demo purposes, create mock data if API fails
      const mockComponents = generateMockComponents(type + 's', 8);
      setCompatibleComponents(mockComponents);
    }
  };
  
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
                      type === 'coolers' ? 50 : 100;
    
    for (let i = 1; i <= count; i++) {
      const randomPrice = basePrice + Math.floor(Math.random() * basePrice * 1.5);
      let mockComponent: Component = {
        id: i,
        name: `${type.charAt(0).toUpperCase() + type.slice(1, -1)} Model ${i}`,
        price: randomPrice,
        image_url: `https://via.placeholder.com/200x200.png?text=${type}`
      };
      
      // Add specific properties based on component type
      if (type === 'cpus') {
        mockComponent = {
          ...mockComponent,
          name: `${i % 2 === 0 ? 'Intel Core i' : 'AMD Ryzen '}${Math.min(3 + Math.floor(i / 3), 9)}${i % 2 === 0 ? '-1' : ' '}${i % 5 + 1}00${i % 2 === 0 ? 'K' : 'X'}`,
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
          name: `${i % 2 === 0 ? 'NVIDIA RTX' : 'AMD Radeon RX'} ${i % 2 === 0 ? '40' : '70'}${i % 9 + 1}0${i % 2 === 0 ? '' : 'XT'}`,
          memory_size: 8 + (i % 3) * 4,
          memory_type: 'GDDR6',
          tdp: 150 + (i % 5) * 30
        };
      } else if (type === 'motherboards') {
        mockComponent = {
          ...mockComponent,
          name: `${i % 3 === 0 ? 'ASUS ROG' : i % 3 === 1 ? 'MSI MPG' : 'Gigabyte AORUS'} ${i % 2 === 0 ? 'Z790' : 'B650'} ${i % 2 === 0 ? 'Gaming' : 'Pro'}`,
          socket: i % 2 === 0 ? 'LGA1700' : 'AM5',
          chipset: i % 2 === 0 ? 'Z790' : 'B650',
          form_factor: i % 5 === 0 ? 'Mini-ITX' : i % 5 === 1 ? 'Micro-ATX' : 'ATX'
        };
      } else if (type === 'psu') {
        mockComponent = {
          ...mockComponent,
          name: `${i % 3 === 0 ? 'Corsair' : i % 3 === 1 ? 'EVGA' : 'Seasonic'} ${650 + (i % 5) * 100}W ${i % 3 === 0 ? 'Gold' : i % 3 === 1 ? 'Bronze' : 'Platinum'}`,
          power: 650 + (i % 5) * 100,
          efficiency_rating: i % 3 === 0 ? '80 Plus Gold' : i % 3 === 1 ? '80 Plus Bronze' : '80 Plus Platinum'
        };
      }
      
      mockData.push(mockComponent);
    }
    
    return mockData;
  };
  
  // Function to generate automatic build based on purpose and budget
  const generateAutoBuild = async () => {
    try {
      // Determine budget value
      let budgetValue = customBudget;
      if (budget !== 'custom') {
        const selectedBudgetRange = BUDGET_RANGES.find(range => range.id === budget);
        if (selectedBudgetRange) {
          budgetValue = (selectedBudgetRange.min + selectedBudgetRange.max) / 2;
        }
      }
      
      const response = await axios.post(`${API_URL}/api/builder/auto`, {
        purpose,
        budget: budgetValue
      });
      
      setCurrentBuild(response.data);
    } catch (error) {
      console.error('Error generating automatic build:', error);
      
      // For demo purposes, create mock build if API fails
      const mockBuild: PCBuild = {
        cpu: generateMockComponents('cpus', 1)[0],
        gpu: generateMockComponents('gpus', 1)[0],
        motherboard: generateMockComponents('motherboards', 1)[0],
        ram: {
          id: 1,
          name: 'Corsair Vengeance 16GB (2x8GB) DDR4 3200MHz',
          price: 79.99,
          capacity: 16,
          speed: 3200,
          type: 'DDR4'
        },
        storage: {
          id: 1,
          name: 'Samsung 970 EVO Plus 1TB NVMe SSD',
          price: 119.99,
          capacity: 1000,
          type: 'NVMe',
          interface: 'PCIe 4.0'
        },
        psu: {
          id: 1,
          name: 'Corsair RM750x 750W 80+ Gold',
          price: 124.99,
          power: 750,
          efficiency_rating: '80 Plus Gold',
          modular: true
        },
        case: {
          id: 1,
          name: 'NZXT H510 ATX Mid Tower',
          price: 89.99,
          form_factor: 'ATX',
          max_gpu_length: 381,
          max_cooler_height: 165
        },
        cooler: {
          id: 1,
          name: 'Cooler Master Hyper 212 RGB',
          price: 44.99,
          type: 'Air',
          socket: 'Universal',
          tdp_supported: 150,
          fan_size: 120
        }
      };
      
      // Adjust build based on budget
      if (budget === 'budget' || customBudget < 800) {
        delete mockBuild.gpu;
        mockBuild.cpu = {
          ...mockBuild.cpu!,
          name: 'Intel Core i3-12100F',
          price: 109.99,
          cores: 4,
          threads: 8,
          socket: 'LGA1700'
        };
      } else if (budget === 'high-end' || customBudget > 1500) {
        mockBuild.cpu = {
          ...mockBuild.cpu!,
          name: 'Intel Core i9-13900K',
          price: 549.99,
          cores: 24,
          threads: 32,
          socket: 'LGA1700'
        };
        mockBuild.gpu = {
          ...mockBuild.gpu!,
          name: 'NVIDIA RTX 4080 16GB',
          price: 1199.99,
          memory_size: 16,
          memory_type: 'GDDR6X',
          tdp: 320
        };
      }
      
      setCurrentBuild(mockBuild);
    } finally {
      setShowAutoBuildForm(false);
    }
  };
  
  // Function to save current build
  const saveBuild = async () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/builder' } });
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/builds`, {
        name: 'My Custom Build',
        components: currentBuild,
        totalPrice: buildSummary.totalPrice
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Navigate to saved builds page
      navigate('/saved-builds');
    } catch (error) {
      console.error('Error saving build:', error);
      // Handle error (e.g., show notification)
    }
  };
  
  // Filter components based on search and price range
  const filteredComponents = compatibleComponents
    .filter(component => 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      component.price >= priceRange.min && 
      component.price <= priceRange.max
    )
    .sort((a, b) => a.price - b.price);
  
  // Handle price range change
  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (type === 'min' ? 0 : 10000) : parseInt(value);
    setPriceRange(prev => ({ ...prev, [type]: numValue }));
  };
  
  // Function to add component to build
  const addComponentToBuild = (component: Component) => {
    if (selectingComponentType) {
      setCurrentBuild(prev => ({
        ...prev,
        [selectingComponentType]: component
      }));
      setSelectingComponentType(null);
    }
  };
  
  // Function to remove component from build
  const removeComponentFromBuild = (type: string) => {
    setCurrentBuild(prev => {
      const newBuild = { ...prev };
      delete newBuild[type];
      return newBuild;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">PC Builder</h1>
      
      {/* Build summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compatibility status */}
        <div className={`p-6 rounded-lg shadow-md ${
          buildSummary.compatibility.compatible ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <h2 className="text-lg font-semibold mb-3">Compatibility</h2>
          
          {Object.keys(currentBuild).length === 0 ? (
            <p className="text-gray-500">Add components to check compatibility</p>
          ) : buildSummary.compatibility.compatible ? (
            <div className="flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              <span>All components are compatible</span>
            </div>
          ) : (
            <>
              <div className="flex items-center text-yellow-700 mb-2">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Compatibility issues detected</span>
              </div>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {buildSummary.compatibility.issues.map((issue, index) => (
                  <li key={index} className="mb-1">{issue}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        {/* Price summary */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Price Summary</h2>
          
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-2xl font-bold">${buildSummary.totalPrice.toFixed(2)}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {Object.entries(currentBuild).length} components selected
          </div>
        </div>
        
        {/* Performance score */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Performance Score</h2>
          
          {Object.keys(currentBuild).length === 0 ? (
            <p className="text-gray-500">Add components to see performance</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Gaming</span>
                  <span className="text-sm font-medium text-gray-700">{buildSummary.performance.gaming}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${buildSummary.performance.gaming}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Productivity</span>
                  <span className="text-sm font-medium text-gray-700">{buildSummary.performance.productivity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${buildSummary.performance.productivity}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Content Creation</span>
                  <span className="text-sm font-medium text-gray-700">{buildSummary.performance.content}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${buildSummary.performance.content}%` }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Component selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Left side - Component list */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Components</h2>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAutoBuildForm(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Auto-Build
                </button>
                
                <button
                  onClick={() => setCurrentBuild({})}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {/* CPU */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Processor (CPU)</h3>
                    {currentBuild.cpu ? (
                      <p className="text-sm text-gray-600">{currentBuild.cpu.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No CPU selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.cpu && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.cpu.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('cpu')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('cpu')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.cpu ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Motherboard */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Motherboard</h3>
                    {currentBuild.motherboard ? (
                      <p className="text-sm text-gray-600">{currentBuild.motherboard.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No motherboard selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.motherboard && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.motherboard.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('motherboard')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('motherboard')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.motherboard ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* GPU */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Graphics Card (GPU)</h3>
                    {currentBuild.gpu ? (
                      <p className="text-sm text-gray-600">{currentBuild.gpu.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No GPU selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.gpu && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.gpu.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('gpu')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('gpu')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.gpu ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* RAM */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Memory (RAM)</h3>
                    {currentBuild.ram ? (
                      <p className="text-sm text-gray-600">{currentBuild.ram.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No RAM selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.ram && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.ram.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('ram')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('ram')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.ram ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Storage */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Storage</h3>
                    {currentBuild.storage ? (
                      <p className="text-sm text-gray-600">{currentBuild.storage.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No storage selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.storage && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.storage.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('storage')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('storage')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.storage ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* PSU */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Power Supply</h3>
                    {currentBuild.psu ? (
                      <p className="text-sm text-gray-600">{currentBuild.psu.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No power supply selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.psu && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.psu.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('psu')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('psu')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.psu ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Case */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Case</h3>
                    {currentBuild.case ? (
                      <p className="text-sm text-gray-600">{currentBuild.case.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No case selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.case && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.case.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('case')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('case')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.case ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* CPU Cooler */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">CPU Cooler</h3>
                    {currentBuild.cooler ? (
                      <p className="text-sm text-gray-600">{currentBuild.cooler.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">No CPU cooler selected</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentBuild.cooler && (
                    <>
                      <span className="text-sm font-medium">${currentBuild.cooler.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeComponentFromBuild('cooler')}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => fetchCompatibleComponents('cooler')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {currentBuild.cooler ? 'Change' : 'Add'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Action panel */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={saveBuild}
                disabled={Object.keys(currentBuild).length === 0}
                className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  Object.keys(currentBuild).length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Save className="mr-2 h-5 w-5" />
                Save Build
              </button>
              
              <Link
                to="/catalog"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ListFilter className="mr-2 h-5 w-5" />
                Browse Components
              </Link>
              
              <button
                onClick={() => setShowAutoBuildForm(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Zap className="mr-2 h-5 w-5" />
                Auto-Build
              </button>
              
              <button
                onClick={() => setCurrentBuild({})}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Clear Build
              </button>
            </div>
            
            {Object.keys(currentBuild).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Build Summary</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {Object.keys(currentBuild).length} components selected
                </p>
                <p className="text-lg font-bold text-gray-900">
                  Total: ${buildSummary.totalPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Auto-build form */}
      {showAutoBuildForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Auto-Build PC</h2>
            <p className="text-gray-600 mb-6">
              Let us suggest the perfect components based on your needs and budget.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Build Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {BUILD_PURPOSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (${b.min} - ${b.max})
                    </option>
                  ))}
                  <option value="custom">Custom Budget</option>
                </select>
              </div>
              
              {budget === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Budget ($)
                  </label>
                  <input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(parseInt(e.target.value) || 0)}
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAutoBuildForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={generateAutoBuild}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Generate Build
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Component selection dialog */}
      {selectingComponentType && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Select {selectingComponentType.charAt(0).toUpperCase() + selectingComponentType.slice(1)}
                </h2>
                <button
                  onClick={() => setSelectingComponentType(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
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
                  <div>
                    <label className="sr-only">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min $"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                      min="0"
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="sr-only">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                      min="0"
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No components found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredComponents.map(component => (
                    <div
                      key={component.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition duration-200"
                      onClick={() => addComponentToBuild(component)}
                    >
                      <div className="flex">
                        <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                          {component.image_url ? (
                            <img
                              src={component.image_url}
                              alt={component.name}
                              className="max-h-12 max-w-12 object-contain"
                            />
                          ) : (
                            componentIcons[selectingComponentType] || <HardDrive className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium text-gray-900">{component.name}</h3>
                          
                          {/* Component-specific details */}
                          {selectingComponentType === 'cpu' && component.cores && (
                            <p className="text-xs text-gray-500 mt-1">
                              {component.cores} Cores | {component.threads} Threads | {component.socket}
                            </p>
                          )}
                          
                          {selectingComponentType === 'motherboard' && component.chipset && (
                            <p className="text-xs text-gray-500 mt-1">
                              {component.socket} | {component.chipset} | {component.form_factor}
                            </p>
                          )}
                          
                          {selectingComponentType === 'gpu' && component.memory_size && (
                            <p className="text-xs text-gray-500 mt-1">
                              {component.memory_size}GB {component.memory_type}
                            </p>
                          )}
                          
                          {selectingComponentType === 'psu' && component.power && (
                            <p className="text-xs text-gray-500 mt-1">
                              {component.power}W | {component.efficiency_rating}
                            </p>
                          )}
                          
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900">${component.price.toFixed(2)}</span>
                            <span className="text-xs text-blue-600">Select</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectingComponentType(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderPage;