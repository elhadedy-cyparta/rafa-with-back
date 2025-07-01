import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Home, Loader, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { OrderService } from '../services/orderApi';
import { PaymentService } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';
import PaymentIframe from '../components/PaymentIframe';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, getDeliveryFee, clearCart, isLoading: cartLoading } = useCart();
  const { t, isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone?.replace(/^\+20/, '') || '',
    country: 'EG',
    city: '',
    region: '',
    address: '',
    apartment: '',
    paymentMethod: 'Cash' as 'Cash' | 'Card'
  });

  // Payment method options
  const [paymentProvider, setPaymentProvider] = useState<'fawry' | 'paymob' | 'aman'>('paymob');
  const [paymentOptions, setPaymentOptions] = useState({
    fawry: false,
    paymob: true,
    aman: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const total = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const finalTotal = total + deliveryFee;

  const cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 
    'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta'
  ];

  const regions = [
    'Cairo Governorate', 'Alexandria Governorate', 'Giza Governorate',
    'Qalyubia Governorate', 'Port Said Governorate', 'Suez Governorate',
    'Luxor Governorate', 'Dakahlia Governorate', 'Gharbia Governorate'
  ];

  // Toggle payment provider selection
  const handlePaymentProviderChange = (provider: 'fawry' | 'paymob' | 'aman') => {
    setPaymentProvider(provider);
    
    // Update payment options
    setPaymentOptions({
      fawry: provider === 'fawry',
      paymob: provider === 'paymob',
      aman: provider === 'aman'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('checkout.firstName') + ' ' + t('common.required');
    if (!formData.lastName.trim()) newErrors.lastName = t('checkout.lastName') + ' ' + t('common.required');
    if (!formData.phone.trim()) newErrors.phone = t('checkout.phoneNumber') + ' ' + t('common.required');
    if (!formData.address.trim()) newErrors.address = t('checkout.address') + ' ' + t('common.required');
    if (!formData.city.trim()) newErrors.city = t('checkout.city') + ' ' + t('common.required');
    if (!formData.region.trim()) newErrors.region = t('checkout.region') + ' ' + t('common.required');
    if (!formData.paymentMethod) newErrors.paymentMethod = t('checkout.paymentMethod') + ' ' + t('common.required');

    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('common.enterValidPhone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Format phone number - remove leading zeros and spaces
      const formattedPhone = formData.phone.replace(/\s+/g, '').replace(/^0+/, '');
      
      // Create shipping address string
      const shippingAddress = `${formData.address} _ ${formData.apartment || ''}`;
      
      // Prepare order items from cart
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        color_hex: item.color_hex
      }));
      
      // Prepare checkout data
      const checkoutData = {
        first_name: formData.firstName,
        second_name: formData.lastName,
        email: formData.email,
        phone: formattedPhone,
        country: formData.country,
        city: formData.city,
        region: formData.region,
        address: formData.address,
        apartment: formData.apartment,
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod,
        items: orderItems
      };
      
      // Call the checkout API
      const result = await OrderService.checkout(checkoutData);
      
      if (result.success) {
        setOrderId(result.id);
        setOrderNumber(result.order_number);
        
        // If payment method is Card, handle payment gateway
        if (formData.paymentMethod === 'Card') {
          // Call payment checker API with the selected payment options
          const paymentResult = await PaymentService.checkPayment(result.id, {
            fawry: paymentOptions.fawry,
            aman: paymentOptions.aman,
            paymob: paymentOptions.paymob
          });
          
          if (paymentResult.success) {
            // If redirect URL is provided, show payment iframe
            if (paymentResult.redirect_url) {
              setRedirectUrl(paymentResult.redirect_url);
              setShowPaymentIframe(true);
              setIsLoading(false);
              setIsSubmitting(false);
              return;
            }
          } else {
            setApiError(paymentResult.message || 'Failed to process payment. Please try again.');
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }
        }
        
        // For Cash on Delivery or successful payment setup
        await clearCart();
        navigate('/orders');
      } else {
        setApiError(result.message || t('checkout.errorProcessing'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setApiError(error instanceof Error ? error.message : t('checkout.errorProcessing'));
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setShowPaymentIframe(false);
    await clearCart();
    navigate('/orders');
  };

  // Handle payment iframe close
  const handlePaymentIframeClose = () => {
    setShowPaymentIframe(false);
    // You might want to check the payment status here
    // For now, we'll just go back to the form
  };

  // Payment iframe
  if (showPaymentIframe && redirectUrl) {
    return (
      <PaymentIframe
        redirectUrl={redirectUrl}
        orderId={orderId}
        orderNumber={orderNumber}
        onClose={handlePaymentIframeClose}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader size={48} className="mx-auto text-red-600 animate-spin mb-4" />
            <p className="text-xl text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <AlertCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('cart.empty')}</h1>
          <p className="text-xl text-gray-600 mb-8">{t('cart.emptyDescription')}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('cart.continueShopping')}</span>
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
        <Link to="/cart" className="hover:text-gray-800">{t('cart.title')}</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">{t('checkout.title')}</span>
      </nav>

      <div className="flex items-center space-x-4 mb-8">
        <Link
          to="/cart"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{t('checkout.title')}</h1>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Order Submission Failed</p>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('checkout.personalInfo')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.firstName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('checkout.firstName')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.lastName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('checkout.lastName')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.phoneNumber')} *
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      <span className="text-sm flex items-center space-x-1">
                        <span>🇪🇬</span>
                        <span>+20</span>
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } ${isRTL ? 'text-right' : ''}`}
                      placeholder={t('checkout.phoneNumber')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      isRTL ? 'text-right' : ''
                    }`}
                    placeholder="your@email.com"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('checkout.deliveryAddress')}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.address')} *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('checkout.address')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.city')} *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } ${isRTL ? 'text-right' : ''}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      disabled={isLoading}
                    >
                      <option value="">{t('common.select')} {t('checkout.city')}</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.region')} *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        errors.region ? 'border-red-500' : 'border-gray-300'
                      } ${isRTL ? 'text-right' : ''}`}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      disabled={isLoading}
                    >
                      <option value="">{t('common.select')} {t('checkout.region')}</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('checkout.apartment')}
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      isRTL ? 'text-right' : ''
                    }`}
                    placeholder={t('checkout.apartment')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('checkout.paymentMethod')}</h2>
              </div>

              <div className="space-y-4">
                <label className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={formData.paymentMethod === 'Cash'}
                    onChange={() => handleInputChange('paymentMethod', 'Cash')}
                    className="w-4 h-4 text-red-600"
                    disabled={isLoading}
                  />
                  <Truck size={20} className="text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-800">{t('checkout.cash')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.cashDescription')}</div>
                  </div>
                </label>

                <label className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    checked={formData.paymentMethod === 'Card'}
                    onChange={() => handleInputChange('paymentMethod', 'Card')}
                    className="w-4 h-4 text-red-600"
                    disabled={isLoading}
                  />
                  <CreditCard size={20} className="text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-800">{t('checkout.card')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.cardDescription')}</div>
                  </div>
                </label>

                {/* Credit Card Options */}
                {formData.paymentMethod === 'Card' && (
                  <div className={`ml-8 space-y-3 border-l-2 border-gray-200 pl-6 ${isRTL ? 'mr-8 pr-6 ml-0 pl-0 border-r-2 border-l-0' : ''}`}>
                    <div className="text-sm font-medium text-gray-700 mb-3">{t('checkout.selectPayment')}</div>
                    
                    <label className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                      <input
                        type="radio"
                        name="paymentProvider"
                        checked={paymentProvider === 'paymob'}
                        onChange={() => handlePaymentProviderChange('paymob')}
                        className="w-4 h-4 text-red-600"
                        disabled={isLoading}
                      />
                      <div className="w-8 h-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center text-xs font-bold text-white">
                        P
                      </div>
                      <span className="text-gray-700">Paymob</span>
                    </label>

                    <label className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                      <input
                        type="radio"
                        name="paymentProvider"
                        checked={paymentProvider === 'fawry'}
                        onChange={() => handlePaymentProviderChange('fawry')}
                        className="w-4 h-4 text-red-600"
                        disabled={isLoading}
                      />
                      <div className="w-8 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded flex items-center justify-center text-xs font-bold text-white">
                        F
                      </div>
                      <span className="text-gray-700">Fawry</span>
                    </label>

                    <label className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'} p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}>
                      <input
                        type="radio"
                        name="paymentProvider"
                        checked={paymentProvider === 'aman'}
                        onChange={() => handlePaymentProviderChange('aman')}
                        className="w-4 h-4 text-red-600"
                        disabled={isLoading}
                      />
                      <div className="w-8 h-6 bg-gradient-to-r from-green-500 to-green-700 rounded flex items-center justify-center text-xs font-bold text-white">
                        A
                      </div>
                      <span className="text-gray-700">Aman</span>
                    </label>
                  </div>
                )}
              </div>
              {errors.paymentMethod && <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <span>{t('checkout.continuePayment')}</span>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('checkout.orderSummary')}</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-3'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-gray-600 text-sm">{t('product.quantity')}: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {(item.price * item.quantity).toFixed(0)} EGP
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}:</span>
                <span>{total.toFixed(0)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.deliveryFee')}:</span>
                <span>{deliveryFee === 0 ? t('cart.free') : `${deliveryFee} EGP`}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-sm text-green-600">{t('buyNow.freeDelivery')}</p>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                <span>{t('cart.total')}:</span>
                <span>{finalTotal.toFixed(0)} EGP</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <CreditCard size={16} />
                <span className="text-sm font-medium">{t('buyNow.secureCheckout')}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {t('buyNow.securePayment')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;