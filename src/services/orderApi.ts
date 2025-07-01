// Order API service for RAFAL e-commerce website
import { Product } from '../types/Product';

export interface OrderItem {
  product_id: string | number;
  quantity: number;
  color_hex?: string;
}

export interface OrderAddress {
  first_name: string;
  second_name: string;
  email?: string;
  phone: string;
  country: string;
  city: string;
  region: string;
  address: string;
  apartment?: string;
}

export interface DirectBuyRequest {
  first_name: string;
  second_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  region: string;
  address: string;
  apartment?: string;
  product_id: string | number;
  quantity: number;
  color_hex?: string;
  shipping_address: string;
  payment_method: 'Cash' | 'Card';
}

export interface CheckoutRequest {
  first_name: string;
  second_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  region: string;
  address: string;
  apartment?: string;
  shipping_address: string;
  payment_method: 'Cash' | 'Card';
  items: OrderItem[];
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
  created_at: string;
  success: boolean;
  message?: string;
}

export class OrderService {
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly CHECKOUT_ENDPOINT = '/cart/checkout/';
  private static readonly DIRECT_BUY_ENDPOINT = '/order/checkout_now/';
  private static readonly ORDER_HISTORY_ENDPOINT = '/order/history/';
  private static readonly ORDER_DETAILS_ENDPOINT = '/order/details/';

  // Default headers for API requests
  private static getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    };

    if (includeAuth) {
      const token = localStorage.getItem('rafal_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Direct buy now (single product checkout)
  static async directBuyNow(orderData: DirectBuyRequest): Promise<OrderResponse> {
    try {
      console.log('🔄 Processing direct buy now order...');
      
      // Format phone number to remove leading zeros
      const formattedPhone = orderData.phone.replace(/\s+/g, '').replace(/^0+/, '');
      
      // Create shipping address string if not provided
      if (!orderData.shipping_address) {
        orderData.shipping_address = `${orderData.address} _ ${orderData.apartment || ''}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const requestData = {
        ...orderData,
        phone: formattedPhone,
        // Ensure product_id is sent as a number if possible
        product_id: typeof orderData.product_id === 'string' && !isNaN(parseInt(orderData.product_id)) 
          ? parseInt(orderData.product_id) 
          : orderData.product_id,
        // Set default color_hex if not provided
        color_hex: orderData.color_hex || '#000000'
      };
      
      console.log('📦 Direct buy now request data:', requestData);
      
      const response = await fetch(`${this.API_BASE_URL}${this.DIRECT_BUY_ENDPOINT}`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Direct Buy Now API Response Status: ${response.status} ${response.statusText}`);

      // Check if response is successful before attempting to parse
      if (!response.ok) {
        let errorMessage;
        try {
          const errorText = await response.text();
          console.log('📄 Error response text:', errorText);
          
          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorData.detail || `Order failed with status: ${response.status}`;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '');
          }
        } catch (textError) {
          console.error('❌ Failed to read error response:', textError);
          errorMessage = `Order failed with status: ${response.status}`;
        }

        return {
          id: '',
          order_number: '',
          status: 'failed',
          total: 0,
          items: [],
          shipping_address: '',
          payment_method: '',
          created_at: new Date().toISOString(),
          success: false,
          message: errorMessage
        };
      }

      // Response is successful, parse as JSON
      let data;
      try {
        data = await response.json();
        console.log('📦 Raw Direct Buy Now API response:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse successful response as JSON:', jsonError);
        const textResponse = await response.text();
        console.log('📄 Raw text response:', textResponse);
        
        return {
          id: '',
          order_number: '',
          status: 'failed',
          total: 0,
          items: [],
          shipping_address: '',
          payment_method: '',
          created_at: new Date().toISOString(),
          success: false,
          message: `Server returned invalid JSON format. Response: ${textResponse.substring(0, 200)}...`
        };
      }

      // Transform API response to our OrderResponse interface
      return this.transformOrderResponse(data);
    } catch (error) {
      console.error('❌ Error during direct buy now:', error);
      return {
        id: '',
        order_number: '',
        status: 'failed',
        total: 0,
        items: [],
        shipping_address: '',
        payment_method: '',
        created_at: new Date().toISOString(),
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during checkout'
      };
    }
  }

  // Regular checkout (multiple items from cart)
  static async checkout(checkoutData: CheckoutRequest): Promise<OrderResponse> {
    try {
      console.log('🔄 Processing checkout order...');
      
      // Format phone number to remove leading zeros
      const formattedPhone = checkoutData.phone.replace(/\s+/g, '').replace(/^0+/, '');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      // Get session key from localStorage
      const sessionKey = localStorage.getItem('rafal_cart_session_key');
      
      // Create the URL with session key as query parameter
      const url = `${this.API_BASE_URL}${this.CHECKOUT_ENDPOINT}${sessionKey ? `?session_key=${encodeURIComponent(sessionKey)}` : ''}`;
      
      // Ensure each item has a default color_hex if not provided
      const itemsWithDefaultColor = checkoutData.items.map(item => ({
        ...item,
        color_hex: item.color_hex || '#000000' // Default to black if no color specified
      }));
      
      const requestData = {
        ...checkoutData,
        phone: formattedPhone,
        items: itemsWithDefaultColor
      };
      
      console.log('📦 Checkout request data:', requestData);
      console.log('🔗 Checkout URL with session key:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Checkout API Response Status: ${response.status} ${response.statusText}`);

      // Check if response is successful before attempting to parse
      if (!response.ok) {
        let errorMessage;
        try {
          const errorText = await response.text();
          console.log('📄 Error response text:', errorText);
          
          // Try to parse as JSON first
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorData.detail || `Checkout failed with status: ${response.status}`;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText.substring(0, 200) + (errorText.length > 200 ? '...' : '');
          }
        } catch (textError) {
          console.error('❌ Failed to read error response:', textError);
          errorMessage = `Checkout failed with status: ${response.status}`;
        }

        return {
          id: '',
          order_number: '',
          status: 'failed',
          total: 0,
          items: [],
          shipping_address: '',
          payment_method: '',
          created_at: new Date().toISOString(),
          success: false,
          message: errorMessage
        };
      }

      // Response is successful, parse as JSON
      let data;
      try {
        data = await response.json();
        console.log('📦 Raw Checkout API response:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse successful response as JSON:', jsonError);
        const textResponse = await response.text();
        console.log('📄 Raw text response:', textResponse);
        
        return {
          id: '',
          order_number: '',
          status: 'failed',
          total: 0,
          items: [],
          shipping_address: '',
          payment_method: '',
          created_at: new Date().toISOString(),
          success: false,
          message: `Server returned invalid JSON format. Response: ${textResponse.substring(0, 200)}...`
        };
      }

      // Transform API response to our OrderResponse interface
      return this.transformOrderResponse(data);
    } catch (error) {
      console.error('❌ Error during checkout:', error);
      return {
        id: '',
        order_number: '',
        status: 'failed',
        total: 0,
        items: [],
        shipping_address: '',
        payment_method: '',
        created_at: new Date().toISOString(),
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during checkout'
      };
    }
  }

  // Get order history
  static async getOrderHistory(): Promise<OrderResponse[]> {
    try {
      console.log('🔄 Fetching order history...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.ORDER_HISTORY_ENDPOINT}`, {
        method: 'GET',
        headers: this.getHeaders(true),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Order History API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Order history request failed with status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('📦 Raw Order History API response:', data);
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response for order history:', jsonError);
        const textResponse = await response.text();
        console.log('📄 Raw text response:', textResponse);
        return [];
      }

      // Transform API response to our OrderResponse interface
      let orders: OrderResponse[] = [];
      
      if (Array.isArray(data)) {
        orders = data.map(order => this.transformOrderResponse(order));
      } else if (data.orders && Array.isArray(data.orders)) {
        orders = data.orders.map((order: any) => this.transformOrderResponse(order));
      } else if (data.data && Array.isArray(data.data)) {
        orders = data.data.map((order: any) => this.transformOrderResponse(order));
      }
      
      return orders;
    } catch (error) {
      console.error('❌ Error fetching order history:', error);
      return [];
    }
  }

  // Get order details
  static async getOrderDetails(orderId: string): Promise<OrderResponse | null> {
    try {
      console.log(`🔄 Fetching details for order ${orderId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.ORDER_DETAILS_ENDPOINT}${orderId}/`, {
        method: 'GET',
        headers: this.getHeaders(true),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Order Details API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Order details request failed with status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('📦 Raw Order Details API response:', data);
      } catch (jsonError) {
        console.error(`❌ Failed to parse JSON response for order ${orderId}:`, jsonError);
        const textResponse = await response.text();
        console.log('📄 Raw text response:', textResponse);
        return null;
      }

      // Transform API response to our OrderResponse interface
      return this.transformOrderResponse(data);
    } catch (error) {
      console.error(`❌ Error fetching details for order ${orderId}:`, error);
      return null;
    }
  }

  // Transform order API response
  private static transformOrderResponse(data: any): OrderResponse {
    if (!data) {
      console.warn('⚠️ Order API returned null or undefined data');
      return {
        id: '',
        order_number: '',
        status: 'unknown',
        total: 0,
        items: [],
        shipping_address: '',
        payment_method: '',
        created_at: new Date().toISOString(),
        success: false,
        message: 'Invalid response from server'
      };
    }

    try {
      // Check if order was successful
      const success = data.success === true || !!data.id || !!data.order_id || !!data.order_number;
      
      // Extract order data from various possible structures
      let orderData = data;
      if (data.order) {
        orderData = data.order;
      } else if (data.data && data.data.order) {
        orderData = data.data.order;
      }

      // Extract items
      let items: OrderItem[] = [];
      if (Array.isArray(orderData.items)) {
        items = orderData.items.map((item: any) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1,
          color_hex: item.color_hex || '#000000' // Default to black if no color specified
        }));
      } else if (orderData.product_id) {
        // Single product order
        items = [{
          product_id: orderData.product_id,
          quantity: orderData.quantity || 1,
          color_hex: orderData.color_hex || '#000000' // Default to black if no color specified
        }];
      }

      return {
        id: orderData.id?.toString() || orderData.order_id?.toString() || '',
        order_number: orderData.order_number || orderData.number || `ORD-${Date.now()}`,
        status: orderData.status || 'processing',
        total: this.parsePrice(orderData.total || orderData.total_price || 0),
        items: items,
        shipping_address: orderData.shipping_address || '',
        payment_method: orderData.payment_method || 'Cash',
        created_at: orderData.created_at || orderData.created || new Date().toISOString(),
        success: success,
        message: data.message || ''
      };
    } catch (error) {
      console.error('❌ Error transforming order response:', error);
      return {
        id: '',
        order_number: '',
        status: 'error',
        total: 0,
        items: [],
        shipping_address: '',
        payment_method: '',
        created_at: new Date().toISOString(),
        success: false,
        message: 'Error processing order response'
      };
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
}