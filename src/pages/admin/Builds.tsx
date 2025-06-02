import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { Search, Filter, Trash2, ExternalLink } from 'lucide-react';

interface Build {
  id: number;
  name: string;
  user_name: string;
  user_email: string;
  total_price: number;
  created_at: string;
}

const AdminBuilds: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchBuilds = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/builds`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBuilds(response.data);
      } catch (error) {
        console.error('Error fetching builds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [user, navigate]);

  const handleDelete = async (buildId: number) => {
    if (!confirm('Are you sure you want to delete this build?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/builds/${buildId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBuilds(builds.filter(build => build.id !== buildId));
    } catch (error) {
      console.error('Error deleting build:', error);
    }
  };

  const filteredBuilds = builds.filter(build => 
    (build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     build.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     build.user_email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    build.total_price >= priceRange.min &&
    build.total_price <= priceRange.max
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Builds</h1>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search builds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Price</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Price</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Builds Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Build Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuilds.map((build) => (
                <tr key={build.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{build.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{build.user_name}</div>
                    <div className="text-sm text-gray-500">{build.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${build.total_price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(build.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => window.open(`/builds/${build.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(build.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Total Builds</h3>
          <p className="text-3xl font-bold">{builds.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Average Build Value</h3>
          <p className="text-3xl font-bold">
            ${(builds.reduce((acc, build) => acc + build.total_price, 0) / builds.length || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Builds This Month</h3>
          <p className="text-3xl font-bold">
            {builds.filter(build => 
              new Date(build.created_at).getMonth() === new Date().getMonth()
            ).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminBuilds;