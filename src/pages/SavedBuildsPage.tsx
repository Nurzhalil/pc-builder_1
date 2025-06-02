import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Trash2, Edit, ExternalLink, AlertTriangle } from 'lucide-react';

interface Build {
  id: number;
  name: string;
  total_price: number;
  created_at: string;
  components: {
    [key: string]: {
      id: number;
      name: string;
      price: number;
    };
  };
}

const SavedBuildsPage: React.FC = () => {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/builds`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBuilds(response.data);
      } catch (err) {
        setError('Failed to load saved builds');
        console.error('Error fetching builds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, []);

  const handleDelete = async (buildId: number) => {
    if (!confirm('Are you sure you want to delete this build?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/builds/${buildId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBuilds(builds.filter(build => build.id !== buildId));
    } catch (err) {
      console.error('Error deleting build:', err);
      // Show error toast or message
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your saved builds.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
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
        <h1 className="text-3xl font-bold">My Saved Builds</h1>
        <Link
          to="/builder"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Build
        </Link>
      </div>

      {builds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Saved Builds</h3>
          <p className="text-gray-500 mb-4">Start creating your first PC build!</p>
          <Link
            to="/builder"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Build
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
            <div
              key={build.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{build.name}</h2>
                  <div className="flex space-x-2">
                    <Link
                      to={`/builder?build=${build.id}`}
                      className="text-gray-400 hover:text-blue-500"
                      title="Edit build"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(build.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete build"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {Object.entries(build.components).map(([type, component]) => (
                    component && (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                        <span className="text-gray-900">{component.name}</span>
                      </div>
                    )
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${build.total_price.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      to={`/builds/${build.id}`}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Details
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Created on {new Date(build.created_at).toLocaleDateString()}
                  </p>
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