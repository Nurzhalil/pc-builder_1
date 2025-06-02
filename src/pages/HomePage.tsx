import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Settings, Shield, Zap } from 'lucide-react';
import { BUILD_PURPOSES } from '../config';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Build Your Perfect PC
              </h1>
              <p className="text-xl mb-6">
                Our intelligent compatibility system ensures all your components work together seamlessly.
                Create your dream PC with confidence.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/builder"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-100"
                >
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-600"
                >
                  Browse Components
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="PC Building" 
                className="rounded-lg shadow-xl" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Build your PC in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Cpu className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">1. Choose Components</h3>
              <p className="text-center text-gray-500">
                Browse our extensive catalog of PC parts from leading manufacturers.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">2. Check Compatibility</h3>
              <p className="text-center text-gray-500">
                Our system automatically verifies that all your selected components work together.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">3. Build Your PC</h3>
              <p className="text-center text-gray-500">
                Save your build, get a parts list, and assemble your perfect PC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Build purpose section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What's Your Build For?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Let us suggest the perfect components based on your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUILD_PURPOSES.map((purpose) => (
              <Link 
                key={purpose.id}
                to={`/builder?purpose=${purpose.id}`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{purpose.name}</h3>
                    <p className="text-gray-600 mb-4">{purpose.description}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      Build Now
                      <ArrowRight className="ml-2 h-5 w-5 transform transition duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose PC Builder?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Guaranteed Compatibility</h3>
                <p className="mt-2 text-gray-600">
                  Our advanced compatibility system ensures every component in your build works together perfectly, eliminating costly mistakes.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Cpu className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Extensive Component Database</h3>
                <p className="mt-2 text-gray-600">
                  Choose from thousands of parts across all major manufacturers, with detailed specifications and pricing information.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Settings className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Smart Build Suggestions</h3>
                <p className="mt-2 text-gray-600">
                  Our system can recommend optimized builds based on your budget and usage requirements, taking the guesswork out of PC building.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Save & Share Your Builds</h3>
                <p className="mt-2 text-gray-600">
                  Create and save multiple PC configurations for different uses, and easily share them with friends or the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
            Ready to build your dream PC?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Start building your custom PC today with our intelligent component selection system.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;