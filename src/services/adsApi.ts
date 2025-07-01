// Advertisement API service for fetching banner data from RAFAL backend
export interface AdBanner {
  id: string;
  title: string;
  description?: string;
  image_ad: string;
  link?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
}

export class AdsService {
  private static readonly API_BASE_URL = 'http://localhost:8000';
  private static readonly ADS_ENDPOINT = '/api/ads/';
  private static readonly CACHE_KEY = 'rafal_ads_cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  // Fallback banner data for when API is unavailable
  private static getFallbackBanners(): AdBanner[] {
    return [
      {
        id: 'fallback-1',
        title: 'RAFAL Electric - Premium Appliances',
        description: 'Discover our latest collection of high-quality electrical appliances',
        image_ad: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1200',
        link: '/products',
        isActive: true,
        priority: 1
      },
      {
        id: 'fallback-2',
        title: 'Special Offers & Discounts',
        description: 'Save up to 30% on selected RAFAL Electric products',
        image_ad: 'https://images.pexels.com/photos/4107252/pexels-photo-4107252.jpeg?auto=compress&cs=tinysrgb&w=1200',
        link: '/products',
        isActive: true,
        priority: 2
      },
      {
        id: 'fallback-3',
        title: 'Free Delivery & Installation',
        description: 'Enjoy free delivery and professional installation on all orders',
        image_ad: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1200',
        link: '/products',
        isActive: true,
        priority: 3
      }
    ];
  }

  // Fetch advertisements from RAFAL API
  static async fetchAds(): Promise<AdBanner[]> {
    try {
      console.log('🔄 Fetching advertisements from RAFAL API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.ADS_ENDPOINT}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Raw API response:', data);

      // Transform API response to our AdBanner interface
      const ads = this.transformApiResponse(data);
      
      if (ads.length > 0) {
        // Cache the successful response
        this.cacheAds(ads);
        console.log(`✅ Successfully fetched ${ads.length} advertisements from RAFAL API`);
        return ads;
      } else {
        console.warn('⚠️ API returned no active advertisements, using fallback');
        return this.getFallbackBanners();
      }

    } catch (error) {
      console.error('❌ Error fetching advertisements:', error);
      
      // Try to return cached data as fallback
      const cachedAds = this.getCachedAds();
      if (cachedAds.length > 0) {
        console.log('💾 Using cached advertisements as fallback');
        return cachedAds;
      }
      
      // Return fallback banners if no cache available
      console.log('🔄 Using fallback advertisements');
      return this.getFallbackBanners();
    }
  }

  // Transform API response to standardized format
  private static transformApiResponse(data: any): AdBanner[] {
    if (!data) {
      console.warn('⚠️ API returned null or undefined data');
      return [];
    }

    // Handle different possible API response structures
    let adsArray: any[] = [];
    
    if (Array.isArray(data)) {
      adsArray = data;
      console.log(`📋 API response is direct array with ${data.length} items`);
    } else if (data.results && Array.isArray(data.results)) {
      adsArray = data.results;
      console.log(`📋 API response has results property with ${data.results.length} items`);
    } else if (typeof data === 'object') {
      // If it's a single ad object, wrap it in an array
      adsArray = [data];
      console.log('📋 API response is single object, wrapping in array');
    } else {
      console.warn('⚠️ Unrecognized API response structure:', typeof data, data);
      return [];
    }

    console.log(`🔄 Processing ${adsArray.length} advertisement items`);

    const transformedAds = adsArray
      .filter(ad => {
        if (!ad || typeof ad !== 'object') {
          console.warn('⚠️ Skipping invalid ad item:', ad);
          return false;
        }
        return true;
      })
      .map((ad, index) => {
        const transformedAd = {
          id: ad.id?.toString() || `ad-${Date.now()}-${index}`,
          title: ad.title || 'RAFAL Advertisement',
          description: ad.description || '',
          image_ad: this.normalizeImageUrl(ad.image_ad),
          link: ad.link || '',
          isActive: this.parseActiveStatus(ad),
          priority: this.parsePriority(ad, index),
          startDate: ad.start_date,
          endDate: ad.end_date
        };
        
        console.log(`🔄 Transformed ad ${index + 1}:`, {
          id: transformedAd.id,
          title: transformedAd.title.substring(0, 50) + '...',
          hasImageAd: !!transformedAd.image_ad,
          isActive: transformedAd.isActive,
          priority: transformedAd.priority
        });
        
        return transformedAd;
      })
      .filter(ad => {
        const isValid = ad.isActive && ad.image_ad && ad.title;
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid ad:', {
            id: ad.id,
            hasTitle: !!ad.title,
            hasImageAd: !!ad.image_ad,
            isActive: ad.isActive
          });
        }
        return isValid;
      })
      .sort((a, b) => a.priority - b.priority); // Sort by priority

    console.log(`✅ Final result: ${transformedAds.length} valid advertisements`);
    return transformedAds;
  }

  // Parse active status from various possible fields
  private static parseActiveStatus(ad: any): boolean {
    if (ad.is_active !== undefined) return Boolean(ad.is_active);
    if (ad.isActive !== undefined) return Boolean(ad.isActive);
    
    // Check date ranges if available
    if (ad.start_date || ad.end_date) {
      const now = new Date();
      if (ad.start_date && new Date(ad.start_date) > now) return false;
      if (ad.end_date && new Date(ad.end_date) < now) return false;
    }
    
    // Default to true if no status field found
    return true;
  }

  // Parse priority from various possible fields
  private static parsePriority(ad: any, fallbackIndex: number): number {
    if (ad.priority !== undefined) return Number(ad.priority) || fallbackIndex;
    return fallbackIndex;
  }

  // Normalize image URLs to ensure they're absolute
  private static normalizeImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If relative URL, prepend the API base URL
    return imageUrl.startsWith('/') 
      ? `${this.API_BASE_URL}${imageUrl}` 
      : `${this.API_BASE_URL}/${imageUrl}`;
  }

  // Cache advertisements
  private static cacheAds(ads: AdBanner[]): void {
    try {
      const cacheData = {
        ads,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log(`💾 Cached ${ads.length} advertisements`);
    } catch (error) {
      console.warn('⚠️ Failed to cache advertisements:', error);
    }
  }

  // Get cached advertisements
  private static getCachedAds(): AdBanner[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('🗑️ Cache expired, removed cached advertisements');
        return [];
      }

      console.log(`💾 Retrieved ${cacheData.ads?.length || 0} cached advertisements`);
      return cacheData.ads || [];
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached advertisements:', error);
      return [];
    }
  }

  // Get all active banners
  static async getAllBanners(): Promise<AdBanner[]> {
    return this.fetchAds();
  }

  // Refresh cache
  static async refreshCache(): Promise<AdBanner[]> {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ Cache cleared, fetching fresh advertisements');
    return this.fetchAds();
  }

  // Check if ads are cached and valid
  static isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      const isValid = Date.now() - cacheData.timestamp <= this.CACHE_DURATION;
      console.log(`💾 Cache validity check: ${isValid}`);
      return isValid;
    } catch {
      return false;
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Testing RAFAL API connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.API_BASE_URL}${this.ADS_ENDPOINT}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `API returned status ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'RAFAL API connection successful',
        data: data
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('❌ Connection test failed:', message);
      
      return {
        success: false,
        message: message.includes('aborted') ? 'Connection timeout' : message
      };
    }
  }
}