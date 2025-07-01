import { Product } from '../types/Product';
import { ProductsService } from '../services/productsApi';

// Legacy static products data - kept for fallback
export const staticProducts: Product[] = [
  {
    id: '1',
    name: 'RAFAL Care Hair Dryer',
    price: 1600,
    originalPrice: 1999,
    image: 'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'beauty',
    categoryId: '4',
    rating: 4.5,
    reviews: 0,
    description: 'Professional hair dryer with advanced technology for salon-quality results at home.',
    features: [
      '2800W high airflow power',
      '2 speed levels + 2 heat settings',
      'Narrow and wide nozzles + diffuser',
      'Lightweight, ergonomic design',
      'Travel-friendly',
      'Removable back filter for easy cleaning',
      'Free shipping',
      'Order now before it runs out!'
    ],
    colors: ['Black', 'White', 'Pink'],
    inStock: true,
    isOffer: true,
    isBestSeller: false,
  },
  {
    id: '2',
    name: 'RAFAL Kitchen Mixer Pro',
    price: 2400,
    originalPrice: 2800,
    image: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'kitchen',
    categoryId: '1',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    isOffer: false,
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'RAFAL Steam Iron',
    price: 800,
    originalPrice: 1200,
    image: 'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'home',
    categoryId: '2',
    rating: 4.3,
    reviews: 89,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
  },
  {
    id: '4',
    name: 'RAFAL Blender Power',
    price: 1200,
    image: 'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'mixers',
    categoryId: '3',
    rating: 4.6,
    reviews: 234,
    inStock: true,
    isOffer: false,
    isBestSeller: true,
  },
  {
    id: '5',
    name: 'RAFAL Coffee Maker Deluxe',
    price: 1800,
    originalPrice: 2200,
    image: 'https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'kitchen',
    categoryId: '1',
    rating: 4.7,
    reviews: 98,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
  },
  {
    id: '6',
    name: 'RAFAL Vacuum Cleaner',
    price: 3200,
    image: 'https://images.pexels.com/photos/4107252/pexels-photo-4107252.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'cleaning',
    categoryId: '5',
    rating: 4.4,
    reviews: 67,
    inStock: true,
    isOffer: false,
    isBestSeller: false,
  },
  {
    id: '7',
    name: 'RAFAL Microwave Oven',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'kitchen',
    categoryId: '1',
    rating: 4.5,
    reviews: 142,
    inStock: true,
    isOffer: true,
    isBestSeller: true,
  },
  {
    id: '8',
    name: 'RAFAL Electric Kettle',
    price: 600,
    originalPrice: 800,
    image: 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'kitchen',
    categoryId: '1',
    rating: 4.2,
    reviews: 78,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
  }
];

// Dynamic products from RAFAL API
let cachedProducts: Product[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Get all products from RAFAL API with fallback to static data
export const getProducts = async (): Promise<Product[]> => {
  try {
    // Check if we have fresh cached data
    if (cachedProducts.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
      console.log('📦 Using cached RAFAL products');
      return cachedProducts;
    }

    console.log('🔄 Fetching fresh products from RAFAL API...');
    const freshProducts = await ProductsService.getAllProducts();
    
    if (freshProducts.length > 0) {
      cachedProducts = freshProducts;
      lastFetchTime = Date.now();
      console.log(`✅ Successfully loaded ${freshProducts.length} products from RAFAL API`);
      return freshProducts;
    } else {
      console.warn('⚠️ No products from API, using static fallback');
      return staticProducts;
    }
  } catch (error) {
    console.error('❌ Error fetching products from RAFAL API:', error);
    console.log('🔄 Using static products as fallback');
    return staticProducts;
  }
};

// Legacy export for backward compatibility
export const products = staticProducts;

// Get product by ID from RAFAL API or static data - Updated to use new API endpoint
export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    console.log(`🔍 Fetching product details for ID: ${id}`);
    
    // Use the new ProductsService method that calls the dedicated endpoint
    const product = await ProductsService.getProductById(id);
    
    if (product) {
      console.log(`✅ Found product: ${product.name}`);
      return product;
    } else {
      console.warn(`⚠️ Product with ID ${id} not found in RAFAL API`);
      // Fallback to static products
      return staticProducts.find(product => product.id === id);
    }
  } catch (error) {
    console.error('❌ Error getting product by ID:', error);
    // Fallback to static products
    return staticProducts.find(product => product.id === id);
  }
};

// Get products by category from RAFAL API - Updated to use category-specific endpoint
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    console.log(`🔍 Fetching products for category: ${categoryId}`);
    
    // Use the new category-specific API endpoint
    const products = await ProductsService.getProductsByCategory(categoryId);
    
    if (products.length > 0) {
      console.log(`✅ Found ${products.length} products for category ${categoryId}`);
      return products;
    } else {
      console.warn(`⚠️ No products found for category ${categoryId} in RAFAL API`);
      // Fallback to static products filtered by category
      return staticProducts.filter(product => 
        product.category === categoryId || product.categoryId === categoryId
      );
    }
  } catch (error) {
    console.error(`❌ Error getting products for category ${categoryId}:`, error);
    // Fallback to static products filtered by category
    return staticProducts.filter(product => 
      product.category === categoryId || product.categoryId === categoryId
    );
  }
};

// Get featured products from RAFAL API or static data
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔍 Fetching featured products from RAFAL API...');
    const featuredProducts = await ProductsService.getFeaturedProducts();
    
    if (featuredProducts.length > 0) {
      console.log(`✅ Found ${featuredProducts.length} featured products`);
      return featuredProducts;
    } else {
      console.warn('⚠️ No featured products found in RAFAL API, using fallback');
      return staticProducts.filter(product => product.isBestSeller || product.isOffer).slice(0, 8);
    }
  } catch (error) {
    console.error('Error getting featured products:', error);
    return staticProducts.filter(product => product.isBestSeller || product.isOffer).slice(0, 8);
  }
};

// Get best seller products from RAFAL API or static data
export const getBestSellerProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔍 Fetching best seller products from RAFAL API...');
    const bestSellerProducts = await ProductsService.getBestSellerProducts();
    
    if (bestSellerProducts.length > 0) {
      console.log(`✅ Found ${bestSellerProducts.length} best seller products`);
      return bestSellerProducts;
    } else {
      console.warn('⚠️ No best seller products found in RAFAL API, using fallback');
      return staticProducts.filter(product => product.isBestSeller).slice(0, 8);
    }
  } catch (error) {
    console.error('Error getting best seller products:', error);
    return staticProducts.filter(product => product.isBestSeller).slice(0, 8);
  }
};

// Get category name mapping for display
export const getCategoryName = (categoryId: string): string => {
  const categoryNames: Record<string, string> = {
    '1': 'Kitchen Appliances',
    '2': 'Home Appliances', 
    '3': 'Mixers & Blenders',
    '4': 'Beauty & Care',
    '5': 'Cleaning Appliances',
    // Legacy string-based IDs
    kitchen: 'Kitchen Appliances',
    home: 'Home Appliances',
    mixers: 'Mixers & Blenders',
    beauty: 'Beauty & Care',
    cleaning: 'Cleaning Appliances',
  };
  return categoryNames[categoryId] || 'Products';
};

// Get all unique categories from products
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const allProducts = await getProducts();
    const categories = [...new Set(allProducts.map(product => product.categoryId || product.category))];
    return categories.filter(cat => cat); // Remove any undefined/null values
  } catch (error) {
    console.error('Error getting product categories:', error);
    const categories = [...new Set(staticProducts.map(product => product.categoryId || product.category))];
    return categories.filter(cat => cat);
  }
};

// Refresh products cache
export const refreshProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔄 Refreshing products cache...');
    cachedProducts = [];
    lastFetchTime = 0;
    const freshProducts = await ProductsService.refreshCache();
    cachedProducts = freshProducts;
    lastFetchTime = Date.now();
    console.log(`✅ Successfully refreshed ${freshProducts.length} products`);
    return freshProducts;
  } catch (error) {
    console.error('❌ Error refreshing products:', error);
    return staticProducts;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    return await ProductsService.searchProducts(query);
  } catch (error) {
    console.error('Error searching products:', error);
    const searchTerm = query.toLowerCase();
    return staticProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
};