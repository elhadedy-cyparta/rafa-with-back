import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, Save, LogOut, Package, FileText, RotateCcw, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AccountDetailsPage = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Ahmed',
    phone: user?.phone || '01110545951',
    oldPassword: '',
    newPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sidebarItems = [
    { icon: User, label: 'Account Details', href: '/account', active: true },
    { icon: Package, label: 'Orders', href: '/orders', active: false },
    { icon: Shield, label: 'Privacy Policy', href: '/privacy-policy', active: false },
    { icon: RotateCcw, label: 'Return & Refund Policy', href: '/return-policy', active: false },
    { icon: FileText, label: 'Terms & Conditions', href: '/terms', active: false },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.oldPassword || !formData.newPassword) {
      alert('Please fill in both password fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Password changed successfully!');
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      alert('Profile updated successfully!');
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Please log in to view your account</p>
          <p className="text-gray-500 mb-6">You need to be logged in to access this page.</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">Account Details</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-red-50 text-red-600 border-r-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Account Details</h1>
                <p className="text-gray-600">Manage your personal information and security settings</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <User size={20} className="text-red-600" />
                <span>Profile Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      <span className="text-sm flex items-center space-x-1">
                        <span>🇪🇬</span>
                        <span>+20</span>
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <Lock size={20} className="text-red-600" />
                <span>Change Password</span>
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Old Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={formData.oldPassword}
                        onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock size={18} />
                    <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsPage;