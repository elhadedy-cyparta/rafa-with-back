import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Home, Plus, Minus, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { getProductById } from '../data/products';
import { Product } from '../types/Product';
import { OrderService, DirectBuyRequest } from '../services/orderApi';
import { PaymentService } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PaymentIframe from '../components/PaymentIframe';

const BuyNowPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorHex, setSelectedColorHex] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
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
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);

  // Enhanced product data with color variants
  const productVariants = {
    '1': {
      colors: [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#ffffff' },
        { name: 'Pink', hex: '#ffc0cb' }
      ],
      sizes: ['Standard']
    },
    '2': {
      colors: [
        { name: 'Silver', hex: '#c0c0c0' },
        { name: 'Black', hex: '#000000' }
      ],
      sizes: ['5L', '7L']
    },
    '3': {
      colors: [
        { name: 'Blue', hex: '#0000ff' },
        { name: 'White', hex: '#ffffff' }
      ],
      sizes: ['Standard']
    },
    '4': {
      colors: [
        { name: 'Red', hex: '#ff0000' },
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#ffffff' }
      ],
      sizes: ['1.5L', '2L']
    },
    '5': {
      colors: [
        { name: 'Silver', hex: '#c0c0c0' },
        { name: 'Black', hex: '#000000' }
      ],
      sizes: ['12 Cup', '15 Cup']
    },
    '6': {
      colors: [
        { name: 'Red', hex: '#ff0000' },
        { name: 'Blue', hex: '#0000ff' }
      ],
      sizes: ['Standard']
    },
    '7': {
      colors: [
        { name: 'Silver', hex: '#c0c0c0' },
        { name: 'Black', hex: '#000000' }
      ],
      sizes: ['25L', '30L']
    },
    '8': {
      colors: [
        { name: 'Silver', hex: '#c0c0c0' },
        { name: 'White', hex: '#ffffff' }
      ],
      sizes: ['1.7L']
    }
  };

  const cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 
    'Suez', 'Luxor', 'Mansoura', 'El Mahalla El Kubra', 'Tanta'
  ];

  const regions = [
    'Cairo Governorate', 'Alexandria Governorate', 'Giza Governorate',
    'Qalyubia Governorate', 'Port Said Governorate', 'Suez Governorate',
    'Luxor Governorate', 'Dakahlia Governorate', 'Gharbia Governorate'
  ];

  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        const foundProduct = await getProductById(productId);
        setProduct(foundProduct || null);
        
        // Set default options
        const variants = productVariants[productId as keyof typeof productVariants];
        if (variants) {
          if (variants.colors.length > 0) {
            setSelectedColor(variants.colors[0].name);
            setSelectedColorHex(variants.colors[0].hex);
          }
          if (variants.sizes.length > 0) setSelectedSize(variants.sizes[0]);
        }
      };
      
      loadProduct();
    }
    
    // Pre-fill user data if authenticated
    if (isAuthenticated && user) {
      const nameParts = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone.replace(/^\+20/, '')
      }));
    }
  }, [productId, isAuthenticated, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product) return;
    
    setIsLoading(true);
    setApiError(null);

    try {
      // Format phone number - remove leading zeros and spaces
      const formattedPhone = formData.phone.replace(/\s+/g, '').replace(/^0+/, '');
      
      // Create shipping address string
      const shippingAddress = `${formData.address} _ ${formData.apartment || ''}`;
      
      // Prepare order data
      const orderData: DirectBuyRequest = {
        first_name: formData.firstName,
        second_name: formData.lastName,
        email: formData.email,
        phone: formattedPhone,
        country: formData.country,
        city: formData.city,
        region: formData.region,
        address: formData.address,
        apartment: formData.apartment,
        product_id: product.id,
        quantity: quantity,
        color_hex: selectedColorHex,
        shipping_address: shippingAddress,
        payment_method: formData.paymentMethod
      };
      
      // Call the API
      const result = await OrderService.directBuyNow(orderData);
      
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
              return;
            }
          } else {
            setApiError(paymentResult.message || 'Failed to process payment. Please try again.');
            setIsLoading(false);
            return;
          }
        }
        
        // For Cash on Delivery or successful payment setup
        setOrderConfirmed(true);
      } else {
        setApiError(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Add price variations based on color/size if needed
    let basePrice = product.price;
    
    // Example: Premium colors cost more
    if (selectedColor === 'Pink' || selectedColor === 'White') {
      basePrice += 50;
    }
    
    // Example: Larger sizes cost more
    if (selectedSize === '7L' || selectedSize === '15 Cup' || selectedSize === '30L') {
      basePrice += 100;
    }
    
    return basePrice;
  };

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

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPaymentIframe(false);
    setOrderConfirmed(true);
  };

  // Handle payment iframe close
  const handlePaymentIframeClose = () => {
    setShowPaymentIframe(false);
    // You might want to check the payment status here
    // For now, we'll just go back to the form
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Product not found</h1>
          <p className="text-xl text-gray-600 mb-8">The product you're trying to purchase doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

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

  // Order Confirmation Page
  if (orderConfirmed) {
    const currentPrice = getCurrentPrice();
    const subtotal = currentPrice * quantity;
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const finalTotal = subtotal + deliveryFee;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-800">{orderNumber || orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-semibold text-gray-800">{product.name}</span>
                </div>
                {selectedColor && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-semibold text-gray-800">{selectedColor}</span>
                  </div>
                )}
                {selectedSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-semibold text-gray-800">{selectedSize}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-800">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-800">
                    {formData.paymentMethod === 'Cash' ? 'Cash on Delivery' : 'Credit Card'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total:</span>
                    <span>{finalTotal} EGP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                You will receive a confirmation call within 30 minutes to verify your order details.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/orders"
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
                >
                  View My Orders
                </Link>
                <Link
                  to="/"
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const subtotal = currentPrice * quantity;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const finalTotal = subtotal + deliveryFee;
  const variants = productVariants[productId as keyof typeof productVariants];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-800">{t('common.home')}</Link>
        <span className="mx-2">{'>'}</span>
        <Link to={`/product/${product.id}`} className="hover:text-gray-800">{t('common.products')}</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-800 font-semibold">{t('buyNow.title')}</span>
      </nav>

      <div className="flex items-center space-x-4 mb-8">
        <Link
          to={`/product/${product.id}`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{t('buyNow.title')}</h1>
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
        {/* Purchase Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Options */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Home size={20} className="text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('buyNow.productOptions')}</h2>
              </div>

              <div className="space-y-6">
                {/* Product Image and Basic Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                    <p className="text-gray-600">SKU: {product.id}</p>
                  </div>
                </div>

                {/* Color Selection */}
                {variants && variants.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('buyNow.color')} *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variants.colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color.name);
                            setSelectedColorHex(color.hex);
                          }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                            selectedColor === color.name
                              ? 'border-red-600 bg-red-50 text-red-600 scale-105'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:scale-105'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <span>{color.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {variants && variants.sizes.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('buyNow.size')} *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variants.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                            selectedSize === size
                              ? 'border-red-600 bg-red-50 text-red-600 scale-105'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:scale-105'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('buyNow.quantity')} *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-3 font-semibold text-lg border-x border-gray-300">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('buyNow.pricePerItem')} <span className="font-semibold">{currentPrice} EGP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('buyNow.personalInfo')}</h2>
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
                    }`}
                    placeholder={t('checkout.firstName')}
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
                    }`}
                    placeholder={t('checkout.lastName')}
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
                      }`}
                      placeholder={t('checkout.phoneNumber')}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
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
                <h2 className="text-xl font-semibold text-gray-800">{t('buyNow.deliveryAddress')}</h2>
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
                    }`}
                    placeholder={t('checkout.address')}
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
                      }`}
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
                      }`}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    placeholder={t('checkout.apartment')}
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
                <h2 className="text-xl font-semibold text-gray-800">{t('buyNow.paymentMethod')}</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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

                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                  <div className="ml-8 space-y-3 border-l-2 border-gray-200 pl-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">{t('checkout.selectPayment')}</div>
                    
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin mr-2" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                t('buyNow.completePurchase')
              )}
            </button>
          </form>
        </div>

        {/* Product Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('buyNow.orderSummary')}</h2>
            
            {/* Product */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=200';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  {selectedColor && <p className="text-sm text-gray-600">{t('buyNow.color')}: {selectedColor}</p>}
                  {selectedSize && <p className="text-sm text-gray-600">{t('buyNow.size')}: {selectedSize}</p>}
                  <p className="text-sm text-gray-600">{t('buyNow.quantity')}: {quantity}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>{t('buyNow.unitPrice')}</span>
                <span>{currentPrice} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('buyNow.quantity')}</span>
                <span>× {quantity}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('buyNow.subtotal')}</span>
                <span>{subtotal} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('buyNow.deliveryFee')}</span>
                <span>{deliveryFee === 0 ? t('cart.free') : `${deliveryFee} EGP`}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-sm text-green-600">{t('buyNow.freeDelivery')}</p>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                <span>{t('cart.total')}</span>
                <span>{finalTotal} EGP</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <CheckCircle size={16} />
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

export default BuyNowPage;