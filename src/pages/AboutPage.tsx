import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool as Tool, Shield, Users, Cpu } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About PC Builder</h1>
        
        <div className="prose prose-lg text-gray-600 mb-12">
          <p>
            PC Builder is your trusted companion in creating the perfect custom PC. 
            Our platform combines intelligent component compatibility checking with 
            an extensive database of PC parts to ensure you build a system that 
            meets your needs perfectly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Tool className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-gray-600">
              To simplify the PC building process and make custom PC creation 
              accessible to everyone, from first-time builders to seasoned enthusiasts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Our Promise</h2>
            </div>
            <p className="text-gray-600">
              We guarantee component compatibility and provide detailed information 
              to help you make informed decisions about your PC build.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Cpu className="h-6 w-6 text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Smart Compatibility</h3>
                <p className="text-gray-600">
                  Our system automatically checks component compatibility to prevent 
                  incompatible combinations.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-6 w-6 text-blue-600 mt-1 mr-4" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Join a community of PC enthusiasts and share your builds with others.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build?</h2>
          <p className="text-gray-600 mb-6">
            Start creating your custom PC today with our easy-to-use builder.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Building
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;