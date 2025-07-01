import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getDeliveryFee } = useCart();

  const total = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const finalTotal = total + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-800">Home</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-800 font-semibold">Shopping Cart</span>
        </nav>

        <div className="text-center py-16">
          <ShoppingBag size={96} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-xl text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Continue Shopping</span>
          </Link>
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
        <span className="text-gray-800 font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Cart Items ({cartItems.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600">{item.price} EGP</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-24">
                    <p className="font-bold text-lg text-gray-800">
                      {(item.price * item.quantity).toFixed(0)} EGP
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items):</span>
                <span>{total.toFixed(0)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>{deliveryFee === 0 ? 'Free' : `${deliveryFee} EGP`}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-sm text-green-600">🎉 Free delivery on orders over 500 EGP!</p>
              )}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span>{finalTotal.toFixed(0)} EGP</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center block"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;