// Authentication API service for RAFAL e-commerce website
export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
}

export class AuthService {
  private static readonly API_BASE_URL = 'https://apirafal.cyparta.com';
  private static readonly LOGIN_ENDPOINT = '/api/login/';
  private static readonly REGISTER_ENDPOINT = '/api/register/';
  private static readonly USER_STORAGE_KEY = 'rafal_user';
  private static readonly TOKEN_STORAGE_KEY = 'rafal_auth_token';

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
      const token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting to login user...');
      
      // Format phone number to include +20 prefix if not already present
      let formattedPhone = credentials.phone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+20${formattedPhone.replace(/^0+/, '')}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: formattedPhone,
          password: credentials.password
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Login API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Raw Login API response:', data);

      if (!response.ok) {
        return {
          user: {} as User,
          token: '',
          success: false,
          message: data.message || data.error || data.detail || 'Login failed'
        };
      }

      // Transform API response to our AuthResponse interface
      const authResponse = this.transformLoginResponse(data);
      
      if (authResponse.success) {
        // Store user data and token in localStorage
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(authResponse.user));
        localStorage.setItem(this.TOKEN_STORAGE_KEY, authResponse.token);
        console.log('✅ User logged in successfully:', authResponse.user.name);
      }

      return authResponse;
    } catch (error) {
      console.error('❌ Error during login:', error);
      return {
        user: {} as User,
        token: '',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during login'
      };
    }
  }

  // Transform login API response
  private static transformLoginResponse(data: any): AuthResponse {
    if (!data) {
      console.warn('⚠️ Login API returned null or undefined data');
      return {
        user: {} as User,
        token: '',
        success: false,
        message: 'Invalid response from server'
      };
    }

    try {
      // Check if login was successful
      const success = data.success === true || !!data.token || !!data.access_token || !!data.user;
      
      // Extract token from various possible fields
      const token = data.token || data.access_token || data.auth_token || '';
      
      // Extract user data from various possible structures
      let userData: any = {};
      
      if (data.user) {
        userData = data.user;
      } else if (data.data && data.data.user) {
        userData = data.data.user;
      } else if (success) {
        // If login was successful but no user data, use whatever fields are available
        userData = {
          id: data.id || data.user_id || '',
          name: data.name || data.username || data.full_name || '',
          email: data.email || '',
          phone: data.phone || data.phone_number || ''
        };
      }

      // Create standardized user object
      const user: User = {
        id: userData.id?.toString() || '',
        name: userData.name || userData.username || userData.full_name || 'User',
        email: userData.email || '',
        phone: userData.phone || userData.phone_number || '',
        token: token
      };

      return {
        user,
        token,
        success,
        message: data.message || ''
      };
    } catch (error) {
      console.error('❌ Error transforming login response:', error);
      return {
        user: {} as User,
        token: '',
        success: false,
        message: 'Error processing login response'
      };
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    console.log('✅ User logged out successfully');
  }

  // Check if user is logged in
  static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  // Get current user
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Register new user
  static async register(userData: any): Promise<AuthResponse> {
    try {
      console.log('🔄 Attempting to register new user...');
      
      // Format phone number to include +20 prefix if not already present
      let formattedPhone = userData.phone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+20${formattedPhone.replace(/^0+/, '')}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${this.API_BASE_URL}${this.REGISTER_ENDPOINT}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...userData,
          phone: formattedPhone
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Register API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Raw Register API response:', data);

      if (!response.ok) {
        return {
          user: {} as User,
          token: '',
          success: false,
          message: data.message || data.error || data.detail || 'Registration failed'
        };
      }

      // If registration is successful, automatically log in the user
      return this.login({
        phone: formattedPhone,
        password: userData.password
      });
    } catch (error) {
      console.error('❌ Error during registration:', error);
      return {
        user: {} as User,
        token: '',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during registration'
      };
    }
  }
}