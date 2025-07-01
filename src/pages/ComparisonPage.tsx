import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Star } from 'lucide-react';
import { products } from '../data/products';
import { Product } from '../types/Product';

const ComparisonPage = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(products);

  useEffect(() => {
    // Load comparison products from localStorage
    const storedComparison = JSON.parse(localStorage.getItem('comparison') || '[]');
    if (storedComparison.length > 0) {
      setSelectedProducts(storedComparison);
    }
  }, []);

  const addProduct = (product: Product) => {
    if (selectedProducts.length < 3 && !selectedProducts.find(p => p.id === product.id)) {
      const newComparison = [...selectedProducts, product];
      setSelectedProducts(newComparison);
      localStorage.setItem('comparison', JSON.stringify(newComparison));
    }
  };

  const removeProduct = (productId: string) => {
    const newComparison = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(newComparison);
    localStorage.setItem('comparison', JSON.stringify(newComparison));
  };

  const getComparisonFeatures = () => {
    if (selectedProducts.length === 0) return [];
    
    return [
      { key: 'name', label: 'Product Name' },
      { key: 'price', label: 'Price' },
      { key: 'rating', label: 'Rating' },
      { key: 'reviews', label: 'Reviews' },
      { key: 'category', label: 'Category' },
      { key: 'inStock', label: 'Availability' },
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">Compare</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Product Comparison</h1>

      {selectedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚖️</div>
          <p className="text-xl text-gray-600 mb-2">No products to compare</p>
          <p className="text-gray-500 mb-6">Select products to start comparing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-800">Features</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="text-center p-4 min-w-64">
                      <div className="relative">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                        />
                      </div>
                    </th>
                  ))}
                  {selectedProducts.length < 3 && (
                    <th className="text-center p-4 min-w-64">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                        <Plus size={24} className="text-gray-400" />
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {getComparisonFeatures().map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 font-semibold text-gray-800">{feature.label}</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        {feature.key === 'price' && (
                          <span className="font-bold text-gray-800">
                            {product[feature.key as keyof Product]} EGP
                          </span>
                        )}
                        {feature.key === 'rating' && (
                          <div className="flex items-center justify-center space-x-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={`${
                                    i < Math.floor(product.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {product.rating}
                            </span>
                          </div>
                        )}
                        {feature.key === 'inStock' && (
                          <span className={`px-2 py-1 text-sm rounded-full ${
                            product.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                        {feature.key === 'category' && (
                          <span className="capitalize text-gray-700">
                            {product.category}
                          </span>
                        )}
                        {!['price', 'rating', 'inStock', 'category'].includes(feature.key) && (
                          <span className="text-gray-700">
                            {String(product[feature.key as keyof Product])}
                          </span>
                        )}
                      </td>
                    ))}
                    {selectedProducts.length < 3 && <td className="p-4"></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Select Products to Compare {selectedProducts.length > 0 && `(${selectedProducts.length}/3)`}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableProducts
            .filter(product => !selectedProducts.find(p => p.id === product.id))
            .map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 mb-3">{product.price} EGP</p>
                <button
                  onClick={() => addProduct(product)}
                  disabled={selectedProducts.length >= 3}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    selectedProducts.length >= 3
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {selectedProducts.length >= 3 ? 'Max 3 Products' : 'Add to Compare'}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;