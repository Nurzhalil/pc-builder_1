import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Save, AlertTriangle } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/profile' } });
    }
  }, [user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                Please log in to view your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">
                      This feature will be available soon
                    </p>
                  </div>
                </div>
                
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                </div>
                
                {/* Account Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Role: <span className="font-medium">{user.role}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Member since: <span className="font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            email: user.email
                          });
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="text-base font-medium text-red-800">Delete Account</h3>
            <p className="mt-1 text-sm text-red-600">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;