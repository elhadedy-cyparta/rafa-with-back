import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys and values
const translations = {
  en: {
    // Header & Navigation
    'header.search.placeholder': 'Search for your product...',
    'header.wishlist': 'Wishlist',
    'header.compare': 'Compare',
    'header.cart': 'Cart',
    'header.login': 'Login',
    'header.account': 'Account',
    'header.orders': 'My Orders',
    
    // Home Page
    'home.hero.title': 'Premium Electrical Appliances',
    'home.hero.subtitle': 'Discover our premium collection of electrical appliances designed for modern living',
    'home.categories.title': 'Shop by Category',
    'home.products.title': 'Our Products',
    'home.products.subtitle': 'Discover our premium collection of electrical appliances designed for modern living',
    'home.featured': 'Featured Products',
    'home.bestsellers': 'Best Sellers',
    'home.about.title': 'About Us',
    'home.about.description': 'At Rafal, we offer a wide range of high-quality electrical appliances, expertly designed for safety and innovation.',
    'home.why.title': 'Why Choose Rafal?',
    
    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.price': 'Price',
    'product.originalPrice': 'Original Price',
    'product.save': 'Save',
    'product.colors': 'Available Colors',
    'product.quantity': 'Quantity',
    'product.total': 'Total',
    'product.features': 'Product Features',
    'product.description': 'Product Description',
    'product.keyFeatures': 'Key Features',
    'product.relatedProducts': 'Related Products',
    'product.rating': 'Rating',
    'product.reviews': 'reviews',
    'product.new': 'New',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDescription': 'Add some products to get started!',
    'cart.continueShopping': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.deliveryFee': 'Delivery Fee',
    'cart.free': 'Free',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.items': 'items',
    
    // Common
    'common.home': 'Home',
    'common.category': 'Category',
    'common.products': 'Products',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.viewAll': 'View All',
    'common.showMore': 'Show More',
    'common.showLess': 'Show Less',
    'common.select': 'Select',
    'common.required': 'is required',
    'common.enterValidPhone': 'Please enter a valid phone number',
    'common.processing': 'Processing...',
    'free': 'Free',
    
    // Footer
    'footer.categories': 'Categories',
    'footer.account': 'Account',
    'footer.contact': 'Contact Us',
    'footer.payment': 'Payment Methods',
    'footer.copyright': '© 2024 RAFAL. All rights reserved.',
    
    // Status
    'status.connected': 'Live from RAFAL',
    'status.offline': 'Offline',
    'status.connecting': 'Connecting',
    
    // Offers & Labels
    'label.offer': 'OFFER',
    'label.bestSeller': 'BEST SELLER',
    'label.specialOffer': 'SPECIAL OFFER',
    'label.freeDelivery': 'Free Delivery',
    'label.warranty': '2 Year Warranty',
    'label.returns': '30 Day Returns',
    'label.quality': 'Premium Quality',

    // About Section
    'about.title': 'About Us',
    'about.description': 'At Rafal, we offer a wide range of high-quality electrical appliances, expertly designed for safety and innovation.',
    'about.paragraph1': 'Our products serve the needs of individuals and businesses alike, combining reliability with competitive pricing.',
    'about.paragraph2': 'Shop with confidence and discover the best the industry has to offer!',
    'about.exploreButton': 'Explore Products',

    // Why Choose Section
    'why.title': 'Why Choose Rafal?',
    'why.subtitle': 'Discover what makes us the preferred choice for quality electrical appliances',
    'why.feature1.title': 'Wide Variety of Products',
    'why.feature1.description': 'A broad selection of products available to meet every need.',
    'why.feature2.title': 'Lifetime Maintenance',
    'why.feature2.description': 'We provide lifetime maintenance for all our products. Contact us if any issue occurs.',
    'why.feature3.title': 'Top Quality Materials',
    'why.feature3.description': 'Rafal products are built using premium materials to ensure durability and long life.',
    'why.feature4.title': 'Extended Warranty',
    'why.feature4.description': 'All our products come with comprehensive warranties and excellent after-sales support.',

    // Video Section
    'video.title': 'Watch Our Videos',
    'video.subtitle': 'See our products in action and learn how to get the most out of them',
    'video.visitChannel': 'Visit RAFAL Electric on YouTube',
    'video.availableVideos': 'videos available',
    'video.watchOnYoutube': 'Watch on YouTube',

    // Category Slider
    'category.title': 'Shop by Category',
    'category.liveFrom': 'Live from RAFAL',
    'category.categories': 'categories',
    'category.refresh': 'Refresh Categories',

    // Products Carousel
    'products.title': 'Our Products',
    'products.subtitle': 'Discover our premium collection of electrical appliances designed for modern living',
    'products.featured': 'Featured Products',
    'products.bestsellers': 'Best Sellers',
    'products.viewAll': 'View All Products',
    'products.quickBuy': 'Quick Buy',

    // Product Details
    'productDetails.category': 'Category',
    'productDetails.images': 'images',
    'productDetails.colors': 'colors',
    'productDetails.refresh': 'Refresh',
    'productDetails.share': 'Share',
    'productDetails.features': 'Features',
    'productDetails.description': 'Description',
    'productDetails.keyFeatures': 'Key Features',
    'productDetails.relatedProducts': 'Related Products',
    'productDetails.noDescription': 'No description available for this product.',
    'productDetails.highQualityImages': 'high-quality images available',
    'productDetails.clickThumbnails': 'Click thumbnails to view different angles',
    'productDetails.colorOptions': 'color options available from RAFAL API',
    'productDetails.currentlyViewing': 'Currently viewing',
    'productDetails.stockAvailable': 'units available',

    // WhatsApp Widget
    'whatsapp.title': 'WhatsApp Support',
    'whatsapp.subtitle': 'How can we help you?',
    'whatsapp.sales.title': 'Sales',
    'whatsapp.sales.description': 'Product inquiries & pricing',
    'whatsapp.support.title': 'Customer Support',
    'whatsapp.support.description': 'Technical help & assistance',
    'whatsapp.replyTime': 'We typically reply within minutes',
    'whatsapp.needHelp': 'Need help? Chat with us!',

    // Login/Signup
    'login.title': 'Login',
    'login.welcome': 'Welcome back!!!',
    'login.phoneNumber': 'Phone Number',
    'login.password': 'Password',
    'login.rememberMe': 'Remember Me',
    'login.forgotPassword': 'Forgot Password?',
    'login.loginButton': 'Login',
    'login.newHere': 'New here?',
    'login.signUp': 'Sign up',

    'signup.title': 'Sign Up',
    'signup.welcome': 'Create your account and start saving time!',
    'signup.username': 'Username',
    'signup.phoneNumber': 'Phone Number',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.agreeTerms': 'By using this site, you agree to our Terms of Service and Privacy Policy',
    'signup.signupButton': 'Sign Up',
    'signup.haveAccount': 'Already have an account?',
    'signup.login': 'Login',

    // Cart Modal
    'cartModal.title': 'Shopping Cart',
    'cartModal.empty': 'Your cart is currently empty',
    'cartModal.emptyDescription': 'Add some products to get started!',
    'cartModal.continueShopping': 'Continue Shopping',
    'cartModal.subtotal': 'Subtotal:',
    'cartModal.deliveryFee': 'Delivery Fee:',
    'cartModal.total': 'Total:',
    'cartModal.viewCart': 'View Full Cart',
    'cartModal.checkout': 'Checkout',
    'cartModal.free': 'Free',

    // Account
    'account.title': 'Account Details',
    'account.subtitle': 'Manage your personal information and security settings',
    'account.profile': 'Profile Information',
    'account.name': 'Name',
    'account.phone': 'Mobile Number',
    'account.saveProfile': 'Save Profile',
    'account.changePassword': 'Change Password',
    'account.oldPassword': 'Old Password',
    'account.newPassword': 'New Password',
    'account.changePasswordButton': 'Change Password',
    'account.logout': 'Logout',
    'account.confirmLogout': 'Are you sure you want to log out?',

    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No Orders Found',
    'orders.emptyDescription': 'You haven\'t placed any orders yet.',
    'orders.startShopping': 'Start Shopping',
    'orders.orderNumber': 'Order #',
    'orders.placedOn': 'Placed on',
    'orders.items': 'items',
    'orders.details': 'Details',
    'orders.status': 'Status',
    'orders.delivered': 'Delivered',
    'orders.inTransit': 'In Transit',
    'orders.processing': 'Processing',

    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.empty': 'No favorites yet',
    'favorites.emptyDescription': 'Start adding products to your favorites to see them here.',
    'favorites.startShopping': 'Start Shopping',

    // Compare
    'compare.title': 'Product Comparison',
    'compare.empty': 'No products to compare',
    'compare.emptyDescription': 'Select products to start comparing.',
    'compare.features': 'Features',
    'compare.addToCompare': 'Add to Compare',
    'compare.maxProducts': 'Max 3 Products',
    'compare.selectProducts': 'Select Products to Compare',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.personalInfo': 'Personal Information',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.phoneNumber': 'Phone Number',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.region': 'Region',
    'checkout.apartment': 'Apartment, Suite, etc. (Optional)',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.cash': 'Cash on Delivery',
    'checkout.cashDescription': 'Pay when you receive your order',
    'checkout.card': 'Credit Card',
    'checkout.cardDescription': 'Pay securely with your credit card',
    'checkout.selectPayment': 'Select Payment Option:',
    'checkout.continuePayment': 'Continue to Payment',
    'checkout.orderSummary': 'Order Summary',
    'checkout.errorProcessing': 'Error processing your order. Please try again.',

    // Buy Now
    'buyNow.title': 'Complete Your Purchase',
    'buyNow.productOptions': 'Product Options',
    'buyNow.color': 'Color',
    'buyNow.size': 'Size',
    'buyNow.quantity': 'Quantity',
    'buyNow.pricePerItem': 'Price per item:',
    'buyNow.personalInfo': 'Personal Information',
    'buyNow.deliveryAddress': 'Delivery Address',
    'buyNow.paymentMethod': 'Payment Method',
    'buyNow.completePurchase': 'Complete Purchase',
    'buyNow.orderSummary': 'Order Summary',
    'buyNow.unitPrice': 'Unit Price:',
    'buyNow.quantity': 'Quantity:',
    'buyNow.subtotal': 'Subtotal:',
    'buyNow.deliveryFee': 'Delivery Fee:',
    'buyNow.freeDelivery': 'Free delivery on orders over 500 EGP!',
    'buyNow.secureCheckout': 'Secure Checkout',
    'buyNow.securePayment': 'Your payment information is protected with industry-standard encryption.',

    // Order Confirmation
    'orderConfirm.title': 'Order Confirmed!',
    'orderConfirm.thankYou': 'Thank you for your purchase. Your order has been successfully placed.',
    'orderConfirm.orderDetails': 'Order Details',
    'orderConfirm.orderId': 'Order ID:',
    'orderConfirm.product': 'Product:',
    'orderConfirm.color': 'Color:',
    'orderConfirm.size': 'Size:',
    'orderConfirm.quantity': 'Quantity:',
    'orderConfirm.paymentMethod': 'Payment Method:',
    'orderConfirm.total': 'Total:',
    'orderConfirm.confirmationCall': 'You will receive a confirmation call within 30 minutes to verify your order details.',
    'orderConfirm.viewOrders': 'View My Orders',
    'orderConfirm.continueShopping': 'Continue Shopping',

    // Forgot Password
    'forgotPassword.title': 'Forgot Password',
    'forgotPassword.enterPhone': 'Enter Phone Number',
    'forgotPassword.sendOTP': 'We\'ll send you an OTP to reset your password',
    'forgotPassword.phoneNumber': 'Phone Number',
    'forgotPassword.sendOTPButton': 'Send OTP',
    'forgotPassword.enterOTP': 'Enter OTP',
    'forgotPassword.otpSentTo': 'Enter the 6-digit code sent to',
    'forgotPassword.otpCode': 'OTP Code',
    'forgotPassword.verifyOTP': 'Verify OTP',
    'forgotPassword.back': 'Back',
    'forgotPassword.didntReceive': 'Didn\'t receive OTP? Resend',
    'forgotPassword.resetPassword': 'Reset Password',
    'forgotPassword.enterNewPassword': 'Enter your new password',
    'forgotPassword.newPassword': 'New Password',
    'forgotPassword.confirmPassword': 'Confirm Password',
    'forgotPassword.savePassword': 'Save Password',
    'forgotPassword.passwordReset': 'Password Reset Successful!',
    'forgotPassword.resetSuccess': 'Your password has been successfully reset. You can now login with your new password.',
    'forgotPassword.backToHome': 'Back to Home',
    'forgotPassword.rememberPassword': 'Remember your password?',
    'forgotPassword.signIn': 'Sign In',

    // Top Bar
    'topbar.offers': 'Offers & Discounts',
    'topbar.delivery': 'Fast delivery within 24 hours',
  },
  ar: {
    // Header & Navigation
    'header.search.placeholder': 'ابحث عن منتجك...',
    'header.wishlist': 'المفضلة',
    'header.compare': 'المقارنة',
    'header.cart': 'السلة',
    'header.login': 'تسجيل الدخول',
    'header.account': 'حسابي',
    'header.orders': 'طلباتي',
    
    // Home Page
    'home.hero.title': 'أجهزة كهربائية متميزة',
    'home.hero.subtitle': 'اكتشف مجموعتنا المتميزة من الأجهزة الكهربائية المصممة للحياة العصرية',
    'home.categories.title': 'تسوق حسب الفئة',
    'home.products.title': 'منتجاتنا',
    'home.products.subtitle': 'اكتشف مجموعتنا المتميزة من الأجهزة الكهربائية المصممة للحياة العصرية',
    'home.featured': 'المنتجات المميزة',
    'home.bestsellers': 'الأكثر مبيعاً',
    'home.about.title': 'من نحن',
    'home.about.description': 'في رافال، نقدم مجموعة واسعة من الأجهزة الكهربائية عالية الجودة، مصممة بخبرة للأمان والابتكار.',
    'home.why.title': 'لماذا تختار رافال؟',
    
    // Product
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتر الآن',
    'product.inStock': 'متوفر',
    'product.outOfStock': 'غير متوفر',
    'product.price': 'السعر',
    'product.originalPrice': 'السعر الأصلي',
    'product.save': 'وفر',
    'product.colors': 'الألوان المتاحة',
    'product.quantity': 'الكمية',
    'product.total': 'المجموع',
    'product.features': 'مميزات المنتج',
    'product.description': 'وصف المنتج',
    'product.keyFeatures': 'المميزات الرئيسية',
    'product.relatedProducts': 'منتجات ذات صلة',
    'product.rating': 'التقييم',
    'product.reviews': 'تقييمات',
    'product.new': 'جديد',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.emptyDescription': 'أضف بعض المنتجات للبدء!',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.deliveryFee': 'رسوم التوصيل',
    'cart.free': 'مجاني',
    'cart.total': 'المجموع',
    'cart.checkout': 'إتمام الطلب',
    'cart.items': 'عناصر',
    
    // Common
    'common.home': 'الرئيسية',
    'common.category': 'الفئة',
    'common.products': 'المنتجات',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.retry': 'إعادة المحاولة',
    'common.refresh': 'تحديث',
    'common.close': 'إغلاق',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.viewAll': 'عرض الكل',
    'common.showMore': 'عرض المزيد',
    'common.showLess': 'عرض أقل',
    'common.select': 'اختر',
    'common.required': 'مطلوب',
    'common.enterValidPhone': 'الرجاء إدخال رقم هاتف صحيح',
    'common.processing': 'جاري المعالجة...',
    'free': 'مجاني',
    
    // Footer
    'footer.categories': 'الفئات',
    'footer.account': 'الحساب',
    'footer.contact': 'اتصل بنا',
    'footer.payment': 'طرق الدفع',
    'footer.copyright': '© 2024 رافال. جميع الحقوق محفوظة.',
    
    // Status
    'status.connected': 'مباشر من رافال',
    'status.offline': 'غير متصل',
    'status.connecting': 'جاري الاتصال',
    
    // Offers & Labels
    'label.offer': 'عرض',
    'label.bestSeller': 'الأكثر مبيعاً',
    'label.specialOffer': 'عرض خاص',
    'label.freeDelivery': 'توصيل مجاني',
    'label.warranty': 'ضمان لمدة سنتين',
    'label.returns': 'إرجاع خلال 30 يوم',
    'label.quality': 'جودة متميزة',

    // About Section
    'about.title': 'من نحن',
    'about.description': 'في رافال، نقدم مجموعة واسعة من الأجهزة الكهربائية عالية الجودة، مصممة بخبرة للأمان والابتكار.',
    'about.paragraph1': 'تخدم منتجاتنا احتياجات الأفراد والشركات على حد سواء، وتجمع بين الموثوقية والأسعار التنافسية.',
    'about.paragraph2': 'تسوق بثقة واكتشف أفضل ما تقدمه الصناعة!',
    'about.exploreButton': 'استكشف المنتجات',

    // Why Choose Section
    'why.title': 'لماذا تختار رافال؟',
    'why.subtitle': 'اكتشف ما يجعلنا الخيار المفضل للأجهزة الكهربائية عالية الجودة',
    'why.feature1.title': 'تشكيلة واسعة من المنتجات',
    'why.feature1.description': 'مجموعة واسعة من المنتجات المتاحة لتلبية كل احتياج.',
    'why.feature2.title': 'صيانة مدى الحياة',
    'why.feature2.description': 'نقدم صيانة مدى الحياة لجميع منتجاتنا. اتصل بنا إذا حدثت أي مشكلة.',
    'why.feature3.title': 'مواد عالية الجودة',
    'why.feature3.description': 'منتجات رافال مصنوعة باستخدام مواد متميزة لضمان المتانة وطول العمر.',
    'why.feature4.title': 'ضمان ممتد',
    'why.feature4.description': 'تأتي جميع منتجاتنا مع ضمانات شاملة ودعم ممتاز بعد البيع.',

    // Video Section
    'video.title': 'شاهد فيديوهاتنا',
    'video.subtitle': 'شاهد منتجاتنا قيد الاستخدام وتعلم كيفية الاستفادة منها بأقصى قدر',
    'video.visitChannel': 'زيارة قناة رافال إلكتريك على يوتيوب',
    'video.availableVideos': 'فيديو متاح',
    'video.watchOnYoutube': 'مشاهدة على يوتيوب',

    // Category Slider
    'category.title': 'تسوق حسب الفئة',
    'category.liveFrom': 'مباشر من رافال',
    'category.categories': 'فئات',
    'category.refresh': 'تحديث الفئات',

    // Products Carousel
    'products.title': 'منتجاتنا',
    'products.subtitle': 'اكتشف مجموعتنا المتميزة من الأجهزة الكهربائية المصممة للحياة العصرية',
    'products.featured': 'المنتجات المميزة',
    'products.bestsellers': 'الأكثر مبيعاً',
    'products.viewAll': 'عرض جميع المنتجات',
    'products.quickBuy': 'شراء سريع',

    // Product Details
    'productDetails.category': 'الفئة',
    'productDetails.images': 'صور',
    'productDetails.colors': 'ألوان',
    'productDetails.refresh': 'تحديث',
    'productDetails.share': 'مشاركة',
    'productDetails.features': 'المميزات',
    'productDetails.description': 'الوصف',
    'productDetails.keyFeatures': 'المميزات الرئيسية',
    'productDetails.relatedProducts': 'منتجات ذات صلة',
    'productDetails.noDescription': 'لا يوجد وصف متاح لهذا المنتج.',
    'productDetails.highQualityImages': 'صور عالية الجودة متاحة',
    'productDetails.clickThumbnails': 'انقر على الصور المصغرة لعرض زوايا مختلفة',
    'productDetails.colorOptions': 'خيارات الألوان المتاحة من رافال',
    'productDetails.currentlyViewing': 'تشاهد حالياً',
    'productDetails.stockAvailable': 'وحدة متاحة',

    // WhatsApp Widget
    'whatsapp.title': 'دعم الواتساب',
    'whatsapp.subtitle': 'كيف يمكننا مساعدتك؟',
    'whatsapp.sales.title': 'المبيعات',
    'whatsapp.sales.description': 'استفسارات المنتج والأسعار',
    'whatsapp.support.title': 'دعم العملاء',
    'whatsapp.support.description': 'مساعدة تقنية ودعم',
    'whatsapp.replyTime': 'نرد عادة خلال دقائق',
    'whatsapp.needHelp': 'تحتاج مساعدة؟ تحدث معنا!',

    // Login/Signup
    'login.title': 'تسجيل الدخول',
    'login.welcome': 'مرحباً بعودتك!!!',
    'login.phoneNumber': 'رقم الهاتف',
    'login.password': 'كلمة المرور',
    'login.rememberMe': 'تذكرني',
    'login.forgotPassword': 'نسيت كلمة المرور؟',
    'login.loginButton': 'تسجيل الدخول',
    'login.newHere': 'جديد هنا؟',
    'login.signUp': 'إنشاء حساب',

    'signup.title': 'إنشاء حساب',
    'signup.welcome': 'أنشئ حسابك وابدأ في توفير الوقت!',
    'signup.username': 'اسم المستخدم',
    'signup.phoneNumber': 'رقم الهاتف',
    'signup.password': 'كلمة المرور',
    'signup.confirmPassword': 'تأكيد كلمة المرور',
    'signup.agreeTerms': 'باستخدام هذا الموقع، فإنك توافق على شروط الخدمة وسياسة الخصوصية',
    'signup.signupButton': 'إنشاء حساب',
    'signup.haveAccount': 'لديك حساب بالفعل؟',
    'signup.login': 'تسجيل الدخول',

    // Cart Modal
    'cartModal.title': 'سلة التسوق',
    'cartModal.empty': 'سلتك فارغة حالياً',
    'cartModal.emptyDescription': 'أضف بعض المنتجات للبدء!',
    'cartModal.continueShopping': 'متابعة التسوق',
    'cartModal.subtotal': 'المجموع الفرعي:',
    'cartModal.deliveryFee': 'رسوم التوصيل:',
    'cartModal.total': 'المجموع:',
    'cartModal.viewCart': 'عرض كامل للسلة',
    'cartModal.checkout': 'إتمام الطلب',
    'cartModal.free': 'مجاني',

    // Account
    'account.title': 'تفاصيل الحساب',
    'account.subtitle': 'إدارة معلوماتك الشخصية وإعدادات الأمان',
    'account.profile': 'معلومات الملف الشخصي',
    'account.name': 'الاسم',
    'account.phone': 'رقم الهاتف',
    'account.saveProfile': 'حفظ الملف الشخصي',
    'account.changePassword': 'تغيير كلمة المرور',
    'account.oldPassword': 'كلمة المرور القديمة',
    'account.newPassword': 'كلمة المرور الجديدة',
    'account.changePasswordButton': 'تغيير كلمة المرور',
    'account.logout': 'تسجيل الخروج',
    'account.confirmLogout': 'هل أنت متأكد أنك تريد تسجيل الخروج؟',

    // Orders
    'orders.title': 'طلباتي',
    'orders.empty': 'لا توجد طلبات',
    'orders.emptyDescription': 'لم تقم بإجراء أي طلبات بعد.',
    'orders.startShopping': 'ابدأ التسوق',
    'orders.orderNumber': 'طلب رقم #',
    'orders.placedOn': 'تم الطلب في',
    'orders.items': 'عناصر',
    'orders.details': 'التفاصيل',
    'orders.status': 'الحالة',
    'orders.delivered': 'تم التوصيل',
    'orders.inTransit': 'قيد التوصيل',
    'orders.processing': 'قيد المعالجة',

    // Favorites
    'favorites.title': 'المفضلة',
    'favorites.empty': 'لا توجد منتجات في المفضلة',
    'favorites.emptyDescription': 'ابدأ بإضافة المنتجات إلى المفضلة لتراها هنا.',
    'favorites.startShopping': 'ابدأ التسوق',

    // Compare
    'compare.title': 'مقارنة المنتجات',
    'compare.empty': 'لا توجد منتجات للمقارنة',
    'compare.emptyDescription': 'اختر المنتجات لبدء المقارنة.',
    'compare.features': 'المميزات',
    'compare.addToCompare': 'أضف للمقارنة',
    'compare.maxProducts': 'الحد الأقصى 3 منتجات',
    'compare.selectProducts': 'اختر المنتجات للمقارنة',

    // Checkout
    'checkout.title': 'إتمام الطلب',
    'checkout.personalInfo': 'المعلومات الشخصية',
    'checkout.firstName': 'الاسم الأول',
    'checkout.lastName': 'الاسم الأخير',
    'checkout.phoneNumber': 'رقم الهاتف',
    'checkout.deliveryAddress': 'عنوان التوصيل',
    'checkout.address': 'العنوان',
    'checkout.city': 'المدينة',
    'checkout.region': 'المنطقة',
    'checkout.apartment': 'شقة، جناح، إلخ. (اختياري)',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.cash': 'الدفع عند الاستلام',
    'checkout.cashDescription': 'ادفع عند استلام طلبك',
    'checkout.card': 'بطاقة ائتمان',
    'checkout.cardDescription': 'ادفع بأمان باستخدام بطاقة الائتمان الخاصة بك',
    'checkout.selectPayment': 'اختر خيار الدفع:',
    'checkout.continuePayment': 'متابعة إلى الدفع',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.errorProcessing': 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',

    // Buy Now
    'buyNow.title': 'إتمام عملية الشراء',
    'buyNow.productOptions': 'خيارات المنتج',
    'buyNow.color': 'اللون',
    'buyNow.size': 'الحجم',
    'buyNow.quantity': 'الكمية',
    'buyNow.pricePerItem': 'السعر لكل قطعة:',
    'buyNow.personalInfo': 'المعلومات الشخصية',
    'buyNow.deliveryAddress': 'عنوان التوصيل',
    'buyNow.paymentMethod': 'طريقة الدفع',
    'buyNow.completePurchase': 'إتمام الشراء',
    'buyNow.orderSummary': 'ملخص الطلب',
    'buyNow.unitPrice': 'سعر الوحدة:',
    'buyNow.quantity': 'الكمية:',
    'buyNow.subtotal': 'المجموع الفرعي:',
    'buyNow.deliveryFee': 'رسوم التوصيل:',
    'buyNow.freeDelivery': 'توصيل مجاني للطلبات التي تزيد عن 500 جنيه!',
    'buyNow.secureCheckout': 'دفع آمن',
    'buyNow.securePayment': 'معلومات الدفع الخاصة بك محمية بتشفير قياسي للصناعة.',

    // Order Confirmation
    'orderConfirm.title': 'تم تأكيد الطلب!',
    'orderConfirm.thankYou': 'شكراً لشرائك. تم وضع طلبك بنجاح.',
    'orderConfirm.orderDetails': 'تفاصيل الطلب',
    'orderConfirm.orderId': 'رقم الطلب:',
    'orderConfirm.product': 'المنتج:',
    'orderConfirm.color': 'اللون:',
    'orderConfirm.size': 'الحجم:',
    'orderConfirm.quantity': 'الكمية:',
    'orderConfirm.paymentMethod': 'طريقة الدفع:',
    'orderConfirm.total': 'المجموع:',
    'orderConfirm.confirmationCall': 'ستتلقى مكالمة تأكيد خلال 30 دقيقة للتحقق من تفاصيل طلبك.',
    'orderConfirm.viewOrders': 'عرض طلباتي',
    'orderConfirm.continueShopping': 'متابعة التسوق',

    // Forgot Password
    'forgotPassword.title': 'نسيت كلمة المرور',
    'forgotPassword.enterPhone': 'أدخل رقم الهاتف',
    'forgotPassword.sendOTP': 'سنرسل لك رمز التحقق لإعادة تعيين كلمة المرور',
    'forgotPassword.phoneNumber': 'رقم الهاتف',
    'forgotPassword.sendOTPButton': 'إرسال رمز التحقق',
    'forgotPassword.enterOTP': 'أدخل رمز التحقق',
    'forgotPassword.otpSentTo': 'أدخل الرمز المكون من 6 أرقام المرسل إلى',
    'forgotPassword.otpCode': 'رمز التحقق',
    'forgotPassword.verifyOTP': 'تحقق من الرمز',
    'forgotPassword.back': 'رجوع',
    'forgotPassword.didntReceive': 'لم تستلم الرمز؟ إعادة إرسال',
    'forgotPassword.resetPassword': 'إعادة تعيين كلمة المرور',
    'forgotPassword.enterNewPassword': 'أدخل كلمة المرور الجديدة',
    'forgotPassword.newPassword': 'كلمة المرور الجديدة',
    'forgotPassword.confirmPassword': 'تأكيد كلمة المرور',
    'forgotPassword.savePassword': 'حفظ كلمة المرور',
    'forgotPassword.passwordReset': 'تم إعادة تعيين كلمة المرور بنجاح!',
    'forgotPassword.resetSuccess': 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    'forgotPassword.backToHome': 'العودة إلى الرئيسية',
    'forgotPassword.rememberPassword': 'تتذكر كلمة المرور؟',
    'forgotPassword.signIn': 'تسجيل الدخول',

    // Top Bar
    'topbar.offers': 'عروض وخصومات',
    'topbar.delivery': 'توصيل سريع خلال 24 ساعة',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update document direction and language when language changes
  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add/remove Arabic font class
    if (isRTL) {
      document.body.classList.add('arabic-font');
    } else {
      document.body.classList.remove('arabic-font');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const isRTL = language === 'ar';

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};