import React from 'react';
import { Link } from 'react-router-dom';
import { Computer, Mail, Github as GitHub } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Computer className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">PC Builder</span>
            </div>
            <p className="text-gray-400 mb-4">
              Build your perfect PC with our component compatibility system.
              Find the right parts, check compatibility, and create your dream setup.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <GitHub className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-white">
                  Components
                </Link>
              </li>
              <li>
                <Link to="/builder" className="text-gray-400 hover:text-white">
                  Build PC
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  PC Building Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Compatibility Explained
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} PC Builder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;