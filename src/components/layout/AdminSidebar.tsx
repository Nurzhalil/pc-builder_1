import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users className="h-5 w-5" />, label: 'Users' },
    { path: '/admin/components', icon: <Package className="h-5 w-5" />, label: 'Components' },
    { path: '/admin/builds', icon: <ShoppingCart className="h-5 w-5" />, label: 'Builds' },
    { path: '/admin/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              (location.pathname === item.path || 
               (item.path === '/admin' && location.pathname === '/admin/')) 
                ? 'bg-blue-50 text-blue-600' 
                : ''
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
            <ChevronRight className={`ml-auto h-4 w-4 ${
              (location.pathname === item.path ||
               (item.path === '/admin' && location.pathname === '/admin/'))
                ? 'text-blue-600'
                : 'text-gray-400'
            }`} />
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;