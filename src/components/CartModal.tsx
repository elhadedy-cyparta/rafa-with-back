import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getDeliveryFee, isLoading } = useCart();
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const total = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const finalTotal = total + deliveryFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-right-4 duration-300 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{t('cartModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader size={48} className="text-gray-300 mb-4 animate-spin" />
            <p className="text-xl text-gray-600 mb-2">{t('common.loading')}</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-2">{t('cartModal.empty')}</p>
            <p className="text-gray-500 mb-6">{t('cartModal.emptyDescription')}</p>
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('cartModal.continueShopping')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-600">{item.price} EGP</p>
                      {item.color_name && (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-400">•</span>
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.color_hex || '#ccc' }}
                          ></div>
                          <span className="text-gray-600 text-sm">{item.color_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(item.price * item.quantity).toFixed(0)} EGP
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cartModal.subtotal')}:</span>
                  <span>{total.toFixed(0)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cartModal.deliveryFee')}:</span>
                  <span>{deliveryFee === 0 ? t('cart.free') : `${deliveryFee} EGP`}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>{t('cartModal.total')}:</span>
                  <span>{finalTotal.toFixed(0)} EGP</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  {t('cartModal.viewCart')}
                </Link>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
                >
                  {t('cartModal.checkout')}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;