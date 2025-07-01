// Payment API service for RAFAL e-commerce website
export interface PaymentOptions {
  fawry: boolean;
  aman: boolean;
  paymob?: boolean; // Optional because if both fawry and aman are false, paymob is used by default
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  redirect_url?: string;
  payment_id?: string;
}

export class PaymentService {
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly PAYMENT_CHECKER_ENDPOINT = '/payment/payment_checker/';

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

  // Check payment options and get redirect URL
  static async checkPayment(orderId: string, options: PaymentOptions): Promise<PaymentResponse> {
    try {
      console.log('🔄 Checking payment options for order:', orderId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const requestData = {
        pk: orderId,
        fawry: options.fawry,
        aman: options.aman
        // Note: paymob is used by default if both fawry and aman are false
      };
      
      console.log('📦 Payment checker request data:', requestData);
      
      const response = await fetch(`${this.API_BASE_URL}${this.PAYMENT_CHECKER_ENDPOINT}`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Payment Checker API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Raw Payment Checker API response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || data.detail || `Payment check failed with status: ${response.status}`
        };
      }

      // Check if we have a redirect URL (for Paymob)
      if (data.redirect_url) {
        console.log('✅ Payment gateway redirect URL received:', data.redirect_url);
        return {
          success: true,
          redirect_url: data.redirect_url,
          payment_id: data.payment_id || data.id
        };
      }
      
      // If no redirect URL but response is OK, it might be Fawry or Aman
      if (options.fawry || options.aman) {
        return {
          success: true,
          message: 'Payment method selected successfully',
          payment_id: data.payment_id || data.id
        };
      }
      
      // Fallback error
      return {
        success: false,
        message: 'No payment gateway information received'
      };
    } catch (error) {
      console.error('❌ Error checking payment options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during payment check'
      };
    }
  }

  // Verify payment status
  static async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      console.log('🔄 Verifying payment status for:', paymentId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}/payment/verify/${paymentId}/`, {
        method: 'GET',
        headers: this.getHeaders(true),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Payment Verify API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Raw Payment Verify API response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || data.detail || `Payment verification failed with status: ${response.status}`
        };
      }

      // Check payment status
      const isSuccess = data.success === true || data.status === 'success' || data.is_success === true;
      
      return {
        success: isSuccess,
        message: data.message || (isSuccess ? 'Payment successful' : 'Payment failed'),
        payment_id: paymentId
      };
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during payment verification'
      };
    }
  }
}