import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Trash2, Edit, ExternalLink, AlertTriangle, Package, Calendar, DollarSign } from 'lucide-react';
import Cookies from 'js-cookie';

interface Component {
  id: number;
  name: string;
  price: number;
  type: string;
}

interface Build {
  id: number;
  name: string;
  total_price: number;
  created_at: string;
  components: Component[];
}

const SavedBuildsPage: React.FC = () => {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_URL}/builds`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Ensure prices are numbers and handle potential null/undefined values
        const processedBuilds = response.data.map((build: any) => ({
          ...build,
          total_price: Number(build.total_price) || 0,
          components: Array.isArray(build.components) ? build.components.map((comp: any) => ({
            ...comp,
            price: Number(comp.price) || 0,
            type: comp.type || 'unknown'
          })) : []
        }));
        
        setBuilds(processedBuilds);
      } catch (err: any) {
        console.error('Error fetching builds:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load saved builds');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBuilds();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (buildId: number) => {
    if (!confirm('Are you sure you want to delete this build?')) {
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_URL}/builds/${buildId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setBuilds(builds.filter(build => build.id !== buildId));
    } catch (err: any) {
      console.error('Error deleting build:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete build');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="tech-panel text-center">
          <h2 className="text-2xl font-bold mb-4 tech-gradient-text">Please Log In</h2>
          <p className="text-gray-300 mb-4">You need to be logged in to view your saved builds.</p>
          <Link
            to="/login"
            className="tech-button"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="tech-panel border-red-500/30">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-200">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tech-gradient-text">My Saved Builds</h1>
        <Link
          to="/builder"
          className="tech-button"
        >
          Create New Build
        </Link>
      </div>

      {builds.length === 0 ? (
        <div className="tech-panel text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-blue-500/50" />
          <h3 className="text-xl font-medium text-gray-100 mb-2">No Saved Builds</h3>
          <p className="text-gray-400 mb-4">Start creating your first PC build!</p>
          <Link
            to="/builder"
            className="tech-button inline-flex items-center"
          >
            Create Build
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
            <div
              key={build.id}
              className="tech-card hover:scale-[1.02] transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-100">{build.name}</h2>
                  <div className="flex space-x-2">
                    <Link
                      to={`/builder?build=${build.id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit build"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(build.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete build"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {build.components.map((component) => (
                    <div key={`${component.type}-${component.id}`} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 capitalize">{component.type.replace('_', ' ')}</span>
                      <span className="text-gray-200">{component.name}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="tech-panel">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-400 text-sm">Total Price</span>
                      </div>
                      <p className="text-lg font-bold text-green-400 mt-1">
                        ${build.total_price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="tech-panel">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-gray-400 text-sm">Created</span>
                      </div>
                      <p className="text-sm text-blue-400 mt-1">
                        {new Date(build.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/builds/${build.id}`}
                    className="tech-button-secondary w-full flex justify-center items-center"
                  >
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBuildsPage;