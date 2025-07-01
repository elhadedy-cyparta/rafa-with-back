import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignupClick }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setErrorMessage('');
    
    // Simple validation
    if (!phone || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    // Format phone number - remove leading zeros and spaces
    const formattedPhone = phone.replace(/\s+/g, '').replace(/^0+/, '');
    
    setIsSubmitting(true);
    
    try {
      // Call the login API
      const result = await login({ 
        phone: formattedPhone, 
        password 
      });
      
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative animate-in slide-in-from-bottom-4 duration-300 shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="text-center pt-8 pb-4">
          <img 
            src="/download copy.png" 
            alt="RAFAL" 
            className="h-12 w-auto mx-auto transition-all duration-500 hover:scale-110"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(220, 38, 38, 0.3))',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          />
          <div className="hidden">
            <div className="text-2xl font-bold text-red-600">RAFAL</div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('login.title')}</h2>
            <p className="text-gray-500 text-sm">{t('login.welcome')}</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.phoneNumber')}
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-sm">🇪🇬 +20</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm ${
                    isRTL ? 'text-right' : ''
                  }`}
                  placeholder={t('login.phoneNumber')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 transition-colors text-sm ${
                    isRTL ? 'text-right' : ''
                  }`}
                  placeholder={t('login.password')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors ${
                    isRTL ? 'left-4' : 'right-4'
                  }`}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-red-600">{t('login.rememberMe')}</span>
              </label>
              <Link 
                to="/forgot-password" 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">{t('login.newHere')} </span>
            <button
              onClick={onSignupClick}
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors text-sm"
              disabled={isSubmitting}
            >
              {t('login.signUp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;