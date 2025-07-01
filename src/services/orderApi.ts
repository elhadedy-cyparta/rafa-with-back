// Order API service for RAFAL e-commerce website
import { CartItem } from './cartApi';

export interface OrderItem {
  product_id: string | number;
  quantity: number;
  color_hex?: string;
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
  session_key?: string;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items: any[];
  shipping_address: string;
  payment_method: string;
  created_at: string;
  success: boolean;
  message?: string;
}

export class OrderService {
  private static readonly API_BASE_URL = 'http://localhost:8000';
  private static readonly CHECKOUT_ENDPOINT = '/api/orders/checkout/';
  private static readonly DIRECT_BUY_ENDPOINT = '/api/orders/checkout_now/';
  private static readonly ORDER_HISTORY_ENDPOINT = '/api/orders/history/';
  private static readonly ORDER_DETAILS_ENDPOINT = '/api/orders/history/';

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

      // Return the order response
      return {
        id: data.id || '',
        order_number: data.order_number || '',
        status: data.order?.status || 'pending',
        total: this.parsePrice(data.order?.total || 0),
        items: data.order?.items || [],
        shipping_address: data.order?.shipping_address || '',
        payment_method: data.order?.payment_method || orderData.payment_method,
        created_at: data.order?.created_at || new Date().toISOString(),
        success: data.success || false,
        message: data.message || ''
      };
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
      
      // Get session key from localStorage if not provided
      const sessionKey = checkoutData.session_key || localStorage.getItem('rafal_cart_session_key');
      
      const requestData = {
        ...checkoutData,
        phone: formattedPhone,
        session_key: sessionKey
      };
      
      console.log('📦 Checkout request data:', requestData);
      
      const response = await fetch(`${this.API_BASE_URL}${this.CHECKOUT_ENDPOINT}`, {
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

      // Return the order response
      return {
        id: data.id || '',
        order_number: data.order_number || '',
        status: data.order?.status || 'pending',
        total: this.parsePrice(data.order?.total || 0),
        items: data.order?.items || [],
        shipping_address: data.order?.shipping_address || '',
        payment_method: data.order?.payment_method || checkoutData.payment_method,
        created_at: data.order?.created_at || new Date().toISOString(),
        success: data.success || false,
        message: data.message || ''
      };
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
        return [];
      }

      // Transform API response to our OrderResponse interface
      let orders: OrderResponse[] = [];
      
      if (Array.isArray(data)) {
        orders = data.map(order => ({
          id: order.id || '',
          order_number: order.order_number || '',
          status: order.status || 'pending',
          total: this.parsePrice(order.total || 0),
          items: order.items || [],
          shipping_address: order.shipping_address || '',
          payment_method: order.payment_method || '',
          created_at: order.created_at || new Date().toISOString(),
          success: true,
          message: ''
        }));
      } else if (data.results && Array.isArray(data.results)) {
        orders = data.results.map((order: any) => ({
          id: order.id || '',
          order_number: order.order_number || '',
          status: order.status || 'pending',
          total: this.parsePrice(order.total || 0),
          items: order.items || [],
          shipping_address: order.shipping_address || '',
          payment_method: order.payment_method || '',
          created_at: order.created_at || new Date().toISOString(),
          success: true,
          message: ''
        }));
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
        return null;
      }

      // Return the order response
      return {
        id: data.id || '',
        order_number: data.order_number || '',
        status: data.status || 'pending',
        total: this.parsePrice(data.total || 0),
        items: data.items || [],
        shipping_address: data.shipping_address || '',
        payment_method: data.payment_method || '',
        created_at: data.created_at || new Date().toISOString(),
        success: true,
        message: ''
      };
    } catch (error) {
      console.error(`❌ Error fetching details for order ${orderId}:`, error);
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
}