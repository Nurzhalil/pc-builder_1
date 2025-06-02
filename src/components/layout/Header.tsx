import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Settings, ChevronDown, Monitor, Cpu, Computer } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <Computer className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
                <span className="text-xl font-bold tech-gradient-text">PC Builder</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 border-b-2 border-transparent hover:text-blue-400 hover:border-blue-400 transition-colors duration-200">
                Home
              </Link>
              <Link to="/catalog" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 border-b-2 border-transparent hover:text-blue-400 hover:border-blue-400 transition-colors duration-200">
                Components
              </Link>
              <Link to="/builder" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 border-b-2 border-transparent hover:text-blue-400 hover:border-blue-400 transition-colors duration-200">
                Build PC
              </Link>
              <Link to="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 border-b-2 border-transparent hover:text-blue-400 hover:border-blue-400 transition-colors duration-200">
                About
              </Link>
            </nav>
          </div>

          {/* User navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center max-w-xs text-sm rounded-full text-gray-300 hover:text-blue-400 focus:outline-none transition-colors duration-200"
                  >
                    <span className="mr-2">{user.name}</span>
                    <User className="h-6 w-6" />
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-gray-800 border border-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200" onClick={() => setProfileMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link to="/saved-builds" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200" onClick={() => setProfileMenuOpen(false)}>
                      Saved Builds
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200" onClick={() => setProfileMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="tech-button-secondary">
                  Sign in
                </Link>
                <Link to="/register" className="tech-button">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-blue-400 hover:bg-gray-700 focus:outline-none transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/catalog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
              Components
            </Link>
            <Link to="/builder" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
              Build PC
            </Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <User className="h-10 w-10 text-gray-300" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-300">{user.name}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/saved-builds" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                    Saved Builds
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 space-y-2">
                <Link to="/login" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;