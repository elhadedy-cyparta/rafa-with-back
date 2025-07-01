import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingCart, User, Menu, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CartModal from './CartModal';
import LanguageToggle from './LanguageToggle';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderProps {
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { cartItems, refreshCart } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Update document title with cart count
  useEffect(() => {
    if (cartItemCount > 0) {
      document.title = `RAFAL (${cartItemCount}) - Electrical Appliances`;
    } else {
      document.title = 'RAFAL E-commerce Website';
    }
  }, [cartItemCount]);

  // Refresh cart when component mounts
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleCartClick = () => {
    // Refresh cart before opening modal
    refreshCart();
    setIsCartModalOpen(true);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo with Professional Animations */}
          <Link to="/" className="flex-shrink-0 group logo-container">
            <img 
              src="/download.png" 
              alt="RAFAL" 
              className="h-20 w-auto transition-all duration-1000 ease-out group-hover:scale-110 group-hover:rotate-2 transform-gpu logo-enhanced hover:animate-none filter drop-shadow-2xl group-hover:drop-shadow-[0_10px_30px_rgba(220,38,38,0.6)]"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(220, 38, 38, 0.5)) drop-shadow(0 0 25px rgba(220, 38, 38, 0.3))',
                background: 'transparent',
                animation: 'logoEnhanced 6s ease-in-out infinite'
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
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent animate-pulse">RAFAL</div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder={t('header.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md focus:shadow-lg ${
                  isRTL ? 'pr-12 text-right' : 'pl-12'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Search 
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-hover:text-red-500 group-hover:scale-110 ${
                  isRTL ? 'right-4' : 'left-4'
                }`} 
                size={20} 
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/favorites" className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group">
              <Heart size={24} className="group-hover:animate-pulse" />
              <span className="text-xs mt-1 transition-all duration-300">{t('header.wishlist')}</span>
            </Link>

            <Link to="/compare" className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group">
              <RotateCcw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xs mt-1 transition-all duration-300">{t('header.compare')}</span>
            </Link>

            <button
              onClick={handleCartClick}
              className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 relative group"
            >
              <div className="relative">
                <ShoppingCart size={24} className="group-hover:animate-bounce" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse group-hover:animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 transition-all duration-300">{t('header.cart')}</span>
            </button>

            {isAuthenticated ? (
              <UserProfileDropdown onLogout={logout} />
            ) : (
              <button
                onClick={onLoginClick}
                className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group"
              >
                <User size={24} className="group-hover:animate-pulse" />
                <span className="text-xs mt-1 transition-all duration-300">{t('header.login')}</span>
              </button>
            )}

            <Link
              to="/orders"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-200"
            >
              {t('header.orders')}
            </Link>

            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative group">
            <input
              type="text"
              placeholder={t('header.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 focus:shadow-lg ${
                isRTL ? 'pr-12 text-right' : 'pl-12'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Search 
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-300 group-hover:text-red-500 ${
                isRTL ? 'right-4' : 'left-4'
              }`} 
              size={20} 
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/favorites" className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105">
                <Heart size={20} />
                <span>{t('header.wishlist')}</span>
              </Link>
              <Link to="/compare" className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105">
                <RotateCcw size={20} />
                <span>{t('header.compare')}</span>
              </Link>
              <button
                onClick={handleCartClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span>{t('header.cart')}</span>
              </button>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  <User size={20} />
                  <span>{t('account.logout')}</span>
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105"
                >
                  <User size={20} />
                  <span>{t('header.login')}</span>
                </button>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Link
                to="/orders"
                className="block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black px-4 py-2 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-105"
              >
                {t('header.orders')}
              </Link>
              <div className="flex justify-center">
                <LanguageToggle />
              </div>
              
              {/* User Info (Mobile) */}
              {isAuthenticated && user && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Link
                      to="/account"
                      className="text-center text-sm py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {t('account.title')}
                    </Link>
                    <Link
                      to="/orders"
                      className="text-center text-sm py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {t('orders.title')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </header>
  );
};

export default Header;