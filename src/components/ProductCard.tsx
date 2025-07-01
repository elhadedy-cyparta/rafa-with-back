import React from 'react';
import { Star, Heart, ShoppingCart, RotateCcw, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types/Product';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onFavoriteToggle, 
  isFavorite = false 
}) => {
  const { addToCart, isLoading } = useCart();
  const { t, isRTL } = useLanguage();
  const [addingToCart, setAddingToCart] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setAddingToCart(true);
      await addToCart(product);
      // Success notification could be added here
      setTimeout(() => {
        setAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // Error notification could be added here
      setAddingToCart(false);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate directly to buy now page for this specific product
    window.location.href = `/buy-now/${product.id}`;
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const comparison = JSON.parse(localStorage.getItem('comparison') || '[]');
    if (comparison.length >= 3) {
      alert('You can only compare up to 3 products at a time.');
      return;
    }
    
    if (comparison.find((p: Product) => p.id === product.id)) {
      alert('This product is already in your comparison list.');
      return;
    }
    
    const newComparison = [...comparison, product];
    localStorage.setItem('comparison', JSON.stringify(newComparison));
    alert('Product added to comparison!');
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="product-card bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 hover:border-red-200">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
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

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${
                isFavorite 
                  ? 'bg-red-600 text-white scale-110 animate-pulse' 
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={handleAddToCompare}
              className="p-2 rounded-full bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-lg hover:scale-110 hover:rotate-180"
              title="Add to Compare"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleBuyNow}
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
            <span className="text-sm text-gray-600 transition-colors duration-300">
              ({product.reviews === 0 ? t('product.new') : product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300">
              {product.price} EGP
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through transition-colors duration-300">
                {product.originalPrice} EGP
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || addingToCart}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg btn-hover disabled:opacity-70"
            >
              {isLoading || addingToCart ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} className="transition-transform duration-300 group-hover:animate-bounce" />
              )}
              <span>{isLoading || addingToCart ? `${t('common.loading')}...` : t('product.addToCart')}</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg btn-hover"
            >
              {t('product.buyNow')}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;