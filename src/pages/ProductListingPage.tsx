import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Grid, List, SortAsc, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProductsByCategory, getCategoryName } from '../data/products';
import { Product } from '../types/Product';

const ProductListingPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);

  // Load products for the category
  const loadCategoryProducts = async (refresh = false) => {
    if (!categoryId) return;

    try {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      console.log(`🔄 Loading products for category ${categoryId}...`);
      
      const categoryProducts = await getProductsByCategory(categoryId);
      
      if (categoryProducts.length > 0) {
        setProducts(categoryProducts);
        setConnectionStatus('connected');
        console.log(`✅ Successfully loaded ${categoryProducts.length} products for category ${categoryId}`);
      } else {
        console.warn(`⚠️ No products found for category ${categoryId}`);
        setError('No products found in this category');
        setProducts([]);
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error(`❌ Failed to load products for category ${categoryId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setConnectionStatus('disconnected');
      setProducts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategoryProducts();
  }, [categoryId]);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply stock filter
    if (showOnlyInStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Apply offers filter
    if (showOnlyOffers) {
      filtered = filtered.filter(product => product.isOffer);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id.localeCompare(a.id); // Assuming higher IDs are newer
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, sortBy, priceRange, showOnlyInStock, showOnlyOffers]);

  const handleFavoriteToggle = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleRefresh = async () => {
    console.log(`🔄 Manual refresh triggered for category ${categoryId}`);
    await loadCategoryProducts(true);
  };

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
  ];

  // Get max price for price range slider
  const maxPrice = Math.max(...products.map(p => p.price), 10000);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">Home</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">
            {categoryId && getCategoryName(categoryId)}
          </span>
        </nav>

        <div className="relative h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading RAFAL products...</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Wifi size={16} />
                <span>Connecting to RAFAL API...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">Home</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">
            {categoryId && getCategoryName(categoryId)}
          </span>
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
                <p className="text-red-700 font-semibold mb-2">RAFAL Products Service Unavailable</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Retrying...' : 'Retry'}</span>
                </button>
                
                <p className="text-xs text-gray-500 mt-3">
                  API Endpoint: https://apirafal.cyparta.com/products/?category_ids={categoryId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">
          {categoryId && getCategoryName(categoryId)}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {categoryId && getCategoryName(categoryId)}
          </h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            
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
                {connectionStatus === 'connected' ? 'Live from RAFAL' : 
                 connectionStatus === 'disconnected' ? 'Offline' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 lg:mt-0">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SortAsc size={20} className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Filter size={20} className="text-red-600" />
              <span>Filters</span>
            </h3>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range: {priceRange[0]} - {priceRange[1]} EGP
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyInStock}
                  onChange={(e) => setShowOnlyInStock(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>

            {/* Offers Filter */}
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOnlyOffers}
                  onChange={(e) => setShowOnlyOffers(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Special Offers Only</span>
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setPriceRange([0, maxPrice]);
                setShowOnlyInStock(false);
                setShowOnlyOffers(false);
                setSortBy('name');
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No products found</p>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
              <button
                onClick={() => {
                  setPriceRange([0, maxPrice]);
                  setShowOnlyInStock(false);
                  setShowOnlyOffers(false);
                }}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }>
              {filteredProducts.map((product) => (
                <div key={product.id} className={viewMode === 'list' ? 'max-w-none' : ''}>
                  <ProductCard
                    product={product}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay for Refresh */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-lg p-4 flex items-center space-x-3">
            <RefreshCw size={20} className="animate-spin text-red-600" />
            <span className="text-gray-700 font-medium">Refreshing RAFAL products...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;