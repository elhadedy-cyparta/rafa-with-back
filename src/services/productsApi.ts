// Products API service for fetching product data from RAFAL backend
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  additional_images?: string[]; // Raw field from API
  category: string;
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
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly PRODUCTS_ENDPOINT = '/products/';
  private static readonly CACHE_KEY = 'rafal_products_cache';
  private static readonly PRODUCT_DETAILS_CACHE_KEY = 'rafal_product_details_cache';
  private static readonly CATEGORY_PRODUCTS_CACHE_KEY = 'rafal_category_products_cache';
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Simplified headers to avoid CORS issues
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
        originalPrice: 1999,
        image: 'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'beauty',
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
        originalPrice: 2800,
        image: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'kitchen',
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
        originalPrice: 1200,
        image: 'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
        images: [
          'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=400'
        ],
        category: 'home',
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
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?pagination=True&category_ids=${categoryId}&page=${page}&page_size=${pageSize}`;
      
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
        const fallbackProducts = this.getFallbackProducts().filter(p => p.categoryId === categoryId);
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
      const fallbackProducts = this.getFallbackProducts().filter(p => p.categoryId === categoryId);
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
      return this.getFallbackProducts().filter(p => p.categoryId === categoryId);
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
        id: data.id?.toString() || data.uuid?.toString() || data.sku || `product-${Date.now()}`,
        name: data.name || data.title || data.product_name || 'Unnamed Product',
        description: data.description || data.content || data.details || data.about_item || '',
        price: this.parsePrice(data.price || data.current_price || data.selling_price || 0),
        originalPrice: this.parsePrice(data.original_price || data.regular_price || data.list_price || data.old_price),
        image: this.normalizeImageUrl(data.image || data.main_image || data.thumbnail || data.featured_image),
        images: this.parseImages(data.images || data.gallery || data.additional_images),
        additional_images: this.parseImages(data.additional_images), // Keep raw field
        category: data.category || data.category_name || data.category_slug || 'general',
        categoryId: data.category_id?.toString() || data.categoryId?.toString(),
        rating: this.parseRating(data.rating || data.average_rating || data.stars || data.avg_rating || 0),
        reviews: parseInt(data.reviews || data.review_count || data.total_reviews || data.total_ratings_count || '0'),
        inStock: this.parseStockStatus(data),
        isOffer: this.parseOfferStatus(data),
        isBestSeller: this.parseBestSellerStatus(data),
        features: this.parseFeatures(data.features || data.specifications || data.attributes),
        colors: this.parseColors(data.colors || data.available_colors || data.color_options),
        color: this.parseApiColors(data.color), // Parse API color data with hex values
        brand: data.brand || data.manufacturer || 'RAFAL',
        sku: data.sku || data.product_code || data.item_code,
        weight: data.weight || data.weight_kg,
        dimensions: data.dimensions || data.size,
        warranty: data.warranty || data.warranty_period,
        tags: this.parseTags(data.tags || data.keywords)
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
        hex_value: color.hex_value || color.hexValue || color.color || '#000000',
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
        image: this.normalizeImageUrl(img.image || img.url || img.src)
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
      
      const url = `${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?pagination=True&page=${page}&page_size=${pageSize}`;
      
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
    const count = data.count || data.total || 0;
    const next = data.next || null;
    const previous = data.previous || data.prev || null;
    
    // Get products array from various possible structures
    let productsArray: any[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      productsArray = data.results;
      console.log(`📋 Products API response has results property with ${data.results.length} items`);
    } else if (data.data && Array.isArray(data.data)) {
      productsArray = data.data;
      console.log(`📋 Products API response has data property with ${data.data.length} items`);
    } else if (Array.isArray(data)) {
      productsArray = data;
      console.log(`📋 Products API response is direct array with ${data.length} items`);
    } else if (data.products && Array.isArray(data.products)) {
      productsArray = data.products;
      console.log(`📋 Products API response has products property with ${data.products.length} items`);
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
          id: product.id?.toString() || product.uuid?.toString() || product.sku || `product-${Date.now()}-${index}`,
          name: product.name || product.title || product.product_name || 'Unnamed Product',
          description: product.description || product.content || product.details || product.about_item || '',
          price: this.parsePrice(product.price || product.current_price || product.selling_price || 0),
          originalPrice: this.parsePrice(product.original_price || product.regular_price || product.list_price || product.old_price),
          image: this.normalizeImageUrl(product.image || product.main_image || product.thumbnail || product.featured_image),
          images: this.parseImages(product.images || product.gallery || product.additional_images),
          additional_images: this.parseImages(product.additional_images), // Keep raw field
          category: product.category || product.category_name || product.category_slug || 'general',
          categoryId: product.category_id?.toString() || product.categoryId?.toString(),
          rating: this.parseRating(product.rating || product.average_rating || product.stars || product.avg_rating || 0),
          reviews: parseInt(product.reviews || product.review_count || product.total_reviews || product.total_ratings_count || '0'),
          inStock: this.parseStockStatus(product),
          isOffer: this.parseOfferStatus(product),
          isBestSeller: this.parseBestSellerStatus(product),
          features: this.parseFeatures(product.features || product.specifications || product.attributes),
          colors: this.parseColors(product.colors || product.available_colors || product.color_options),
          color: this.parseApiColors(product.color), // Parse API color data with hex values
          brand: product.brand || product.manufacturer || 'RAFAL',
          sku: product.sku || product.product_code || product.item_code,
          weight: product.weight || product.weight_kg,
          dimensions: product.dimensions || product.size,
          warranty: product.warranty || product.warranty_period,
          tags: this.parseTags(product.tags || product.keywords)
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

  // Parse stock status from various possible fields
  private static parseStockStatus(product: any): boolean {
    if (product.inStock !== undefined) return Boolean(product.inStock);
    if (product.in_stock !== undefined) return Boolean(product.in_stock);
    if (product.available !== undefined) return Boolean(product.available);
    if (product.stock !== undefined) return Number(product.stock) > 0;
    if (product.quantity !== undefined) return Number(product.quantity) > 0;
    if (product.stock_quantity !== undefined) return Number(product.stock_quantity) > 0;
    
    // Check status field
    if (product.status !== undefined) {
      const status = product.status.toString().toLowerCase();
      return status === 'active' || status === 'available' || status === 'in_stock';
    }
    
    // Default to true if no stock field found
    return true;
  }

  // Parse offer status
  private static parseOfferStatus(product: any): boolean {
    if (product.isOffer !== undefined) return Boolean(product.isOffer);
    if (product.is_offer !== undefined) return Boolean(product.is_offer);
    if (product.on_sale !== undefined) return Boolean(product.on_sale);
    if (product.discounted !== undefined) return Boolean(product.discounted);
    
    // Check if there's a price difference indicating an offer
    const price = this.parsePrice(product.price || product.current_price);
    const originalPrice = this.parsePrice(product.original_price || product.regular_price || product.old_price);
    
    return originalPrice > 0 && price < originalPrice;
  }

  // Parse best seller status
  private static parseBestSellerStatus(product: any): boolean {
    if (product.isBestSeller !== undefined) return Boolean(product.isBestSeller);
    if (product.is_best_seller !== undefined) return Boolean(product.is_best_seller);
    if (product.bestseller !== undefined) return Boolean(product.bestseller);
    if (product.featured !== undefined) return Boolean(product.featured);
    if (product.popular !== undefined) return Boolean(product.popular);
    
    // Check if high rating/reviews indicate best seller
    const rating = this.parseRating(product.rating || product.average_rating || product.avg_rating);
    const reviews = parseInt(product.reviews || product.review_count || product.total_ratings_count || '0');
    
    return rating >= 4.5 && reviews >= 100;
  }

  // Parse features array
  private static parseFeatures(features: any): string[] {
    if (Array.isArray(features)) return features.map(f => String(f));
    if (typeof features === 'string') {
      return features.split(',').map(f => f.trim()).filter(f => f.length > 0);
    }
    return [];
  }

  // Parse colors array
  private static parseColors(colors: any): string[] {
    if (Array.isArray(colors)) return colors.map(c => String(c));
    if (typeof colors === 'string') {
      return colors.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
    return [];
  }

  // Parse tags array
  private static parseTags(tags: any): string[] {
    if (Array.isArray(tags)) return tags.map(t => String(t));
    if (typeof tags === 'string') {
      return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
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
            const imageUrl = img.url || img.src || img.image || img.path || img.file;
            return imageUrl ? this.normalizeImageUrl(imageUrl) : '';
          }
          return '';
        })
        .filter(url => url.length > 0);
    }
    
    if (typeof images === 'string') {
      // Handle comma-separated image URLs
      return images.split(',')
        .map(img => this.normalizeImageUrl(img.trim()))
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
      return this.getFallbackProducts().filter(p => p.categoryId === categoryId);
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
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => product.isBestSeller || product.isOffer).slice(0, 8);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return this.getFallbackProducts();
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
      
      const response = await fetch(`${this.API_BASE_URL}${this.PRODUCTS_ENDPOINT}?pagination=True&page=1&page_size=1`, {
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
      const allProducts = await this.getAllProducts();
      const searchTerm = query.toLowerCase();
      
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}