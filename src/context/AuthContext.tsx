import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User, LoginCredentials } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is stored in localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      setIsLoading(true);
      try {
        const storedUser = AuthService.getCurrentUser();
        if (storedUser) {
          console.log('🔑 User found in local storage:', storedUser.name);
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message || 'Invalid credentials' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};