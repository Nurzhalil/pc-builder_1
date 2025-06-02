import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { Users, Package, ShoppingCart, BarChart2 } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalComponents: number;
  totalBuilds: number;
  recentBuilds: Array<{
    id: number;
    name: string;
    user_name: string;
    total_price: string | number;
    created_at: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalComponents: 0,
    totalBuilds: 0,
    recentBuilds: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [usersResponse, buildsResponse] = await Promise.all([
          axios.get(`${API_URL}/admin/users`),
          axios.get(`${API_URL}/admin/builds`)
        ]);

        setStats({
          totalUsers: usersResponse.data.length,
          totalComponents: 0,
          totalBuilds: buildsResponse.data.length,
          recentBuilds: buildsResponse.data.slice(0, 5).map(build => ({
            ...build,
            total_price: typeof build.total_price === 'string' 
              ? parseFloat(build.total_price) 
              : build.total_price
          }))
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const calculateAverageBuildValue = () => {
    if (stats.recentBuilds.length === 0) return 0;
    const total = stats.recentBuilds.reduce((acc, build) => {
      const price = typeof build.total_price === 'string' 
        ? parseFloat(build.total_price) 
        : build.total_price;
      return acc + (price || 0);
    }, 0);
    return (total / stats.recentBuilds.length).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Components</p>
              <p className="text-2xl font-bold">{stats.totalComponents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Builds</p>
              <p className="text-2xl font-bold">{stats.totalBuilds}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Build Value</p>
              <p className="text-2xl font-bold">
                ${calculateAverageBuildValue()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/users"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="font-medium mb-2">Manage Users</h3>
          <p className="text-sm text-gray-600">View and manage user accounts</p>
        </Link>

        <Link
          to="/admin/components"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="font-medium mb-2">Manage Components</h3>
          <p className="text-sm text-gray-600">Add or edit PC components</p>
        </Link>

        <Link
          to="/admin/builds"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="font-medium mb-2">View Builds</h3>
          <p className="text-sm text-gray-600">Monitor user PC builds</p>
        </Link>

        <Link
          to="/admin/settings"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="font-medium mb-2">Settings</h3>
          <p className="text-sm text-gray-600">Configure system settings</p>
        </Link>
      </div>

      {/* Recent Builds */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Builds</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Build Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentBuilds.map((build) => (
                  <tr key={build.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {build.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {build.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${typeof build.total_price === 'string' 
                        ? parseFloat(build.total_price).toFixed(2) 
                        : build.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(build.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;