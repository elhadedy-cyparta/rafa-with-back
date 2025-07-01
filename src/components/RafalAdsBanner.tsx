import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { AdsService, AdBanner } from '../services/adsApi';

interface RafalAdsBannerProps {
  className?: string;
  autoSlide?: boolean;
  slideInterval?: number;
  showControls?: boolean;
  showRefreshButton?: boolean;
}

const RafalAdsBanner: React.FC<RafalAdsBannerProps> = ({
  className = '',
  autoSlide = true,
  slideInterval = 5000,
  showControls = true,
  showRefreshButton = false
}) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  // Test API connection
  const testConnection = async () => {
    const result = await AdsService.testConnection();
    setConnectionStatus(result.success ? 'connected' : 'disconnected');
    
    if (!result.success) {
      console.warn('🔴 RAFAL API connection test failed:', result.message);
    } else {
      console.log('🟢 RAFAL API connection test successful');
    }
    
    return result;
  };

  // Fetch banners from RAFAL API
  const fetchBanners = async (refresh = false) => {
    try {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      // Test connection first if this is a refresh
      if (refresh) {
        await testConnection();
      }

      const ads = refresh ? await AdsService.refreshCache() : await AdsService.getAllBanners();
      
      if (ads.length > 0) {
        setBanners(ads);
        setCurrentSlide(0);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        console.log(`✅ Successfully loaded ${ads.length} RAFAL advertisement banners`);
      } else {
        console.warn('⚠️ No advertisements received from RAFAL API');
        setError('No active advertisements available');
        setBanners([]);
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('❌ Failed to fetch RAFAL advertisement banners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advertisements');
      setConnectionStatus('disconnected');
      setBanners([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, banners.length, slideInterval]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!AdsService.isCacheValid()) {
        console.log('🔄 Cache expired, refreshing RAFAL advertisements...');
        fetchBanners(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleBannerClick = (banner: AdBanner) => {
    if (banner.link) {
      // Track click if needed
      console.log('🖱️ RAFAL Banner clicked:', banner.title, 'Link:', banner.link);
      
      // Open link in new tab for external links
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } else {
        // Internal link
        window.location.href = banner.link;
      }
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered for RAFAL ads');
    await fetchBanners(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative h-64 md:h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading RAFAL advertisements...</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Wifi size={16} />
              <span>Connecting to RAFAL API...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && banners.length === 0) {
    return (
      <div className={`relative h-64 md:h-80 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl overflow-hidden border-2 border-red-200 ${className}`}>
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
              <p className="text-red-700 font-semibold mb-2">RAFAL Advertisement Service Unavailable</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Retrying...' : 'Retry'}</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                API Endpoint: https://apirafal.cyparta.com/Ads/
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No banners available - don't render anything
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentSlide];

  return (
    <div className={`relative h-64 md:h-80 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group ${className}`}>
      {/* Banner Image/Content */}
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              banner.link ? 'cursor-pointer' : ''
            } ${
              index === currentSlide 
                ? 'opacity-100 transform translate-x-0 scale-100' 
                : index < currentSlide 
                  ? 'opacity-0 transform -translate-x-full scale-95'
                  : 'opacity-0 transform translate-x-full scale-95'
            }`}
            onClick={() => handleBannerClick(banner)}
          >
            {/* Background Image using image_ad field */}
            <div className="relative h-full">
              <img
                src={banner.image_ad}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn('⚠️ RAFAL Banner image failed to load:', banner.image_ad);
                  target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1200';
                }}
                onLoad={() => {
                  console.log('✅ RAFAL Banner image loaded successfully:', banner.image_ad);
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
              
              {/* Content Overlay */}
              {(banner.title || banner.description) && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                  <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl">
                    {banner.title && (
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-white/90 text-lg md:text-xl drop-shadow-md mb-4">
                        {banner.description}
                      </p>
                    )}
                    {banner.link && (
                      <div className="flex items-center justify-center space-x-2 text-white/80">
                        <ExternalLink size={16} />
                        <span className="text-sm">Click to learn more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status Indicator */}
      <div className={`absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
        connectionStatus === 'connected' 
          ? 'bg-green-500/80 text-white' 
          : connectionStatus === 'disconnected'
          ? 'bg-red-500/80 text-white'
          : 'bg-gray-500/80 text-white'
      }`}>
        {connectionStatus === 'connected' ? (
          <Wifi size={12} />
        ) : connectionStatus === 'disconnected' ? (
          <WifiOff size={12} />
        ) : (
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        )}
        <span>
          {connectionStatus === 'connected' ? 'Live' : 
           connectionStatus === 'disconnected' ? 'Offline' : 'Connecting'}
        </span>
      </div>

      {/* Navigation Arrows */}
      {showControls && banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 hover:-translate-x-1 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 hover:translate-x-1 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 hover:scale-125 ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-white rounded-full scale-125 animate-pulse' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full hover:scale-110'
              }`}
            />
          ))}
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Refresh Button */}
        {(showRefreshButton || connectionStatus === 'disconnected') && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 disabled:opacity-50"
            title="Refresh RAFAL Advertisements"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Loading Overlay for Refresh */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-3">
            <RefreshCw size={20} className="animate-spin text-red-600" />
            <span className="text-gray-700 font-medium">Refreshing RAFAL advertisements...</span>
          </div>
        </div>
      )}

      {/* Banner Info */}
      {currentBanner && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          ID: {currentBanner.id} • Priority: {currentBanner.priority}
        </div>
      )}
    </div>
  );
};

export default RafalAdsBanner;