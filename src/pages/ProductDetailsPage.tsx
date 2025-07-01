import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Palette,
  Loader
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductById, getProductsByCategory } from '../data/products';
import { Product } from '../types/Product';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

// Enhanced Product interface to handle API color structure
interface ApiColorOption {
  id: number;
  hex_value: string;
  quantity: number;
  price: number;
  old_price?: number;
  images?: Array<{
    id: number;
    image: string;
  }>;
}

interface EnhancedProduct extends Product {
  color?: ApiColorOption[]; // Raw API color data
}

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { t, isRTL } = useLanguage();
  
  const [product, setProduct] = useState<EnhancedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorOption, setSelectedColorOption] = useState<ApiColorOption | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [addToCartStatus, setAddToCartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Build images array from main image, additional_images, and selected color images
  const images = useMemo(() => {
    if (!product) return ['https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=600'];
    
    const imagesArray: string[] = [];
    
    // If a color is selected and has images, prioritize those
    if (selectedColorOption?.images && selectedColorOption.images.length > 0) {
      selectedColorOption.images.forEach(imgObj => {
        if (imgObj.image) {
          imagesArray.push(imgObj.image);
        }
      });
    }
    
    // Always add the main image if not already included
    if (product.image && !imagesArray.includes(product.image)) {
      imagesArray.unshift(product.image); // Add to beginning
    }
    
    // Add additional images from the images field (which comes from additional_images API field)
    if (product.images && Array.isArray(product.images)) {
      // Filter out duplicates and empty strings
      const additionalImages = product.images.filter(img => 
        img && 
        typeof img === 'string' && 
        img.trim() !== '' && 
        !imagesArray.includes(img)
      );
      imagesArray.push(...additionalImages);
    }
    
    // If no images at all, use a fallback
    if (imagesArray.length === 0) {
      imagesArray.push('https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=600');
    }
    
    return imagesArray;
  }, [product, selectedColorOption]);

  // Reset selected image if it's out of bounds
  useEffect(() => {
    if (selectedImage >= images.length) {
      setSelectedImage(0);
    }
  }, [images.length, selectedImage]);

  // Load product data
  const loadProduct = async (refresh = false) => {
    if (!productId) return;

    try {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      console.log(`🔄 Loading product ${productId} from RAFAL API...`);
      
      const productData = await getProductById(productId) as EnhancedProduct;
      
      if (productData) {
        setProduct(productData);
        setConnectionStatus('connected');
        
        // Handle color selection from API color data
        if (productData.color && Array.isArray(productData.color) && productData.color.length > 0) {
          // Set the first color option as default
          setSelectedColorOption(productData.color[0]);
          console.log(`🎨 Available color options for ${productData.name}:`, productData.color);
          console.log(`🎨 Default color selected:`, productData.color[0]);
        } else {
          console.log(`🎨 No color options available for product ${productData.name}`);
          setSelectedColorOption(null);
        }

        // Load related products from the same category
        if (productData.categoryId) {
          console.log(`🔄 Loading related products for category ${productData.categoryId}...`);
          const categoryProducts = await getProductsByCategory(productData.categoryId);
          const related = categoryProducts
            .filter(p => p.id !== productId)
            .slice(0, 4);
          setRelatedProducts(related);
        }

        console.log(`✅ Successfully loaded product: ${productData.name}`);
      } else {
        console.warn(`⚠️ Product with ID ${productId} not found`);
        setError('Product not found');
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error(`❌ Failed to load product ${productId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Load favorites
  useEffect(() => {
    if (productId) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(productId));
    }
  }, [productId]);

  // Reset status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddToCartStatus('loading');
      
      // Add to cart with selected color if available
      await addToCart(
        product, 
        quantity, 
        selectedColorOption?.id
      );
      
      setAddToCartStatus('success');
      setStatusMessage(`${quantity} ${product.name} added to cart!`);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setAddToCartStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      setAddToCartStatus('error');
      setStatusMessage('Failed to add product to cart');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setAddToCartStatus('idle');
      }, 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      navigate(`/buy-now/${product.id}`);
    }
  };

  const handleFavoriteToggle = () => {
    if (!productId) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== productId)
      : [...favorites, productId];
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleRefresh = async () => {
    console.log(`🔄 Manual refresh triggered for product ${productId}`);
    await loadProduct(true);
  };

  const nextImage = () => {
    if (images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Color selection handler for API color options
  const handleColorSelect = (colorOption: ApiColorOption) => {
    setSelectedColorOption(colorOption);
    setSelectedImage(0); // Reset to first image when color changes
    console.log(`🎨 Color option selected:`, colorOption);
  };

  // Get color name from hex value (basic color detection)
  const getColorName = (hexValue: string): string => {
    const colorMap: Record<string, string> = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#ffa500': 'Orange',
      '#800080': 'Purple',
      '#ffc0cb': 'Pink',
      '#a52a2a': 'Brown',
      '#808080': 'Gray',
      '#c0c0c0': 'Silver',
      '#ffd700': 'Gold',
      '#f4a4c0': 'Rose Gold'
    };

    const lowerHex = hexValue.toLowerCase();
    return colorMap[lowerHex] || `Color ${hexValue}`;
  };

  // Get current price based on selected color
  const getCurrentPrice = () => {
    if (selectedColorOption && selectedColorOption.price) {
      return selectedColorOption.price;
    }
    return product?.price || 0;
  };

  // Get current original price based on selected color
  const getCurrentOriginalPrice = () => {
    if (selectedColorOption && selectedColorOption.old_price && selectedColorOption.old_price > 0) {
      return selectedColorOption.old_price;
    }
    return product?.originalPrice;
  };

  const currentImage = images[selectedImage] || images[0];
  const currentPrice = getCurrentPrice();
  const currentOriginalPrice = getCurrentOriginalPrice();

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">{t('common.home')}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">{t('product.description')}</span>
        </nav>

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
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">{t('common.home')}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">{t('product.description')}</span>
        </nav>

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
                <p className="text-red-700 font-semibold mb-2">RAFAL Product Service Unavailable</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>{isRefreshing ? t('common.loading') : t('common.retry')}</span>
                  </button>
                  
                  <Link
                    to="/"
                    className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>{t('common.home')}</span>
                  </Link>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  API Endpoint: https://apirafal.cyparta.com/products/{productId}/
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('common.error')}</h1>
          <p className="text-xl text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('common.home')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">{t('common.home')}</Link>
        <span className="mx-2">{'>'}</span>
        <Link to={`/category/${product.categoryId || product.category}`} className="hover:text-gray-800">
          {product.category && typeof product.category === 'string' 
            ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
            : t('common.category')
          }
        </Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">{product.name}</span>
      </nav>

      {/* Connection Status */}
      <div className="flex items-center justify-between mb-6">
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

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{images.length} image{images.length !== 1 ? 's' : ''}</span>
          {product.color && Array.isArray(product.color) && product.color.length > 0 && (
            <div className="flex items-center space-x-2">
              <Palette size={14} className="text-purple-600" />
              <span className="text-sm text-gray-600">{product.color.length} color{product.color.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
            title={t('common.refresh')}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
            <img
              src={currentImage}
              alt={`${product.name} - Image ${selectedImage + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.warn('⚠️ RAFAL Product image failed to load:', currentImage);
                target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=600';
              }}
            />
            
            {/* RAFAL Badge */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              RAFAL
            </div>

            {/* Color Badge - Show selected color with hex value */}
            {selectedColorOption && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedColorOption.hex_value }}
                ></div>
                <span>{getColorName(selectedColorOption.hex_value)}</span>
              </div>
            )}

            {/* Image Navigation - Only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Image Counter - Only show if multiple images */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Images - Only show if multiple images */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? 'border-red-600 scale-105 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Gallery Info */}
          {images.length > 1 && (
            <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p>📸 {images.length} high-quality images available</p>
              <p className="text-xs mt-1">Click thumbnails to view different angles</p>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Product Title and Rating */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-gray-600 ml-2">
                  {product.rating} ({product.reviews} {t('product.reviews')})
                </span>
              </div>
              
              {product.inStock ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {t('product.inStock')}
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {t('product.outOfStock')}
                </span>
              )}
            </div>

            {/* Labels */}
            <div className="flex space-x-2 mb-4">
              {product.isOffer && (
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                  {t('label.specialOffer')}
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-green-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                  {t('label.bestSeller')}
                </span>
              )}
            </div>
          </div>

          {/* Price - Updated to use current price based on selected color */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-800">
                {currentPrice} EGP
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    {currentOriginalPrice} EGP
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {t('product.save')} {currentOriginalPrice - currentPrice} EGP
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color Selection - Enhanced with API color data and hex values */}
          {product.color && Array.isArray(product.color) && product.color.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Palette size={20} className="text-purple-600" />
                <span>{t('product.colors')}</span>
                {selectedColorOption && (
                  <span className="text-sm font-normal text-gray-600">
                    (Selected: {getColorName(selectedColorOption.hex_value)})
                  </span>
                )}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.color.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    onClick={() => handleColorSelect(colorOption)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      selectedColorOption?.id === colorOption.id
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-lg scale-105'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {/* Color Swatch with actual hex value */}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                        colorOption.hex_value.toLowerCase() === '#ffffff' ? 'border-gray-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: colorOption.hex_value }}
                    ></div>
                    
                    {/* Color Name */}
                    <div className="flex-1 text-left">
                      <span className="font-medium text-sm block">{getColorName(colorOption.hex_value)}</span>
                      <span className="text-xs text-gray-500">{colorOption.hex_value}</span>
                    </div>
                    
                    {/* Price if different */}
                    {colorOption.price !== product.price && (
                      <span className="text-xs font-semibold text-gray-600">
                        {colorOption.price} EGP
                      </span>
                    )}
                    
                    {/* Selected Indicator */}
                    {selectedColorOption?.id === colorOption.id && (
                      <div className="w-2 h-2 bg-red-600 rounded-full ml-auto animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Color Selection Info */}
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 flex items-center space-x-2">
                  <Palette size={14} />
                  <span>
                    {product.color.length} color option{product.color.length !== 1 ? 's' : ''} available from RAFAL API
                    {selectedColorOption && ` • Currently viewing: ${getColorName(selectedColorOption.hex_value)} (${selectedColorOption.hex_value})`}
                  </span>
                </p>
                {selectedColorOption && selectedColorOption.quantity && (
                  <p className="text-xs text-purple-700 mt-1">
                    Stock: {selectedColorOption.quantity} units available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('product.quantity')}</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <span className="text-gray-600">
                {t('product.total')}: <span className="font-semibold">{(currentPrice * quantity).toFixed(0)} EGP</span>
              </span>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-4 rounded-lg ${
              addToCartStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCartStatus === 'loading' || isCartLoading}
                className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCartStatus === 'loading' || isCartLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <ShoppingCart size={20} />
                )}
                <span>
                  {addToCartStatus === 'loading' || isCartLoading 
                    ? t('common.loading') 
                    : addToCartStatus === 'success'
                    ? 'Added!'
                    : t('product.addToCart')
                  }
                </span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('product.buyNow')}
              </button>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleFavoriteToggle}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                <span>{isFavorite ? t('header.wishlist') : t('header.wishlist')}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Shield size={20} className="text-green-600" />
              <span>{t('product.features')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-blue-600" />
                <span className="text-gray-700">{t('label.freeDelivery')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-green-600" />
                <span className="text-gray-700">{t('label.warranty')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw size={16} className="text-orange-600" />
                <span className="text-gray-700">{t('label.returns')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-yellow-600" />
                <span className="text-gray-700">{t('label.quality')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description and Features */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('product.description')}</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('product.keyFeatures')}</h2>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">{t('product.relatedProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onFavoriteToggle={() => {}}
                isFavorite={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay for Refresh */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-3">
            <RefreshCw size={20} className="animate-spin text-red-600" />
            <span className="text-gray-700 font-medium">{t('common.refresh')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;