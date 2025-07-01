// API utility functions for error handling and data transformation
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request handler with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error'
    );
  }
}

// Retry mechanism for failed requests
export async function retryApiRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}

// Image URL validation and fallback
export function validateImageUrl(url: string, fallbackUrl?: string): string {
  if (!url) return fallbackUrl || '';
  
  // Basic URL validation
  try {
    new URL(url);
    return url;
  } catch {
    return fallbackUrl || '';
  }
}

// Safe JSON parsing with fallback
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
}

// Check if date is in valid range
export function isDateInRange(
  dateString: string,
  startDate?: string,
  endDate?: string
): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    if (startDate && new Date(startDate) > now) return false;
    if (endDate && new Date(endDate) < now) return false;
    
    return true;
  } catch {
    return false;
  }
}

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Cache management utilities
export class CacheManager {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static isValid(key: string): boolean {
    return this.get(key) !== null;
  }
}