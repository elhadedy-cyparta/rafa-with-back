import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, LogOut, User, FileText, RotateCcw, Shield, Eye, Database, Users, Lock, Mail, Calendar, CheckCircle, AlertTriangle, CreditCard, Clock, Building, Scale, Save, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ActiveSection = 'orders' | 'account' | 'privacy' | 'return' | 'terms';

const MyOrdersPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('orders');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Ahmed',
    phone: user?.phone || '01110545951',
    oldPassword: '',
    newPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set active section based on URL hash or default to orders
  useEffect(() => {
    const hash = location.hash.replace('#', '') as ActiveSection;
    if (['orders', 'account', 'privacy', 'return', 'terms'].includes(hash)) {
      setActiveSection(hash);
    } else {
      setActiveSection('orders');
    }
  }, [location.hash]);

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      status: 'Delivered',
      date: '2024-01-15',
      total: 1600,
      items: 2,
    },
    {
      id: 'ORD-002',
      status: 'In Transit',
      date: '2024-01-20',
      total: 2400,
      items: 1,
    },
  ];

  const sidebarItems = [
    { icon: User, label: 'Account Details', key: 'account' as ActiveSection, active: activeSection === 'account' },
    { icon: Package, label: 'Orders', key: 'orders' as ActiveSection, active: activeSection === 'orders' },
    { icon: Shield, label: 'Privacy Policy', key: 'privacy' as ActiveSection, active: activeSection === 'privacy' },
    { icon: RotateCcw, label: 'Return & Refund Policy', key: 'return' as ActiveSection, active: activeSection === 'return' },
    { icon: FileText, label: 'Terms & Conditions', key: 'terms' as ActiveSection, active: activeSection === 'terms' },
  ];

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    navigate(`/orders#${section}`, { replace: true });
  };

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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const renderOrdersSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {user ? (
        orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No Orders Found</p>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-800">
                        Order #{order.id}
                      </span>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Placed on {order.date}</span>
                      <span className="mx-2">•</span>
                      <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-800">
                      {order.total} EGP
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/order/${order.id}`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <User size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Please log in to view your orders</p>
          <p className="text-gray-500 mb-6">You need to be logged in to access this page.</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      )}
    </div>
  );

  const renderAccountSection = () => {
    if (!user) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8">
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
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Details</h1>
          <p className="text-gray-600">Manage your personal information and security settings</p>
        </div>

        {/* Profile Information */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
          
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
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>

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
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock size={18} />
                <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderPrivacySection = () => {
    const sections = [
      {
        icon: Database,
        title: 'Information We Collect',
        content: [
          {
            subtitle: 'Information You Provide:',
            text: 'Such as your name, email address, phone number, and contact details when creating an account or contacting us.'
          },
          {
            subtitle: 'Automatic Information:',
            text: 'Including IP address, browser type, and operating system when you visit our website.'
          },
          {
            subtitle: 'Cookies:',
            text: 'We use cookies to enhance your experience and understand how you interact with the site.'
          }
        ]
      },
      {
        icon: Eye,
        title: 'How We Use the Information',
        content: [
          { text: 'To operate and maintain our services.' },
          { text: 'To improve and personalize your user experience.' },
          { text: 'To communicate with you for customer support and marketing.' },
          { text: 'To analyze trends and site usage.' }
        ]
      },
      {
        icon: Users,
        title: 'Sharing Information with Third Parties',
        content: [
          {
            text: 'We do not share your personal information with third parties, except in the following cases:'
          },
          { text: 'With service providers who help us operate our website and services.' },
          { text: 'When required by law to disclose information.' }
        ]
      },
      {
        icon: FileText,
        title: 'Your Rights',
        content: [
          { text: 'Right to access your personal data.' },
          { text: 'Right to correct inaccurate information.' },
          { text: 'Right to request deletion of your data.' }
        ]
      },
      {
        icon: Lock,
        title: 'Data Protection',
        content: [
          {
            text: 'We implement reasonable security measures to protect your personal data from unauthorized access or loss.'
          }
        ]
      },
      {
        icon: Calendar,
        title: 'Changes to the Privacy Policy',
        content: [
          {
            text: 'We may update this policy from time to time. Significant changes will be communicated via email or posted on the website.'
          }
        ]
      }
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">How we protect your personal information</p>
        </div>

        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Our Commitment to Privacy</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Rafal is committed to protecting your privacy. This privacy policy outlines how we collect, 
              use, share, and safeguard your personal data during your interaction with our website.
            </p>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">{section.title}</h2>
              
              <div className="space-y-4">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-gray-700 leading-relaxed">
                      {item.subtitle && (
                        <span className="font-semibold text-gray-800">{item.subtitle} </span>
                      )}
                      <span>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-white">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-white text-opacity-90 leading-relaxed mb-6">
                  If you have questions about this policy, feel free to contact our support team.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>19265</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✉</span>
                    <span>support@rafal.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-gray-500">
          <p>Last updated: January 2024</p>
        </div>
      </div>
    );
  };

  const renderReturnSection = () => {
    const sections = [
      {
        icon: FileText,
        title: 'Return Process Requirements',
        content: [
          'Proof of purchase (e.g., order number, invoice).',
          'The return reason must meet the return acceptance conditions.',
          'Provide details like ID if requesting a cash refund.',
          'Contact customer service within 24 hours if the item received is damaged or incomplete.',
          'All items, including free gifts, must be returned for approval.',
          'Inspection will be conducted to ensure no misuse. Refunds are processed within 3–5 days.',
          'If the issue claimed is not found, the refund will be rejected and the product returned.'
        ]
      },
      {
        icon: Package,
        title: 'Return Conditions',
        content: [
          'Products must be returned in original condition and packaging.',
          'If this is not met, the return will be denied.'
        ]
      },
      {
        icon: CreditCard,
        title: 'Refund Policy',
        content: [
          'If you\'re not satisfied, you may request a refund within 30 days—subject to Rafal\'s discretion and Consumer Protection Law.',
          'For exchanges or returns, delivery/return costs are covered by the customer.',
          'Refunds will be returned to the original payment method (card, InstaPay, or Vodafone Cash). Processing may take up to 30 days.'
        ]
      },
      {
        icon: AlertTriangle,
        title: 'Wrong Product Received',
        content: [
          'If you receive an incorrect or defective item, you may return it within 30 days.'
        ]
      },
      {
        icon: Shield,
        title: 'Warranty Terms',
        content: [
          'Warranty does not cover misuse or unauthorized repairs.',
          'Removing the warranty sticker voids the warranty.',
          'Accepting the invoice confirms acceptance of the product condition and warranty terms.'
        ]
      }
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Return & Refund Policy</h1>
          <p className="text-gray-600">Our commitment to your satisfaction</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg text-white">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Contact Customer Service</h3>
              <p className="mb-4">
                For questions about returns and refunds, contact our support team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>19265</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✉</span>
                  <span>support@rafal.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTermsSection = () => {
    const sections = [
      {
        icon: Users,
        title: 'Permitted Use',
        content: [
          'Website usage is for personal purposes only.',
          'Commercial use without permission is prohibited.',
          'Users must not scrape data from the site, use bots or automation, mislead or deceive, upload harmful content, or violate laws or platform integrity.'
        ]
      },
      {
        icon: AlertTriangle,
        title: 'Age Requirements',
        content: [
          'Users must be 18+ or have parental permission if younger.'
        ]
      },
      {
        icon: Shield,
        title: 'Intellectual Property',
        content: [
          'All content is copyrighted. Unauthorized use is strictly forbidden.'
        ]
      },
      {
        icon: CheckCircle,
        title: 'Return Policy',
        content: [
          'Refunds available within 30 days as per the Consumer Protection Law.'
        ]
      },
      {
        icon: Scale,
        title: 'Website Liability',
        content: [
          'Rafal is not responsible for external links or third-party content.'
        ]
      },
      {
        icon: FileText,
        title: 'Agreement to Terms',
        content: [
          'By using the website, users agree to these terms.',
          'Terms may be updated anytime. The latest version takes effect upon publishing.',
          'The website may also change according to product or service updates.'
        ]
      },
      {
        icon: Building,
        title: 'Contact Information',
        content: [
          'For questions or clarifications, contact customer support.',
          'Rafal is owned by New Way Electric Company.'
        ]
      }
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Legal agreement for using our services</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
                <div className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg text-white">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Contact Information</h3>
              <p className="mb-4">
                For questions about these terms, contact our support team.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>19265</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✉</span>
                  <span>support@rafal.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Cairo, Egypt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🏭</span>
                  <span>New Way Electric Company</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return renderOrdersSection();
      case 'account':
        return renderAccountSection();
      case 'privacy':
        return renderPrivacySection();
      case 'return':
        return renderReturnSection();
      case 'terms':
        return renderTermsSection();
      default:
        return renderOrdersSection();
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'orders':
        return 'Orders';
      case 'account':
        return 'Account Details';
      case 'privacy':
        return 'Privacy Policy';
      case 'return':
        return 'Return & Refund Policy';
      case 'terms':
        return 'Terms & Conditions';
      default:
        return 'Orders';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">{getSectionTitle()}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSectionChange(item.key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                    item.active
                      ? 'bg-red-50 text-red-600 border-r-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {item.active && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
              
              <button
                onClick={handleLogout}
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
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;