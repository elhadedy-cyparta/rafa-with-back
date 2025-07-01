// Category API service for fetching category data from RAFAL backend
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  wall_image?: string;
  cat_image?: string;
  isActive: boolean;
  order?: number;
}

export class CategoryService {
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly CATEGORY_ENDPOINT = '/category/';
  private static readonly CACHE_KEY = 'rafal_categories_cache';
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Default headers for API requests
  private static getHeaders(): HeadersInit {
    return {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    };
  }

  // Fallback category data for when API is unavailable
  private static getFallbackCategories(): Category[] {
    return [
      {
        id: 'kitchen',
        name: 'Kitchen Appliances',
        description: 'Essential kitchen appliances for modern cooking',
        wall_image: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
        cat_image: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        order: 1
      },
      {
        id: 'home',
        name: 'Home Appliances',
        description: 'Complete home solutions for comfortable living',
        wall_image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        cat_image: 'https://images.pexels.com/photos/5591576/pexels-photo-5591576.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        order: 2
      },
      {
        id: 'mixers',
        name: 'Mixers & Blenders',
        description: 'Professional mixing and blending solutions',
        wall_image: 'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg?auto=compress&cs=tinysrgb&w=800',
        cat_image: 'https://images.pexels.com/photos/4112236/pexels-photo-4112236.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        order: 3
      },
      {
        id: 'beauty',
        name: 'Beauty & Care',
        description: 'Personal care and beauty appliances',
        wall_image: 'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=800',
        cat_image: 'https://images.pexels.com/photos/7697820/pexels-photo-7697820.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        order: 4
      },
      {
        id: 'cleaning',
        name: 'Cleaning Appliances',
        description: 'Efficient cleaning solutions for your home',
        wall_image: 'https://images.pexels.com/photos/4107252/pexels-photo-4107252.jpeg?auto=compress&cs=tinysrgb&w=800',
        cat_image: 'https://images.pexels.com/photos/4107252/pexels-photo-4107252.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        order: 5
      }
    ];
  }

  // Fetch categories from RAFAL API
  static async fetchCategories(): Promise<Category[]> {
    try {
      console.log('🔄 Fetching categories from RAFAL API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.CATEGORY_ENDPOINT}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Category API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Category API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Raw Category API response:', data);

      // Transform API response to our Category interface
      const categories = this.transformApiResponse(data);
      
      if (categories.length > 0) {
        // Cache the successful response
        this.cacheCategories(categories);
        console.log(`✅ Successfully fetched ${categories.length} categories from RAFAL API`);
        return categories;
      } else {
        console.warn('⚠️ Category API returned no active categories, using fallback');
        return this.getFallbackCategories();
      }

    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      
      // Try to return cached data as fallback
      const cachedCategories = this.getCachedCategories();
      if (cachedCategories.length > 0) {
        console.log('💾 Using cached categories as fallback');
        return cachedCategories;
      }
      
      // Return fallback categories if no cache available
      console.log('🔄 Using fallback categories');
      return this.getFallbackCategories();
    }
  }

  // Transform API response to standardized format
  private static transformApiResponse(data: any): Category[] {
    if (!data) {
      console.warn('⚠️ Category API returned null or undefined data');
      return [];
    }

    // Handle different possible API response structures
    let categoriesArray: any[] = [];
    
    if (Array.isArray(data)) {
      categoriesArray = data;
      console.log(`📋 Category API response is direct array with ${data.length} items`);
    } else if (data.data && Array.isArray(data.data)) {
      categoriesArray = data.data;
      console.log(`📋 Category API response has data property with ${data.data.length} items`);
    } else if (data.results && Array.isArray(data.results)) {
      categoriesArray = data.results;
      console.log(`📋 Category API response has results property with ${data.results.length} items`);
    } else if (data.categories && Array.isArray(data.categories)) {
      categoriesArray = data.categories;
      console.log(`📋 Category API response has categories property with ${data.categories.length} items`);
    } else if (typeof data === 'object') {
      // If it's a single category object, wrap it in an array
      categoriesArray = [data];
      console.log('📋 Category API response is single object, wrapping in array');
    } else {
      console.warn('⚠️ Unrecognized Category API response structure:', typeof data, data);
      return [];
    }

    console.log(`🔄 Processing ${categoriesArray.length} category items`);

    const transformedCategories = categoriesArray
      .filter(category => {
        if (!category || typeof category !== 'object') {
          console.warn('⚠️ Skipping invalid category item:', category);
          return false;
        }
        return true;
      })
      .map((category, index) => {
        const transformedCategory = {
          id: category.id?.toString() || category.uuid?.toString() || category.slug || `category-${Date.now()}-${index}`,
          name: category.name || category.title || category.category_name || 'Unnamed Category',
          description: category.description || category.subtitle || category.content || '',
          image: this.normalizeImageUrl(category.image || category.image_url || category.thumbnail),
          wall_image: this.normalizeImageUrl(category.wall_image || category.wallImage || category.background_image),
          cat_image: this.normalizeImageUrl(category.cat_image || category.catImage || category.category_image),
          isActive: this.parseActiveStatus(category),
          order: this.parseOrder(category, index)
        };
        
        console.log(`🔄 Transformed category ${index + 1}:`, {
          id: transformedCategory.id,
          name: transformedCategory.name,
          hasWallImage: !!transformedCategory.wall_image,
          hasCatImage: !!transformedCategory.cat_image,
          isActive: transformedCategory.isActive,
          order: transformedCategory.order
        });
        
        return transformedCategory;
      })
      .filter(category => {
        const isValid = category.isActive && category.name;
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid category:', {
            id: category.id,
            hasName: !!category.name,
            isActive: category.isActive
          });
        }
        return isValid;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order

    console.log(`✅ Final result: ${transformedCategories.length} valid categories`);
    return transformedCategories;
  }

  // Parse active status from various possible fields
  private static parseActiveStatus(category: any): boolean {
    if (category.isActive !== undefined) return Boolean(category.isActive);
    if (category.active !== undefined) return Boolean(category.active);
    if (category.enabled !== undefined) return Boolean(category.enabled);
    if (category.published !== undefined) return Boolean(category.published);
    if (category.status !== undefined) {
      const status = category.status.toString().toLowerCase();
      return status === 'active' || status === 'published' || status === 'enabled';
    }
    
    // Default to true if no status field found
    return true;
  }

  // Parse order from various possible fields
  private static parseOrder(category: any, fallbackIndex: number): number {
    if (category.order !== undefined) return Number(category.order) || fallbackIndex;
    if (category.sort !== undefined) return Number(category.sort) || fallbackIndex;
    if (category.position !== undefined) return Number(category.position) || fallbackIndex;
    if (category.priority !== undefined) return Number(category.priority) || fallbackIndex;
    return fallbackIndex;
  }

  // Normalize image URLs to ensure they're absolute
  private static normalizeImageUrl(imageUrl: string): string {
    if (!imageUrl) {
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

  // Cache categories
  private static cacheCategories(categories: Category[]): void {
    try {
      const cacheData = {
        categories,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log(`💾 Cached ${categories.length} categories`);
    } catch (error) {
      console.warn('⚠️ Failed to cache categories:', error);
    }
  }

  // Get cached categories
  private static getCachedCategories(): Category[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('🗑️ Category cache expired, removed cached categories');
        return [];
      }

      console.log(`💾 Retrieved ${cacheData.categories?.length || 0} cached categories`);
      return cacheData.categories || [];
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached categories:', error);
      return [];
    }
  }

  // Get all active categories
  static async getAllCategories(): Promise<Category[]> {
    return this.fetchCategories();
  }

  // Refresh cache
  static async refreshCache(): Promise<Category[]> {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ Category cache cleared, fetching fresh categories');
    return this.fetchCategories();
  }

  // Check if categories are cached and valid
  static isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      const isValid = Date.now() - cacheData.timestamp <= this.CACHE_DURATION;
      console.log(`💾 Category cache validity check: ${isValid}`);
      return isValid;
    } catch {
      return false;
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Testing RAFAL Category API connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.API_BASE_URL}${this.CATEGORY_ENDPOINT}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Category API returned status ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'RAFAL Category API connection successful',
        data: data
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('❌ Category API connection test failed:', message);
      
      return {
        success: false,
        message: message.includes('aborted') ? 'Connection timeout' : message
      };
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getAllCategories();
      return categories.find(category => category.id === id) || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }
}