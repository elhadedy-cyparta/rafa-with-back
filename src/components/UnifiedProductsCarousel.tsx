import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, RefreshCw, AlertCircle, Wifi, WifiOff, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts, getFeaturedProducts } from '../data/products';
import { Product } from '../types/Product';
import { useLanguage } from '../context/LanguageContext';

const UnifiedProductsCarousel = () => {
  const { t, isRTL } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers'>('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const { addToCart, isLoading: isCartLoading } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Load products from RAFAL API
  const loadProducts = async (refresh = false) => {
    try {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      console.log('🔄 Loading products from RAFAL API...');
      
      // Get all products and featured products
      const [allProducts, featured] = await Promise.all([
        getProducts(),
        getFeaturedProducts()
      ]);

      if (allProducts.length > 0) {
        // Filter best sellers from all products
        const bestSellers = allProducts.filter(product => product.isBestSeller);
        
        setFeaturedProducts(featured);
        setBestSellerProducts(bestSellers);
        setConnectionStatus('connected');
        
        console.log(`✅ Successfully loaded ${featured.length} featured and ${bestSellers.length} best seller products`);
      } else {
        console.warn('⚠️ No products received from RAFAL API');
        setError('No products available');
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('❌ Failed to load RAFAL products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const currentProducts = activeTab === 'featured' ? featuredProducts : bestSellerProducts;
  const productsPerSlide = 4;
  const totalSlides = Math.ceil(currentProducts.length / productsPerSlide);

  // Auto-scroll functionality
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleTabChange = (tab: 'featured' | 'bestsellers') => {
    setActiveTab(tab);
    setCurrentSlide(0);
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setAddingToCart(product.id);
      await addToCart(product);
      // Success notification could be added here
      setTimeout(() => {
        setAddingToCart(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // Error notification could be added here
      setAddingToCart(null);
    }
  };

  const handleFavoriteToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/buy-now/${product.id}`;
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered for RAFAL products');
    await loadProducts(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="featured-products" className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('products.title')}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              {t('common.loading')}
            </p>
          </div>

          <div className="relative h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">{t('common.loading')}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Wifi size={16} />
                  <span>{t('status.connecting')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && currentProducts.length === 0) {
    return (
      <section id="featured-products" className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('products.title')}</h2>
          </div>

          <div className="relative h-96 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl overflow-hidden border-2 border-red-200">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center space-y-4 max-w-md">
                <div className="flex items-center justify-center space-x-2">
                  {connectionStatus === 'disconnected' ? (
                    <WifiOff size={48} className="text-red-500" />
                  ) : (
                    <AlertCircle size={48} className="text-red-500" />
                  )}
                </div>
                
                <div>
                  <p className="text-red-700 font-semibold mb-2">RAFAL Products Service Unavailable</p>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>{isRefreshing ? t('common.loading') : t('common.retry')}</span>
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    API Endpoint: https://apirafal.cyparta.com/products/
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="bg-gradient-to-br from-gray-50 to-white py-16 animate-fade-in-up">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-slide-in-top">{t('products.title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8 animate-slide-in-top animation-delay-200">
            {t('products.subtitle')}
          </p>

          {/* Connection Status & Stats */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connectionStatus === 'disconnected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {connectionStatus === 'connected' ? (
                <Wifi size={12} />
              ) : connectionStatus === 'disconnected' ? (
                <WifiOff size={12} />
              ) : (
                <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {connectionStatus === 'connected' ? t('status.connected') : 
                 connectionStatus === 'disconnected' ? t('status.offline') : t('status.connecting')}
              </span>
            </div>
            
            <span className="text-gray-600 text-sm">
              {featuredProducts.length} {t('products.featured')} • {bestSellerProducts.length} {t('products.bestsellers')}
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
              title={t('common.refresh')}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 animate-slide-in-top animation-delay-400">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <button
                onClick={() => handleTabChange('featured')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'featured'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-red-600 hover:scale-105'
                }`}
              >
                {t('products.featured')} ({featuredProducts.length})
              </button>
              <button
                onClick={() => handleTabChange('bestsellers')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === 'bestsellers'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-red-600 hover:scale-105'
                }`}
              >
                {t('products.bestsellers')} ({bestSellerProducts.length})
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative animate-scale-in animation-delay-600">
          {/* Products Carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {currentProducts
                      .slice(slideIndex * productsPerSlide, slideIndex * productsPerSlide + productsPerSlide)
                      .map((product, index) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="group block stagger-item"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden border border-gray-100 hover:border-red-200">
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.warn('⚠️ RAFAL Product image failed to load:', product.image);
                                  target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                              
                              {/* Labels */}
                              <div className="absolute top-3 left-3 space-y-2">
                                {product.isOffer && (
                                  <span className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg animate-pulse">
                                    {t('label.offer')}
                                  </span>
                                )}
                                {product.isBestSeller && (
                                  <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg animate-gentle-bounce">
                                    {t('label.bestSeller')}
                                  </span>
                                )}
                              </div>

                              {/* RAFAL Badge */}
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                RAFAL
                              </div>

                              {/* Favorite Button */}
                              <button
                                onClick={(e) => handleFavoriteToggle(product.id, e)}
                                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
                                  favorites.includes(product.id)
                                    ? 'bg-red-600 text-white scale-110 animate-pulse'
                                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                <Heart size={18} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
                              </button>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                  <button
                                    onClick={(e) => handleBuyNow(product, e)}
                                    className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:bg-red-600 hover:text-white"
                                  >
                                    {t('products.quickBuy')}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                              <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
                                {product.name}
                              </h3>

                              {/* Rating */}
                              <div className="flex items-center space-x-1 mb-3">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={`transition-all duration-300 ${
                                        i < Math.floor(product.rating)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  ({product.reviews === 0 ? t('product.new') : product.reviews})
                                </span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center space-x-2 mb-4">
                                <span className="text-2xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
                                  {product.price} EGP
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {product.originalPrice} EGP
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={(e) => handleAddToCart(product, e)}
                                  disabled={isCartLoading || addingToCart === product.id}
                                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-70"
                                >
                                  {isCartLoading || addingToCart === product.id ? (
                                    <Loader size={18} className="animate-spin" />
                                  ) : (
                                    <ShoppingCart size={18} />
                                  )}
                                  <span>
                                    {isCartLoading || addingToCart === product.id 
                                      ? t('common.loading') 
                                      : t('product.addToCart')
                                    }
                                  </span>
                                </button>
                                <button
                                  onClick={(e) => handleBuyNow(product, e)}
                                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  {t('product.buyNow')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:scale-110 hover:-translate-x-8"
              >
                <ChevronLeft size={24} className="text-gray-600" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white shadow-xl rounded-full p-4 hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:scale-110 hover:translate-x-8"
              >
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-3">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 hover:scale-125 ${
                  index === currentSlide
                    ? 'w-8 h-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full scale-125'
                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12 animate-fade-in-up animation-delay-1000">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-red-200"
          >
            <span>{t('products.viewAll')}</span>
            <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Overlay for Refresh */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-3">
              <RefreshCw size={20} className="animate-spin text-red-600" />
              <span className="text-gray-700 font-medium">{t('common.refresh')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UnifiedProductsCarousel;