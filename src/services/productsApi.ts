// Products API service for fetching product data from RAFAL backend
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  additional_images?: string[]; // Raw field from API
  category: string;
  category_name?: string;
  categoryId?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isOffer?: boolean;
  isBestSeller?: boolean;
  features?: string[];
  colors?: string[];
  color?: Array<{
    id: number;
    hex_value: string;
    quantity: number;
    price: number;
    old_price?: number;
    images?: Array<{
      id: number;
      image: string;
    }>;
  }>; // Raw API color data with hex values
  brand?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  tags?: string[];
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export class ProductsService {
  private static readonly API_BASE_URL = 'http://localhost:8000';
  private static readonly PRODUCTS_ENDPOINT = '/api/products/';
  private static readonly CACHE_KEY = 'rafal_products_cache';
  private static readonly PRODUCT_DETAILS_CACHE_KEY = 'rafal_product_details_cache';
  private static readonly CATEGORY_PRODUCTS_CACHE_KEY = 'rafal_category_products_cache';
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Default headers for API requests
  private static getHeaders(): HeadersInit {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };
  }

  // Fallback product data for when API is unavailable
  private static getFallbackProducts(): Product[] {
    return [
      {
        id: 'fallback-1',
        name: 'RAFAL Care Hair Dryer',
        description: 'Professional hair dryer with advanced technology for salon-quality results at home.',
        price: 1600,
        original_price: 1999,
        image: 'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'beauty',
        category_name: 'Beauty & Care',
        categoryId: '4',
        rating: 4.5,
        reviews: 0,
        inStock: true,
        isOffer: true,
        isBestSeller: false,
        features: [
          '2800W high airflow power',
          '2 speed levels + 2 heat settings',
          'Narrow and wide nozzles + diffuser',
          'Lightweight, ergonomic design'
        ],
        color: [
          {
            id: 1,
            hex_value: '#000000',
            quantity: 100,
            price: 1600,
            old_price: 1999
          },
          {
            id: 2,
            hex_value: '#ffffff',
            quantity: 50,
            price: 1650,
            old_price: 2049
          }
        ]
      },
      {
        id: 'fallback-2',
        name: 'RAFAL Kitchen Mixer Pro',
        description: 'Professional kitchen mixer for all your cooking needs.',
        price: 2400,
        original_price: 2800,
        image: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'kitchen',
        category_name: 'Kitchen Appliances',
        categoryId: '1',
        rating: 4.8,
        reviews: 156,
        inStock: true,
        isOffer: false,
        isBestSeller: true,
        color: [
          {
            id: 3,
            hex_value: '#c0c0c0',
            quantity: 75,
            price: 2400,
            old_price: 2800
          },
          {
            id: 4,
            hex_value: '#000000',
            quantity: 25,
            price: 2450,
            old_price: 2850
          }
        ]
      },
      {
        id: 'fallback-3',
        name: 'RAFAL Steam Iron',
        description: 'High-quality steam iron for perfect results.',
        price: 800,
        original_price: 1200,
        image: 'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'home',
        category_name: 'Home Appliances',
        categoryId: '2',
        rating: 4.3,
        reviews: 89,
        inStock: true,
        isOffer: true,
        isBestSeller: false,
        color: [
          {
            id: 5,
            hex_value: '#0000ff',
            quantity: 60,
            price: 800,
            old_price: 1200
          },
          {
            id: 6,
            hex_value: '#ffffff',
            quantity: 40,
            price: 820,
            old_price: 1220
          }
        ]
      }
    ];
  }

  // Fetch products by category ID from RAFAL API
  static async fetchProductsByCategory(categoryId: string, page: number = 1, pageSize: number = 50): Promise<ProductsResponse> {
    try {
      console.log(`🔄 Fetching products for category ${categoryId} from RAFAL API (page ${page})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?category=${categoryId}&page=${page}&page_size=${pageSize}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Category Products API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Category Products API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📦 Raw Category Products API response for category ${categoryId}:`, data);

      // Transform API response to our Product interface
      const productsResponse = this.transformApiResponse(data);
      
      if (productsResponse.results.length > 0) {
        // Cache the successful response
        this.cacheCategoryProducts(categoryId, productsResponse.results, page);
        console.log(`✅ Successfully fetched ${productsResponse.results.length} products for category ${categoryId} from RAFAL API`);
        return productsResponse;
      } else {
        console.warn(`⚠️ Category Products API returned no products for category ${categoryId}, using fallback`);
        const fallbackProducts = this.getFallbackProducts().filter(p => p.categoryId === categoryId || p.category === categoryId);
        return {
          count: fallbackProducts.length,
          next: null,
          previous: null,
          results: fallbackProducts
        };
      }

    } catch (error) {
      console.error(`❌ Error fetching products for category ${categoryId}:`, error);
      
      // Try to return cached data as fallback
      const cachedProducts = this.getCachedCategoryProducts(categoryId);
      if (cachedProducts.length > 0) {
        console.log(`💾 Using cached products for category ${categoryId} as fallback`);
        return {
          count: cachedProducts.length,
          next: null,
          previous: null,
          results: cachedProducts
        };
      }
      
      // Return fallback products if no cache available
      console.log(`🔄 Using fallback products for category ${categoryId}`);
      const fallbackProducts = this.getFallbackProducts().filter(p => p.categoryId === categoryId || p.category === categoryId);
      return {
        count: fallbackProducts.length,
        next: null,
        previous: null,
        results: fallbackProducts
      };
    }
  }

  // Fetch all products in a category (handle pagination automatically)
  static async fetchAllProductsByCategory(categoryId: string, maxProducts: number = 200): Promise<Product[]> {
    try {
      const allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && allProducts.length < maxProducts) {
        const response = await this.fetchProductsByCategory(categoryId, page, 50);
        allProducts.push(...response.results);
        
        hasMore = !!response.next && allProducts.length < maxProducts;
        page++;
        
        console.log(`📄 Fetched page ${page - 1} for category ${categoryId}, total products: ${allProducts.length}`);
      }

      console.log(`✅ Successfully fetched ${allProducts.length} total products for category ${categoryId} from RAFAL API`);
      return allProducts.slice(0, maxProducts);
    } catch (error) {
      console.error(`❌ Error fetching all products for category ${categoryId}:`, error);
      return this.getFallbackProducts().filter(p => p.categoryId === categoryId || p.category === categoryId);
    }
  }

  // Cache category products
  private static cacheCategoryProducts(categoryId: string, products: Product[], page: number = 1): void {
    try {
      const cacheData = {
        products,
        categoryId,
        page,
        timestamp: Date.now()
      };
      localStorage.setItem(`${this.CATEGORY_PRODUCTS_CACHE_KEY}_${categoryId}_page_${page}`, JSON.stringify(cacheData));
      console.log(`💾 Cached ${products.length} products for category ${categoryId} page ${page}`);
    } catch (error) {
      console.warn('⚠️ Failed to cache category products:', error);
    }
  }

  // Get cached category products
  private static getCachedCategoryProducts(categoryId: string, page: number = 1): Product[] {
    try {
      const cached = localStorage.getItem(`${this.CATEGORY_PRODUCTS_CACHE_KEY}_${categoryId}_page_${page}`);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(`${this.CATEGORY_PRODUCTS_CACHE_KEY}_${categoryId}_page_${page}`);
        console.log(`🗑️ Category products cache expired for category ${categoryId} page ${page}, removed cached products`);
        return [];
      }

      console.log(`💾 Retrieved ${cacheData.products?.length || 0} cached products for category ${categoryId} page ${page}`);
      return cacheData.products || [];
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached category products:', error);
      return [];
    }
  }

  // Fetch single product details by ID from RAFAL API
  static async fetchProductDetails(productId: string): Promise<Product | null> {
    try {
      console.log(`🔄 Fetching product details for ID ${productId} from RAFAL API...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}${productId}/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Product Details API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ Product with ID ${productId} not found`);
          return null;
        }
        throw new Error(`Product Details API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Raw Product Details API response:', data);

      // Transform single product response
      const product = this.transformSingleProduct(data);
      
      if (product) {
        // Cache the successful response
        this.cacheProductDetails(product);
        console.log(`✅ Successfully fetched product details for ${product.name}`);
        return product;
      } else {
        console.warn(`⚠️ Failed to transform product data for ID ${productId}`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Error fetching product details for ID ${productId}:`, error);
      
      // Try to return cached data as fallback
      const cachedProduct = this.getCachedProductDetails(productId);
      if (cachedProduct) {
        console.log('💾 Using cached product details as fallback');
        return cachedProduct;
      }
      
      // Try to find in fallback products
      const fallbackProduct = this.getFallbackProducts().find(p => p.id === productId);
      if (fallbackProduct) {
        console.log('🔄 Using fallback product data');
        return fallbackProduct;
      }
      
      return null;
    }
  }

  // Transform single product from API response - Enhanced to handle color data
  private static transformSingleProduct(data: any): Product | null {
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Invalid product data received:', data);
      return null;
    }

    try {
      const transformedProduct: Product = {
        id: data.id?.toString() || `product-${Date.now()}`,
        name: data.name || 'Unnamed Product',
        description: data.description || '',
        price: this.parsePrice(data.price || 0),
        original_price: this.parsePrice(data.original_price),
        image: this.normalizeImageUrl(data.image),
        images: this.parseImages(data.images),
        additional_images: this.parseImages(data.images), // Keep raw field
        category: data.category?.toString() || '',
        category_name: data.category_name || '',
        categoryId: data.category?.toString() || '',
        rating: this.parseRating(data.rating || 0),
        reviews: data.reviews_count || 0,
        inStock: data.in_stock !== undefined ? Boolean(data.in_stock) : true,
        isOffer: data.is_offer !== undefined ? Boolean(data.is_offer) : false,
        isBestSeller: data.is_best_seller !== undefined ? Boolean(data.is_best_seller) : false,
        features: this.parseFeatures(data.features),
        colors: this.parseColors(data.colors),
        color: this.parseApiColors(data.colors), // Parse API color data with hex values
        brand: data.brand || 'RAFAL',
        sku: data.sku || '',
        weight: data.weight || '',
        dimensions: data.dimensions || '',
        warranty: data.warranty || '',
        tags: this.parseTags(data.tags)
      };

      console.log('🔄 Transformed single product:', {
        id: transformedProduct.id,
        name: transformedProduct.name,
        price: transformedProduct.price,
        hasImage: !!transformedProduct.image,
        additionalImagesCount: transformedProduct.images?.length || 0,
        colorOptionsCount: transformedProduct.color?.length || 0,
        inStock: transformedProduct.inStock,
        category: transformedProduct.category,
        categoryId: transformedProduct.categoryId
      });

      // Validate required fields
      if (!transformedProduct.name || transformedProduct.price <= 0) {
        console.warn('⚠️ Product missing required fields:', {
          hasName: !!transformedProduct.name,
          hasValidPrice: transformedProduct.price > 0
        });
        return null;
      }

      return transformedProduct;
    } catch (error) {
      console.error('❌ Error transforming single product:', error);
      return null;
    }
  }

  // Parse API color data with hex values and images
  private static parseApiColors(colors: any): Array<{
    id: number;
    hex_value: string;
    quantity: number;
    price: number;
    old_price?: number;
    images?: Array<{
      id: number;
      image: string;
    }>;
  }> {
    if (!Array.isArray(colors)) {
      return [];
    }

    return colors
      .filter(color => color && typeof color === 'object')
      .map(color => ({
        id: color.id || Math.random(),
        hex_value: color.hex_value || '#000000',
        quantity: parseInt(color.quantity || '0'),
        price: this.parsePrice(color.price || 0),
        old_price: color.old_price ? this.parsePrice(color.old_price) : undefined,
        images: this.parseColorImages(color.images)
      }))
      .filter(color => color.hex_value && color.hex_value.startsWith('#'));
  }

  // Parse color images from API
  private static parseColorImages(images: any): Array<{
    id: number;
    image: string;
  }> {
    if (!Array.isArray(images)) {
      return [];
    }

    return images
      .filter(img => img && typeof img === 'object')
      .map(img => ({
        id: img.id || Math.random(),
        image: this.normalizeImageUrl(img.image || '')
      }))
      .filter(img => img.image);
  }

  // Cache single product details
  private static cacheProductDetails(product: Product): void {
    try {
      const cacheData = {
        product,
        timestamp: Date.now()
      };
      localStorage.setItem(`${this.PRODUCT_DETAILS_CACHE_KEY}_${product.id}`, JSON.stringify(cacheData));
      console.log(`💾 Cached product details for ${product.id}`);
    } catch (error) {
      console.warn('⚠️ Failed to cache product details:', error);
    }
  }

  // Get cached product details
  private static getCachedProductDetails(productId: string): Product | null {
    try {
      const cached = localStorage.getItem(`${this.PRODUCT_DETAILS_CACHE_KEY}_${productId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(`${this.PRODUCT_DETAILS_CACHE_KEY}_${productId}`);
        console.log(`🗑️ Product details cache expired for ${productId}, removed cached data`);
        return null;
      }

      console.log(`💾 Retrieved cached product details for ${productId}`);
      return cacheData.product || null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached product details:', error);
      return null;
    }
  }

  // Fetch products from RAFAL API with pagination
  static async fetchProducts(page: number = 1, pageSize: number = 50): Promise<ProductsResponse> {
    try {
      console.log(`🔄 Fetching products from RAFAL API (page ${page})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?page=${page}&page_size=${pageSize}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Products API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Products API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Raw Products API response:', data);

      // Transform API response to our Product interface
      const productsResponse = this.transformApiResponse(data);
      
      if (productsResponse.results.length > 0) {
        // Cache the successful response
        this.cacheProducts(productsResponse.results, page);
        console.log(`✅ Successfully fetched ${productsResponse.results.length} products from RAFAL API`);
        return productsResponse;
      } else {
        console.warn('⚠️ Products API returned no products, using fallback');
        return {
          count: this.getFallbackProducts().length,
          next: null,
          previous: null,
          results: this.getFallbackProducts()
        };
      }

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // Try to return cached data as fallback
      const cachedProducts = this.getCachedProducts();
      if (cachedProducts.length > 0) {
        console.log('💾 Using cached products as fallback');
        return {
          count: cachedProducts.length,
          next: null,
          previous: null,
          results: cachedProducts
        };
      }
      
      // Return fallback products if no cache available
      console.log('🔄 Using fallback products');
      return {
        count: this.getFallbackProducts().length,
        next: null,
        previous: null,
        results: this.getFallbackProducts()
      };
    }
  }

  // Fetch all products (handle pagination automatically)
  static async fetchAllProducts(maxProducts: number = 200): Promise<Product[]> {
    try {
      const allProducts: Product[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && allProducts.length < maxProducts) {
        const response = await this.fetchProducts(page, 50);
        allProducts.push(...response.results);
        
        hasMore = !!response.next && allProducts.length < maxProducts;
        page++;
        
        console.log(`📄 Fetched page ${page - 1}, total products: ${allProducts.length}`);
      }

      console.log(`✅ Successfully fetched ${allProducts.length} total products from RAFAL API`);
      return allProducts.slice(0, maxProducts);
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      return this.getFallbackProducts();
    }
  }

  // Transform API response to standardized format - Enhanced to handle color data
  private static transformApiResponse(data: any): ProductsResponse {
    if (!data) {
      console.warn('⚠️ Products API returned null or undefined data');
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }

    // Handle paginated response structure
    const count = data.count || 0;
    const next = data.next || null;
    const previous = data.previous || null;
    
    // Get products array from various possible structures
    let productsArray: any[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      productsArray = data.results;
      console.log(`📋 Products API response has results property with ${data.results.length} items`);
    } else if (Array.isArray(data)) {
      productsArray = data;
      console.log(`📋 Products API response is direct array with ${data.length} items`);
    } else {
      console.warn('⚠️ Unrecognized Products API response structure:', typeof data, data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }

    console.log(`🔄 Processing ${productsArray.length} product items`);

    const transformedProducts = productsArray
      .filter(product => {
        if (!product || typeof product !== 'object') {
          console.warn('⚠️ Skipping invalid product item:', product);
          return false;
        }
        return true;
      })
      .map((product, index) => {
        const transformedProduct: Product = {
          id: product.id?.toString() || `product-${Date.now()}-${index}`,
          name: product.name || 'Unnamed Product',
          description: product.description || '',
          price: this.parsePrice(product.price || 0),
          original_price: this.parsePrice(product.original_price),
          image: this.normalizeImageUrl(product.image),
          images: this.parseImages(product.images),
          additional_images: this.parseImages(product.images), // Keep raw field
          category: product.category?.toString() || '',
          category_name: product.category_name || '',
          categoryId: product.category?.toString() || '',
          rating: this.parseRating(product.rating || 0),
          reviews: product.reviews_count || 0,
          inStock: product.in_stock !== undefined ? Boolean(product.in_stock) : true,
          isOffer: product.is_offer !== undefined ? Boolean(product.is_offer) : false,
          isBestSeller: product.is_best_seller !== undefined ? Boolean(product.is_best_seller) : false,
          features: this.parseFeatures(product.features),
          colors: this.parseColors(product.colors),
          color: this.parseApiColors(product.colors), // Parse API color data with hex values
          brand: product.brand || 'RAFAL',
          sku: product.sku || '',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warranty: product.warranty || '',
          tags: this.parseTags(product.tags)
        };
        
        console.log(`🔄 Transformed product ${index + 1}:`, {
          id: transformedProduct.id,
          name: transformedProduct.name.substring(0, 50) + '...',
          price: transformedProduct.price,
          hasImage: !!transformedProduct.image,
          additionalImagesCount: transformedProduct.images?.length || 0,
          colorOptionsCount: transformedProduct.color?.length || 0,
          inStock: transformedProduct.inStock,
          category: transformedProduct.category,
          categoryId: transformedProduct.categoryId
        });
        
        return transformedProduct;
      })
      .filter(product => {
        const isValid = product.name && product.price > 0;
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid product:', {
            id: product.id,
            hasName: !!product.name,
            hasValidPrice: product.price > 0
          });
        }
        return isValid;
      });

    console.log(`✅ Final result: ${transformedProducts.length} valid products`);
    
    return {
      count,
      next,
      previous,
      results: transformedProducts
    };
  }

  // Parse price from various formats
  private static parsePrice(price: any): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
      return isNaN(numericPrice) ? 0 : numericPrice;
    }
    return 0;
  }

  // Parse rating ensuring it's between 0-5
  private static parseRating(rating: any): number {
    const numericRating = parseFloat(rating) || 0;
    return Math.max(0, Math.min(5, numericRating));
  }

  // Parse features array
  private static parseFeatures(features: any): string[] {
    if (Array.isArray(features)) return features.map(f => String(f.feature || f));
    return [];
  }

  // Parse colors array
  private static parseColors(colors: any): string[] {
    if (Array.isArray(colors)) return colors.map(c => String(c.name || c));
    return [];
  }

  // Parse tags array
  private static parseTags(tags: any): string[] {
    if (Array.isArray(tags)) return tags.map(t => String(t.name || t));
    return [];
  }

  // Parse images array - Enhanced to handle additional_images field
  private static parseImages(images: any): string[] {
    if (Array.isArray(images)) {
      return images
        .map(img => {
          // Handle different image object structures
          if (typeof img === 'string') {
            return this.normalizeImageUrl(img);
          } else if (img && typeof img === 'object') {
            // Handle image objects with url, src, image, or path properties
            const imageUrl = img.image || '';
            return imageUrl ? this.normalizeImageUrl(imageUrl) : '';
          }
          return '';
        })
        .filter(url => url.length > 0);
    }
    
    return [];
  }

  // Normalize image URLs to ensure they're absolute
  private static normalizeImageUrl(imageUrl: any): string {
    // Check if imageUrl is null, undefined, or not a string
    if (!imageUrl || typeof imageUrl !== 'string') {
      return '';
    }
    
    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If relative URL, prepend the API base URL
    return imageUrl.startsWith('/') 
      ? `${this.API_BASE_URL}${imageUrl}` 
      : `${this.API_BASE_URL}/${imageUrl}`;
  }

  // Cache products
  private static cacheProducts(products: Product[], page: number = 1): void {
    try {
      const cacheData = {
        products,
        page,
        timestamp: Date.now()
      };
      localStorage.setItem(`${this.CACHE_KEY}_page_${page}`, JSON.stringify(cacheData));
      console.log(`💾 Cached ${products.length} products for page ${page}`);
    } catch (error) {
      console.warn('⚠️ Failed to cache products:', error);
    }
  }

  // Get cached products
  private static getCachedProducts(page: number = 1): Product[] {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_page_${page}`);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(`${this.CACHE_KEY}_page_${page}`);
        console.log(`🗑️ Products cache expired for page ${page}, removed cached products`);
        return [];
      }

      console.log(`💾 Retrieved ${cacheData.products?.length || 0} cached products for page ${page}`);
      return cacheData.products || [];
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached products:', error);
      return [];
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    return this.fetchAllProducts();
  }

  // Get products by category - Updated to use the new category-specific API endpoint
  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      console.log(`🔄 Fetching products for category ${categoryId} using RAFAL API...`);
      return this.fetchAllProductsByCategory(categoryId);
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categoryId}:`, error);
      return this.getFallbackProducts().filter(p => p.categoryId === categoryId || p.category === categoryId);
    }
  }

  // Get product by ID - Updated to use the new API endpoint
  static async getProductById(id: string): Promise<Product | null> {
    try {
      // First try to get from the dedicated product details endpoint
      const productFromApi = await this.fetchProductDetails(id);
      if (productFromApi) {
        return productFromApi;
      }

      // Fallback to searching in all products
      console.log(`🔄 Product ${id} not found via details API, searching in all products...`);
      const allProducts = await this.getAllProducts();
      return allProducts.find(product => product.id === id) || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // Get featured products
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      console.log('🔄 Fetching featured products from RAFAL API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}featured/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Featured Products API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response
      const featuredProducts = this.transformApiResponse(data);
      
      if (featuredProducts.results.length > 0) {
        console.log(`✅ Successfully fetched ${featuredProducts.results.length} featured products`);
        return featuredProducts.results;
      } else {
        console.warn('⚠️ No featured products found, using fallback');
        return this.getFallbackProducts().filter(p => p.isOffer || p.isBestSeller);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return this.getFallbackProducts().filter(p => p.isOffer || p.isBestSeller);
    }
  }

  // Get best seller products
  static async getBestSellerProducts(): Promise<Product[]> {
    try {
      console.log('🔄 Fetching best seller products from RAFAL API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}best_sellers/`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Best Seller Products API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response
      const bestSellerProducts = this.transformApiResponse(data);
      
      if (bestSellerProducts.results.length > 0) {
        console.log(`✅ Successfully fetched ${bestSellerProducts.results.length} best seller products`);
        return bestSellerProducts.results;
      } else {
        console.warn('⚠️ No best seller products found, using fallback');
        return this.getFallbackProducts().filter(p => p.isBestSeller);
      }
    } catch (error) {
      console.error('Error fetching best seller products:', error);
      return this.getFallbackProducts().filter(p => p.isBestSeller);
    }
  }

  // Refresh cache
  static async refreshCache(): Promise<Product[]> {
    // Clear all cached pages, product details, and category products
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.CACHE_KEY) || 
      key.startsWith(this.PRODUCT_DETAILS_CACHE_KEY) ||
      key.startsWith(this.CATEGORY_PRODUCTS_CACHE_KEY)
    );
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('🗑️ Products cache cleared, fetching fresh products');
    return this.fetchAllProducts();
  }

  // Check if products are cached and valid
  static isCacheValid(page: number = 1): boolean {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_page_${page}`);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      const isValid = Date.now() - cacheData.timestamp <= this.CACHE_DURATION;
      console.log(`💾 Products cache validity check for page ${page}: ${isValid}`);
      return isValid;
    } catch {
      return false;
    }
  }

  // Check if category products are cached and valid
  static isCategoryCacheValid(categoryId: string, page: number = 1): boolean {
    try {
      const cached = localStorage.getItem(`${this.CATEGORY_PRODUCTS_CACHE_KEY}_${categoryId}_page_${page}`);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      const isValid = Date.now() - cacheData.timestamp <= this.CACHE_DURATION;
      console.log(`💾 Category products cache validity check for category ${categoryId} page ${page}: ${isValid}`);
      return isValid;
    } catch {
      return false;
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Testing RAFAL Products API connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?page=1&page_size=1`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Products API returned status ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'RAFAL Products API connection successful',
        data: data
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('❌ Products API connection test failed:', message);
      
      return {
        success: false,
        message: message.includes('aborted') ? 'Connection timeout' : message
      };
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log(`🔄 Searching products with query: "${query}"...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?search=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response
      const searchResults = this.transformApiResponse(data);
      
      if (searchResults.results.length > 0) {
        console.log(`✅ Successfully found ${searchResults.results.length} products matching "${query}"`);
        return searchResults.results;
      } else {
        console.warn(`⚠️ No products found matching "${query}", using fallback search`);
        // Fallback to local search in cached products
        const allProducts = await this.getAllProducts();
        const searchTerm = query.toLowerCase();
        return allProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}