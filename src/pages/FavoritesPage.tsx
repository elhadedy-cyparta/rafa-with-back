import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProductById } from '../data/products';
import { Product } from '../types/Product';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);

    // Get product details for favorites
    const products = storedFavorites
      .map((id: string) => getProductById(id))
      .filter((product: Product | undefined): product is Product => product !== undefined);
    
    setFavoriteProducts(products);
  }, []);

  const handleFavoriteToggle = (productId: string) => {
    const newFavorites = favorites.filter(id => id !== productId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    // Update favorite products
    const products = newFavorites
      .map((id: string) => getProductById(id))
      .filter((product: Product | undefined): product is Product => product !== undefined);
    
    setFavoriteProducts(products);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">Favorites</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Favorites</h1>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">No favorites yet</p>
          <p className="text-gray-500 mb-6">Start adding products to your favorites to see them here.</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;