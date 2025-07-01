import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Grid, List, SortAsc } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { Product } from '../types/Product';

const AllProductsPage = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(product => product.category === filterBy);
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
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [sortBy, filterBy]);

  const handleFavoriteToggle = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'kitchen', label: 'Kitchen Appliances' },
    { value: 'home', label: 'Home Appliances' },
    { value: 'mixers', label: 'Mixers & Blenders' },
    { value: 'beauty', label: 'Beauty & Care' },
    { value: 'cleaning', label: 'Cleaning Appliances' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">All Products</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">All Products</h1>
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6 lg:mt-0">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

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

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">No products found</p>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
  );
};

export default AllProductsPage;