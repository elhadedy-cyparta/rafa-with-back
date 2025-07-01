import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthService } from '../services/authApi';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onLoginClick }) => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setErrorMessage('');
    
    // Validation
    if (!formData.username || !formData.phone || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (!agreeToTerms) {
      setErrorMessage('Please agree to the terms and conditions');
      return;
    }
    
    // Format phone number - remove leading zeros and spaces
    const formattedPhone = formData.phone.replace(/\s+/g, '').replace(/^0+/, '');
    
    setIsSubmitting(true);
    
    try {
      // Call the registration API
      const result = await AuthService.register({
        username: formData.username,
        phone: formattedPhone,
        password: formData.password
      });
      
      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('signup.title')}</h2>
            <p className="text-gray-500 text-sm">{t('signup.welcome')}</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.username')}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm ${
                  isRTL ? 'text-right' : ''
                }`}
                placeholder={t('signup.username')}
                dir={isRTL ? 'rtl' : 'ltr'}
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.phoneNumber')}
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-sm">🇪🇬 +20</span>
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm ${
                    isRTL ? 'text-right' : ''
                  }`}
                  placeholder={t('signup.phoneNumber')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 transition-colors text-sm ${
                    isRTL ? 'text-right' : ''
                  }`}
                  placeholder={t('signup.password')}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 transition-colors text-sm ${
                    isRTL ? 'text-right' : ''
                  }`}
                  placeholder={t('signup.confirmPassword')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors ${
                    isRTL ? 'left-4' : 'right-4'
                  }`}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 mt-1 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                disabled={isSubmitting}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('signup.agreeTerms')}
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting || !agreeToTerms}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm flex items-center justify-center ${
                agreeToTerms && !isSubmitting
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                t('signup.signupButton')
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">{t('signup.haveAccount')} </span>
            <button
              onClick={onLoginClick}
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors text-sm"
              disabled={isSubmitting}
            >
              {t('signup.login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;