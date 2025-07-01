import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { CategoryService, Category } from '../services/categoryApi';
import { useLanguage } from '../context/LanguageContext';

const CategorySlider = () => {
  const { t, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  // Test API connection
  const testConnection = async () => {
    const result = await CategoryService.testConnection();
    setConnectionStatus(result.success ? 'connected' : 'disconnected');
    
    if (!result.success) {
      console.warn('🔴 RAFAL Category API connection test failed:', result.message);
    } else {
      console.log('🟢 RAFAL Category API connection test successful');
    }
    
    return result;
  };

  // Fetch categories from RAFAL API
  const fetchCategories = async (refresh = false) => {
    try {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      // Test connection first if this is a refresh
      if (refresh) {
        await testConnection();
      }

      const fetchedCategories = refresh ? await CategoryService.refreshCache() : await CategoryService.getAllCategories();
      
      if (fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
        setCurrentSlide(0);
        setConnectionStatus('connected');
        console.log(`✅ Successfully loaded ${fetchedCategories.length} RAFAL categories`);
      } else {
        console.warn('⚠️ No categories received from RAFAL API');
        setError('No categories available');
        setCategories([]);
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('❌ Failed to fetch RAFAL categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setConnectionStatus('disconnected');
      setCategories([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (categories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(categories.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, [categories.length]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!CategoryService.isCacheValid()) {
        console.log('🔄 Category cache expired, refreshing RAFAL categories...');
        fetchCategories(true);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(categories.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(categories.length / 3)) % Math.ceil(categories.length / 3));
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered for RAFAL categories');
    await fetchCategories(true);
  };

  // Get fallback image for wall or cat image
  const getFallbackImage = (type: 'wall' | 'cat') => {
    const fallbackImages = {
      wall: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
      cat: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400'
    };
    return fallbackImages[type];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('category.title')}</h2>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
        
        <div className="relative h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden animate-pulse">
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
    );
  }

  // Error state
  if (error && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('category.title')}</h2>
        </div>
        
        <div className="relative h-40 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl overflow-hidden border-2 border-red-200">
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
                <p className="text-red-700 font-semibold mb-2">RAFAL Category Service Unavailable</p>
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
                  API Endpoint: https://apirafal.cyparta.com/category/
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No categories available - don't render anything
  if (categories.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(categories.length / 3);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{t('category.title')}</h2>
          <div className="flex items-center space-x-4 mt-2">
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
                {connectionStatus === 'connected' ? t('category.liveFrom') : 
                 connectionStatus === 'disconnected' ? t('status.offline') : t('status.connecting')}
              </span>
            </div>
            <span className="text-gray-600 text-sm">{categories.length} {t('category.categories')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
            title={t('category.refresh')}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.slice(slideIndex * 3, slideIndex * 3 + 3).map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group relative h-48 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Wall Image Background */}
                    <div className="absolute inset-0">
                      <img
                        src={category.wall_image || category.image || getFallbackImage('wall')}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.warn('⚠️ RAFAL Category wall image failed to load:', category.wall_image);
                          target.src = getFallbackImage('wall');
                        }}
                      />
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>

                    {/* Category Image (Floating above wall) - Made Much Bigger */}
                    {(category.cat_image || category.image) && (
                      <div className="absolute top-4 right-4 w-32 h-32 rounded-full overflow-hidden border-4 border-white/90 shadow-xl group-hover:scale-110 transition-all duration-300 bg-white/10 backdrop-blur-sm">
                        <img
                          src={category.cat_image || category.image || getFallbackImage('cat')}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.warn('⚠️ RAFAL Category cat image failed to load:', category.cat_image);
                            target.src = getFallbackImage('cat');
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* RAFAL Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      RAFAL
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-red-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

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
  );
};

export default CategorySlider;