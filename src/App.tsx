import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import BuyNowPage from './pages/BuyNowPage';
import MyOrdersPage from './pages/MyOrdersPage';
import FavoritesPage from './pages/FavoritesPage';
import ComparisonPage from './pages/ComparisonPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AllProductsPage from './pages/AllProductsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import WhatsAppWidget from './components/WhatsAppWidget';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Initialize session key on app load
  useEffect(() => {
    // Check if session key exists in localStorage
    const sessionKey = localStorage.getItem('rafal_cart_session_key');
    
    // If no session key exists, generate one
    if (!sessionKey) {
      const newSessionKey = generateSessionKey();
      localStorage.setItem('rafal_cart_session_key', newSessionKey);
      console.log('🔑 Generated new cart session key on app initialization:', newSessionKey);
    } else {
      console.log('🔑 Found existing cart session key on app initialization:', sessionKey);
    }
  }, []);

  // Generate a session key
  const generateSessionKey = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <TopBar />
              <Header 
                onLoginClick={() => setIsLoginOpen(true)}
              />
              
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryId" element={<ProductListingPage />} />
                <Route path="/product/:productId" element={<ProductDetailsPage />} />
                <Route path="/buy-now/:productId" element={<BuyNowPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/account" element={<AccountDetailsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/return-policy" element={<ReturnPolicyPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Routes>

              <Footer />

              <LoginModal 
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSignupClick={() => {
                  setIsLoginOpen(false);
                  setIsSignupOpen(true);
                }}
              />

              <SignupModal 
                isOpen={isSignupOpen}
                onClose={() => setIsSignupOpen(false)}
                onLoginClick={() => {
                  setIsSignupOpen(false);
                  setIsLoginOpen(true);
                }}
              />

              {/* WhatsApp Widget - Available on all pages */}
              <WhatsAppWidget />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;