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
  private static readonly API_BASE_URL = 'http://localhost:8000';
  private static readonly LOGIN_ENDPOINT = '/api/users/token/';
  private static readonly REGISTER_ENDPOINT = '/api/users/register/';
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
          message: data.detail || 'Login failed'
        };
      }

      // Extract token from response
      const token = data.access;
      
      if (!token) {
        return {
          user: {} as User,
          token: '',
          success: false,
          message: 'No token received from server'
        };
      }
      
      // Get user profile with the token
      const userResponse = await fetch(`${this.API_BASE_URL}/api/users/profile/me/`, {
        method: 'GET',
        headers: {
          ...this.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        return {
          user: {} as User,
          token,
          success: false,
          message: 'Failed to fetch user profile'
        };
      }
      
      const userData = await userResponse.json();
      
      // Create user object
      const user: User = {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim() || 'User',
        email: userData.email || '',
        phone: userData.phone || formattedPhone,
        token
      };
      
      // Store user data and token
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      
      return {
        user,
        token,
        success: true
      };
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
          phone: formattedPhone,
          password: userData.password,
          password2: userData.password2 || userData.password,
          email: userData.email || '',
          first_name: userData.first_name || userData.username || '',
          last_name: userData.last_name || ''
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📡 Register API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('📦 Raw Register API response:', data);

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        
        // Try to extract error messages
        if (data) {
          if (typeof data === 'object') {
            // Flatten error messages from different fields
            const errorMessages = Object.entries(data)
              .filter(([key, value]) => key !== 'success' && key !== 'message')
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return `${key}: ${value.join(', ')}`;
                }
                return `${key}: ${value}`;
              });
            
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('; ');
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.detail) {
              errorMessage = data.detail;
            }
          } else if (typeof data === 'string') {
            errorMessage = data;
          }
        }
        
        return {
          user: {} as User,
          token: '',
          success: false,
          message: errorMessage
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