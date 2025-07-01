import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePhone = () => {
    if (!formData.phone.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return false;
    }
    return true;
  };

  const validateOTP = () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return false;
    }
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep(2);
      setIsLoading(false);
      alert('OTP sent to your phone number!');
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
    }, 1500);
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep(4);
      setIsLoading(false);
    }, 1500);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Enter Phone Number</h2>
        <p className="text-gray-600 text-sm">We'll send you an OTP to reset your password</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
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
            className={`flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors text-sm ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <button
        onClick={handleSendOTP}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Enter OTP</h2>
        <p className="text-gray-600 text-sm">Enter the 6-digit code sent to +20{formData.phone}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OTP Code
        </label>
        <input
          type="text"
          value={formData.otp}
          onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-center text-xl tracking-widest ${
            errors.otp ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="000000"
          maxLength={6}
        />
        {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
        >
          Back
        </button>
        <button
          onClick={handleVerifyOTP}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>

      <button
        onClick={handleSendOTP}
        className="w-full text-red-600 hover:text-red-700 transition-colors text-sm"
      >
        Didn't receive OTP? Resend
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm">Enter your new password</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
        >
          Back
        </button>
        <button
          onClick={handleResetPassword}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? 'Saving...' : 'Save Password'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
      <p className="text-gray-600 mb-6 text-sm">Your password has been successfully reset. You can now login with your new password.</p>
      
      <button
        onClick={() => navigate('/')}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 text-sm"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img 
              src="/download copy.png" 
              alt="RAFAL" 
              className="h-16 w-auto mx-auto transition-all duration-500 hover:scale-110 hover:rotate-3 transform-gpu"
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
              <div className="text-2xl font-bold text-red-600 animate-bounce">RAFAL</div>
            </div>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors text-sm">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step >= stepNumber 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white scale-110' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-1 transition-all duration-300 ${
                  step > stepNumber ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">Remember your password? </span>
            <Link to="/" className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;