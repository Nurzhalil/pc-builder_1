import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, COMPONENT_TYPES, DEFAULT_COMPONENT_IMAGE } from '../config';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';

interface Component {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  [key: string]: any;
}

const getComponentTypeName = (type: string): string => {
  switch (type) {
    case 'cpus': return 'Processor (CPU)';
    case 'gpus': return 'Graphics Card (GPU)';
    case 'motherboards': return 'Motherboard';
    case 'ram': return 'Memory (RAM)';
    case 'storage': return 'Storage';
    case 'psu': return 'Power Supply';
    case 'cases': return 'Case';
    case 'coolers': return 'CPU Cooler';
    case 'monitors': return 'Monitor';
    case 'keyboards': return 'Keyboard';
    case 'mice': return 'Mouse';
    case 'headsets': return 'Headset';
    case 'speakers': return 'Speakers';
    case 'webcams': return 'Webcam';
    default: return 'Component';
  }
};

const ComponentDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [compatibleWith, setCompatibleWith] = useState<{ type: string; components: Component[] }>({ type: '', components: [] });

  useEffect(() => {
    const fetchComponentDetails = async () => {
      if (!type || !id) {
        setError('Invalid component type or ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/components/${type}/${id}`);
        const componentData = {
          ...response.data,
          price: Number(response.data.price) || 0
        };
        setComponent(componentData);
        
        // For demo purposes, fetch some compatible components
        if (type === 'cpus' || type === 'motherboards') {
          const compatType = type === 'cpus' ? 'motherboards' : 'cpus';
          const compatResponse = await axios.get(`${API_URL}/compatibility/${type}/${id}/${compatType}`);
          setCompatibleWith({
            type: compatType,
            components: compatResponse.data.map((comp: any) => ({
              ...comp,
              price: Number(comp.price) || 0
            }))
          });
        }
      } catch (error) {
        console.error('Error fetching component details:', error);
        
        // For demo purposes, create mock data if API fails
        if (type && id) {
          const mockComponent = generateMockComponent(type, parseInt(id));
          setComponent(mockComponent);
          
          if (type === 'cpus' || type === 'motherboards') {
            const compatType = type === 'cpus' ? 'motherboards' : 'cpus';
            const mockCompatible = generateMockComponents(compatType, 4);
            setCompatibleWith({
              type: compatType,
              components: mockCompatible
            });
          }
        } else {
          setError('Failed to load component details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComponentDetails();
  }, [type, id]);

  // Generate mock component for demo purposes
  const generateMockComponent = (type: string, id: number): Component => {
    const basePrice = type === 'cpus' ? 200 : 
                      type === 'gpus' ? 400 : 
                      type === 'motherboards' ? 150 : 
                      type === 'ram' ? 80 : 
                      type === 'storage' ? 100 : 100;
    
    const randomPrice = basePrice + Math.floor(Math.random() * basePrice * 1.5);
    
    let mockComponent: Component = {
      id,
      name: `${getComponentTypeName(type)} Model ${id}`,
      price: randomPrice,
      image_url: `https://via.placeholder.com/400x400.png?text=${type}`
    };
    
    // Add specific properties based on component type
    if (type === 'cpus') {
      mockComponent = {
        ...mockComponent,
        name: `Intel Core i${Math.min(3 + Math.floor(id / 3), 9)} Gen ${10 + Math.floor(id / 4)}`,
        socket: id % 2 === 0 ? 'LGA1700' : 'AM5',
        cores: 4 + (id % 8),
        threads: 8 + (id % 8),
        base_clock: 2.5 + (id % 10) / 10,
        boost_clock: 3.5 + (id % 10) / 10,
        tdp: 65 + (id % 3) * 20,
        description: "This processor delivers exceptional performance for gaming and productivity tasks with advanced multi-core architecture and intelligent thermal management."
      };
    } else if (type === 'gpus') {
      mockComponent = {
        ...mockComponent,
        name: `NVIDIA RTX ${id % 2 === 0 ? '40' : '30'}${id % 9 + 1}0`,
        memory_size: 8 + (id % 3) * 4,
        memory_type: 'GDDR6',
        core_clock: 1400 + (id % 10) * 50,
        boost_clock: 1800 + (id % 10) * 50,
        tdp: 150 + (id % 5) * 30,
        description: "This graphics card delivers stunning visuals and high frame rates for the latest games with real-time ray tracing and AI-enhanced graphics."
      };
    } else if (type === 'motherboards') {
      mockComponent = {
        ...mockComponent,
        name: `${id % 2 === 0 ? 'ASUS ROG' : 'MSI MPG'} ${id % 2 === 0 ? 'Z790' : 'B650'} Gaming`,
        socket: id % 2 === 0 ? 'LGA1700' : 'AM5',
        chipset: id % 2 === 0 ? 'Z790' : 'B650',
        form_factor: 'ATX',
        ram_slots: 4,
        max_ram: 128,
        has_integrated_wifi: id % 2 === 0,
        description: "This motherboard offers robust power delivery, comprehensive connectivity options, and stylish RGB lighting for a premium PC building experience."
      };
    }
    
    return mockComponent;
  };

  // Generate mock components for demo purposes
  const generateMockComponents = (type: string, count: number): Component[] => {
    const mockData: Component[] = [];
    
    for (let i = 1; i <= count; i++) {
      mockData.push(generateMockComponent(type, i));
    }
    
    return mockData;
  };

  // Function to render component-specific details based on type
  const renderComponentDetails = () => {
    if (!component) return null;

    // Common details for all components
    const commonDetails = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Specifications</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <table className="w-full">
              <tbody>
                {Object.entries(component)
                  .filter(([key]) => !['id', 'name', 'price', 'image_url', 'description'].includes(key))
                  .map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-2 text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 text-sm text-gray-900">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-600">
              {component.description || 'No detailed description available for this component.'}
            </p>
          </div>
        </div>
      </div>
    );

    // Type-specific details and return appropriate section
    switch (type) {
      case 'cpus':
        return (
          <>
            {commonDetails}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compatible Motherboards</h3>
              {compatibleWith.components.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compatibleWith.components.map(comp => (
                    <Link
                      key={comp.id}
                      to={`/catalog/motherboards/${comp.id}`}
                      className="block group"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition duration-300">
                        <div className="flex items-center mb-2">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{comp.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {comp.socket} | {comp.chipset}
                        </div>
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          ${comp.price.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700">No compatible motherboards found for this CPU.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'motherboards':
        return (
          <>
            {commonDetails}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compatible CPUs</h3>
              {compatibleWith.components.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compatibleWith.components.map(comp => (
                    <Link
                      key={comp.id}
                      to={`/catalog/cpus/${comp.id}`}
                      className="block group"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition duration-300">
                        <div className="flex items-center mb-2">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{comp.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {comp.cores} Cores | {comp.threads} Threads
                        </div>
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          ${comp.price.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700">No compatible CPUs found for this motherboard.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      default:
        return commonDetails;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error || 'Component not found'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/catalog" className="text-gray-500 hover:text-blue-600">
                Components
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to={`/catalog?type=${type}`} className="text-gray-500 hover:text-blue-600">
                {getComponentTypeName(type || '')}s
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 truncate max-w-xs">{component.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Component header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{component.name}</h1>
        
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-gray-900">${component.price.toFixed(2)}</span>
          
          <button
            onClick={() => navigate('/builder', { state: { addComponent: { type, component } } })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Build
          </button>
        </div>
      </div>

      {/* Component content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Component image */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-80 flex items-center justify-center p-8">
            {component.image_url ? (
              <img
                src={component.image_url}
                alt={component.name}
                className="max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_COMPONENT_IMAGE;
                }}
              />
            ) : (
              <img
                src={DEFAULT_COMPONENT_IMAGE}
                alt={component.name}
                className="max-h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Component overview */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
            
            <div className="space-y-4">
              {/* Component key features - specific to component type */}
              {type === 'cpus' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Socket</span>
                    <span className="font-medium">{component.socket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cores / Threads</span>
                    <span className="font-medium">{component.cores} / {component.threads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Clock</span>
                    <span className="font-medium">{component.base_clock} GHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Boost Clock</span>
                    <span className="font-medium">{component.boost_clock} GHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TDP</span>
                    <span className="font-medium">{component.tdp} W</span>
                  </div>
                </>
              )}
              
              {type === 'gpus' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory</span>
                    <span className="font-medium">{component.memory_size} GB {component.memory_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Core Clock</span>
                    <span className="font-medium">{component.core_clock} MHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Boost Clock</span>
                    <span className="font-medium">{component.boost_clock} MHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TDP</span>
                    <span className="font-medium">{component.tdp} W</span>
                  </div>
                </>
              )}
              
              {type === 'motherboards' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Socket</span>
                    <span className="font-medium">{component.socket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chipset</span>
                    <span className="font-medium">{component.chipset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Form Factor</span>
                    <span className="font-medium">{component.form_factor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RAM Slots</span>
                    <span className="font-medium">{component.ram_slots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max RAM</span>
                    <span className="font-medium">{component.max_ram} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wi-Fi</span>
                    <span className="font-medium">{component.has_integrated_wifi ? 'Yes' : 'No'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Component details */}
      {renderComponentDetails()}

      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Catalog
        </button>
        
        <button
          onClick={() => navigate('/builder', { state: { addComponent: { type, component } } })}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to PC Build
        </button>
      </div>
    </div>
  );
};

export default ComponentDetailPage;