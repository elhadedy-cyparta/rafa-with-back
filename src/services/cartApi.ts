// Cart API service for interacting with RAFAL cart endpoints
import { Product } from '../types/Product';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color_id?: number;
  color_name?: string;
  color_hex?: string;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  total: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  session_key?: string;
  delivery: number; // Added delivery fee field
}

export class CartService {
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly CART_ENDPOINT = '/cart/';
  private static readonly ADD_TO_CART_ENDPOINT = '/cart/add-to-cart/';
  private static readonly REMOVE_FROM_CART_ENDPOINT = '/cart/remove-from-cart/';
  private static readonly GET_CART_ENDPOINT = '/cart/';
  private static readonly CACHE_KEY = 'rafal_cart_cache';
  private static readonly SESSION_KEY_STORAGE = 'rafal_cart_session_key';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // Track API requests to prevent duplicates
  private static pendingRequests: Record<string, Promise<any>> = {};

  // Get session key from storage or generate a new one
  private static getSessionKey(): string {
    let sessionKey = localStorage.getItem(this.SESSION_KEY_STORAGE);
    
    if (!sessionKey) {
      // Generate a new session key if none exists
      sessionKey = this.generateSessionKey();
      localStorage.setItem(this.SESSION_KEY_STORAGE, sessionKey);
      console.log('🔑 Generated new cart session key:', sessionKey);
    } else {
      console.log('🔑 Using existing cart session key:', sessionKey);
    }
    
    return sessionKey;
  }

  // Generate a new session key
  private static generateSessionKey(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

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

  // Add product to cart
  static async addToCart(productId: string, quantity: number = 1, colorId?: number): Promise<CartResponse | null> {
    const requestKey = `add-${productId}-${quantity}-${colorId || 'none'}`;
    
    // Check if there's already a pending request for this exact operation
    if (this.pendingRequests[requestKey]) {
      console.log(`🔄 Reusing pending add to cart request for product ${productId}`);
      return this.pendingRequests[requestKey];
    }
    
    try {
      console.log(`🔄 Adding product ${productId} to cart (quantity: ${quantity}, colorId: ${colorId || 'none'})...`);
      
      // Create the request promise
      this.pendingRequests[requestKey] = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Construct the URL with the product ID
        const url = `${this.API_BASE_URL}${this.ADD_TO_CART_ENDPOINT}${productId}/`;
        
        // Get session key
        const sessionKey = this.getSessionKey();
        
        // Prepare the request body
        const body: any = {
          quantity,
          session_key: sessionKey
        };
        
        // Add color_id if provided
        if (colorId) {
          body.color_id = colorId;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Add to Cart API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Add to Cart API request failed with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw Add to Cart API response:', data);

        // Transform API response to our CartResponse interface
        const cartResponse = this.transformCartResponse(data);
        
        if (cartResponse) {
          // Cache the successful response
          this.cacheCart(cartResponse);
          
          // Always update the session key from the response if available
          if (cartResponse.session_key) {
            localStorage.setItem(this.SESSION_KEY_STORAGE, cartResponse.session_key);
            console.log(`🔑 Updated session key from add to cart response: ${cartResponse.session_key}`);
          }
          
          // Store cart ID for future operations
          if (cartResponse.id) {
            localStorage.setItem('rafal_cart_id', cartResponse.id);
            console.log(`🛒 Updated cart ID: ${cartResponse.id}`);
          }
          
          console.log(`✅ Successfully added product ${productId} to cart`);
          return cartResponse;
        } else {
          console.warn(`⚠️ Failed to transform cart response for product ${productId}`);
          return null;
        }
      })();
      
      // Wait for the request to complete
      const result = await this.pendingRequests[requestKey];
      
      // Clear the pending request
      delete this.pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error(`❌ Error adding product ${productId} to cart:`, error);
      
      // Clear the pending request on error
      delete this.pendingRequests[requestKey];
      
      return null;
    }
  }

  // Remove product from cart
  static async removeFromCart(itemId: string): Promise<CartResponse | null> {
    const requestKey = `remove-${itemId}`;
    
    // Check if there's already a pending request for this exact operation
    if (this.pendingRequests[requestKey]) {
      console.log(`🔄 Reusing pending remove from cart request for item ${itemId}`);
      return this.pendingRequests[requestKey];
    }
    
    try {
      console.log(`🔄 Removing item ${itemId} from cart...`);
      
      // Create the request promise
      this.pendingRequests[requestKey] = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Get session key
        const sessionKey = this.getSessionKey();
        
        // Get cart ID from localStorage
        const cartId = localStorage.getItem('rafal_cart_id') || '';
        
        // Construct the URL with the cart ID and session key
        const url = `${this.API_BASE_URL}/cart/${cartId}/?session_key=${encodeURIComponent(sessionKey)}`;
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.getHeaders(),
          body: JSON.stringify({ cartitem_id: parseInt(itemId) }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Remove from Cart API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Remove from Cart API request failed with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw Remove from Cart API response:', data);

        // Transform API response to our CartResponse interface
        const cartResponse = this.transformCartResponse(data);
        
        if (cartResponse) {
          // Cache the successful response
          this.cacheCart(cartResponse);
          
          // Always update the session key from the response if available
          if (cartResponse.session_key) {
            localStorage.setItem(this.SESSION_KEY_STORAGE, cartResponse.session_key);
            console.log(`🔑 Updated session key from remove from cart response: ${cartResponse.session_key}`);
          }
          
          // Store cart ID for future operations
          if (cartResponse.id) {
            localStorage.setItem('rafal_cart_id', cartResponse.id);
            console.log(`🛒 Updated cart ID: ${cartResponse.id}`);
          }
          
          console.log(`✅ Successfully removed item ${itemId} from cart`);
          return cartResponse;
        } else {
          console.warn(`⚠️ Failed to transform cart response after removing item ${itemId}`);
          return null;
        }
      })();
      
      // Wait for the request to complete
      const result = await this.pendingRequests[requestKey];
      
      // Clear the pending request
      delete this.pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error(`❌ Error removing item ${itemId} from cart:`, error);
      
      // Clear the pending request on error
      delete this.pendingRequests[requestKey];
      
      return null;
    }
  }

  // Update cart item quantity
  static async updateCartItemQuantity(itemId: string, quantity: number): Promise<CartResponse | null> {
    const requestKey = `update-${itemId}-${quantity}`;
    
    // Check if there's already a pending request for this exact operation
    if (this.pendingRequests[requestKey]) {
      console.log(`🔄 Reusing pending update cart request for item ${itemId}`);
      return this.pendingRequests[requestKey];
    }
    
    try {
      console.log(`🔄 Updating quantity for item ${itemId} to ${quantity}...`);
      
      // Create the request promise
      this.pendingRequests[requestKey] = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Get session key
        const sessionKey = this.getSessionKey();
        
        // Get cart ID from localStorage
        const cartId = localStorage.getItem('rafal_cart_id') || '';
        
        // Construct the URL with the cart ID and session key
        const url = `${this.API_BASE_URL}/cart/${cartId}/?session_key=${encodeURIComponent(sessionKey)}`;
        
        // Get product ID from cart items
        let productId = '';
        try {
          const cachedCart = this.getCachedCart();
          if (cachedCart) {
            const cartItem = cachedCart.items.find(item => item.id === itemId);
            if (cartItem) {
              productId = cartItem.product_id;
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to get product ID from cached cart:', error);
        }
        
        if (!productId) {
          console.warn(`⚠️ Could not find product ID for cart item ${itemId}`);
        }
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ 
            product_id: parseInt(productId),
            quantity: quantity
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Update Cart API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Update Cart API request failed with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw Update Cart API response:', data);

        // Transform API response to our CartResponse interface
        const cartResponse = this.transformCartResponse(data);
        
        if (cartResponse) {
          // Cache the successful response
          this.cacheCart(cartResponse);
          
          // Always update the session key from the response if available
          if (cartResponse.session_key) {
            localStorage.setItem(this.SESSION_KEY_STORAGE, cartResponse.session_key);
            console.log(`🔑 Updated session key from update cart response: ${cartResponse.session_key}`);
          }
          
          // Store cart ID for future operations
          if (cartResponse.id) {
            localStorage.setItem('rafal_cart_id', cartResponse.id);
            console.log(`🛒 Updated cart ID: ${cartResponse.id}`);
          }
          
          console.log(`✅ Successfully updated quantity for item ${itemId} to ${quantity}`);
          return cartResponse;
        } else {
          console.warn(`⚠️ Failed to transform cart response after updating item ${itemId}`);
          return null;
        }
      })();
      
      // Wait for the request to complete
      const result = await this.pendingRequests[requestKey];
      
      // Clear the pending request
      delete this.pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error(`❌ Error updating quantity for item ${itemId}:`, error);
      
      // Clear the pending request on error
      delete this.pendingRequests[requestKey];
      
      return null;
    }
  }

  // Get cart contents
  static async getCart(): Promise<CartResponse | null> {
    const requestKey = 'get-cart';
    
    // Check if there's already a pending request for this exact operation
    if (this.pendingRequests[requestKey]) {
      console.log('🔄 Reusing pending get cart request');
      return this.pendingRequests[requestKey];
    }
    
    try {
      console.log('🔄 Fetching cart contents...');
      
      // Create the request promise
      this.pendingRequests[requestKey] = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Get session key
        const sessionKey = this.getSessionKey();
        
        // Add session key as query parameter
        const url = `${this.API_BASE_URL}${this.GET_CART_ENDPOINT}?session_key=${encodeURIComponent(sessionKey)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Get Cart API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Get Cart API request failed with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw Get Cart API response:', data);

        // Transform API response to our CartResponse interface
        const cartResponse = this.transformCartResponse(data);
        
        if (cartResponse) {
          // Cache the successful response
          this.cacheCart(cartResponse);
          
          // Always update the session key from the response if available
          if (cartResponse.session_key) {
            localStorage.setItem(this.SESSION_KEY_STORAGE, cartResponse.session_key);
            console.log(`🔑 Updated session key from get cart response: ${cartResponse.session_key}`);
          }
          
          // Store cart ID for future operations
          if (cartResponse.id) {
            localStorage.setItem('rafal_cart_id', cartResponse.id);
            console.log(`🛒 Updated cart ID: ${cartResponse.id}`);
          }
          
          console.log(`✅ Successfully fetched cart with ${cartResponse.items.length} items, delivery fee: ${cartResponse.delivery} EGP`);
          return cartResponse;
        } else {
          console.warn('⚠️ Failed to transform cart response');
          return null;
        }
      })();
      
      // Wait for the request to complete
      const result = await this.pendingRequests[requestKey];
      
      // Clear the pending request
      delete this.pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      
      // Clear the pending request on error
      delete this.pendingRequests[requestKey];
      
      // Try to return cached data as fallback
      const cachedCart = this.getCachedCart();
      if (cachedCart) {
        console.log('💾 Using cached cart as fallback');
        return cachedCart;
      }
      
      return null;
    }
  }

  // Clear cart
  static async clearCart(): Promise<CartResponse | null> {
    const requestKey = 'clear-cart';
    
    // Check if there's already a pending request for this exact operation
    if (this.pendingRequests[requestKey]) {
      console.log('🔄 Reusing pending clear cart request');
      return this.pendingRequests[requestKey];
    }
    
    try {
      console.log('🔄 Clearing cart...');
      
      // Create the request promise
      this.pendingRequests[requestKey] = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Get session key
        const sessionKey = this.getSessionKey();
        
        // Get cart ID from localStorage
        const cartId = localStorage.getItem('rafal_cart_id') || '';
        
        // Add session key as query parameter
        const url = `${this.API_BASE_URL}${this.CART_ENDPOINT}${cartId}/clear/?session_key=${encodeURIComponent(sessionKey)}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`📡 Clear Cart API Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`Clear Cart API request failed with status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Raw Clear Cart API response:', data);

        // Transform API response to our CartResponse interface
        const cartResponse = this.transformCartResponse(data);
        
        if (cartResponse) {
          // Cache the successful response
          this.cacheCart(cartResponse);
          
          // Always update the session key from the response if available
          if (cartResponse.session_key) {
            localStorage.setItem(this.SESSION_KEY_STORAGE, cartResponse.session_key);
            console.log(`🔑 Updated session key from clear cart response: ${cartResponse.session_key}`);
          }
          
          console.log('✅ Successfully cleared cart');
          return cartResponse;
        } else {
          console.warn('⚠️ Failed to transform cart response after clearing');
          return null;
        }
      })();
      
      // Wait for the request to complete
      const result = await this.pendingRequests[requestKey];
      
      // Clear the pending request
      delete this.pendingRequests[requestKey];
      
      return result;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      
      // Clear the pending request on error
      delete this.pendingRequests[requestKey];
      
      return null;
    }
  }

  // Transform API response to standardized format
  private static transformCartResponse(data: any): CartResponse | null {
    if (!data) {
      console.warn('⚠️ Cart API returned null or undefined data');
      return null;
    }

    try {
      // Handle different possible API response structures
      let cartData = data;
      
      // If data is an array, take the first item
      if (Array.isArray(data) && data.length > 0) {
        cartData = data[0];
        console.log('📋 Cart API response is an array, using first item');
      } else if (data.cart) {
        cartData = data.cart;
        console.log('📋 Cart API response has cart property');
      } else if (data.data && data.data.cart) {
        cartData = data.data.cart;
        console.log('📋 Cart API response has data.cart property');
      }

      // Extract cart items
      let cartItems: CartItem[] = [];
      
      if (Array.isArray(cartData.items)) {
        cartItems = cartData.items.map((item: any) => ({
          id: item.id?.toString() || item.cart_item_id?.toString() || `item-${Date.now()}-${Math.random()}`,
          product_id: item.product_id?.toString() || item.product?.id?.toString() || '',
          name: item.name || item.product_name || item.product?.name || 'Unnamed Product',
          price: this.parsePrice(item.price || item.product_price || item.product?.price || 0),
          quantity: parseInt(item.quantity || '1'),
          image: this.normalizeImageUrl(item.image || item.product_image || item.product?.image || ''),
          color_id: item.color_id || item.color?.id,
          color_name: item.color_name || item.color?.name,
          color_hex: item.color_hex || item.color?.hex_value
        }));
      } else if (cartData.items && typeof cartData.items === 'object') {
        // Handle case where items might be an object with keys
        cartItems = Object.values(cartData.items).map((item: any) => ({
          id: item.id?.toString() || item.cart_item_id?.toString() || `item-${Date.now()}-${Math.random()}`,
          product_id: item.product_id?.toString() || item.product?.id?.toString() || '',
          name: item.name || item.product_name || item.product?.name || 'Unnamed Product',
          price: this.parsePrice(item.price || item.product_price || item.product?.price || 0),
          quantity: parseInt(item.quantity || '1'),
          image: this.normalizeImageUrl(item.image || item.product_image || item.product?.image || ''),
          color_id: item.color_id || item.color?.id,
          color_name: item.color_name || item.color?.name,
          color_hex: item.color_hex || item.color?.hex_value
        }));
      }

      // Extract session key if available
      const sessionKey = cartData.session_key || data.session_key;
      if (sessionKey) {
        // Store the session key for future use
        localStorage.setItem(this.SESSION_KEY_STORAGE, sessionKey);
        console.log('🔑 Updated cart session key:', sessionKey);
      }

      // Extract delivery fee from API response
      const deliveryFee = cartData.delivery !== undefined ? Number(cartData.delivery) : 0;
      console.log('🚚 Delivery fee from API:', deliveryFee);

      const transformedCart: CartResponse = {
        id: cartData.id?.toString() || cartData.cart_id?.toString() || `cart-${Date.now()}`,
        items: cartItems,
        total: this.parsePrice(cartData.total || cartData.total_price || cartData.total_amount || 0),
        item_count: parseInt(cartData.item_count || cartData.items_count || cartData.count || cartItems.length || '0'),
        created_at: cartData.created_at || cartData.created || new Date().toISOString(),
        updated_at: cartData.updated_at || cartData.updated || new Date().toISOString(),
        session_key: sessionKey,
        delivery: deliveryFee // Include delivery fee in the response
      };

      console.log('🔄 Transformed cart response:', {
        id: transformedCart.id,
        itemCount: transformedCart.item_count,
        total: transformedCart.total,
        delivery: transformedCart.delivery,
        itemsLength: transformedCart.items.length,
        hasSessionKey: !!transformedCart.session_key
      });

      return transformedCart;
    } catch (error) {
      console.error('❌ Error transforming cart response:', error);
      return null;
    }
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

  // Cache cart
  private static cacheCart(cart: CartResponse): void {
    try {
      const cacheData = {
        cart,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log(`💾 Cached cart with ${cart.items.length} items`);
    } catch (error) {
      console.warn('⚠️ Failed to cache cart:', error);
    }
  }

  // Get cached cart
  private static getCachedCart(): CartResponse | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_KEY);
        console.log('🗑️ Cart cache expired, removed cached cart');
        return null;
      }

      console.log(`💾 Retrieved cached cart with ${cacheData.cart?.items?.length || 0} items`);
      return cacheData.cart || null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached cart:', error);
      return null;
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Testing RAFAL Cart API connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Get session key
      const sessionKey = this.getSessionKey();
      
      // Add session key as query parameter
      const url = `${this.API_BASE_URL}${this.GET_CART_ENDPOINT}?session_key=${encodeURIComponent(sessionKey)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Cart API returned status ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'RAFAL Cart API connection successful',
        data: data
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('❌ Cart API connection test failed:', message);
      
      return {
        success: false,
        message: message.includes('aborted') ? 'Connection timeout' : message
      };
    }
  }

  // Convert Product to CartItem
  static productToCartItem(product: Product, quantity: number = 1, colorId?: number): CartItem {
    let colorName = '';
    let colorHex = '';
    
    // If colorId is provided, try to find the color in the product's color array
    if (colorId && product.color && Array.isArray(product.color)) {
      const selectedColor = product.color.find(c => c.id === colorId);
      if (selectedColor) {
        colorName = this.getColorName(selectedColor.hex_value);
        colorHex = selectedColor.hex_value;
      }
    }
    
    return {
      id: `temp-${product.id}-${Date.now()}`, // Temporary ID until API provides real one
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      color_id: colorId,
      color_name: colorName,
      color_hex: colorHex
    };
  }

  // Get color name from hex value (basic color detection)
  private static getColorName(hexValue: string): string {
    const colorMap: Record<string, string> = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#ffa500': 'Orange',
      '#800080': 'Purple',
      '#ffc0cb': 'Pink',
      '#a52a2a': 'Brown',
      '#808080': 'Gray',
      '#c0c0c0': 'Silver',
      '#ffd700': 'Gold',
      '#f4a4c0': 'Rose Gold'
    };

    const lowerHex = hexValue.toLowerCase();
    return colorMap[lowerHex] || `Color ${hexValue}`;
  }
}