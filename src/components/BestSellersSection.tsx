import React from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/products';

const BestSellersSection = () => {
  const bestSellers = products.filter(product => product.isBestSeller);

  return (
    <section className="container mx-auto px-4 py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Best Sellers</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover our most popular products loved by thousands of customers
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bestSellers.map((product) => (
          <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSellersSection;