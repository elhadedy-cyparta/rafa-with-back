import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '../types/Product';
import { CartService, CartItem, CartResponse } from '../services/cartApi';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  cartId: string | null;
  total: number;
  itemCount: number;
  sessionKey: string | null;
  lastRefreshed: number;
  deliveryFee: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number, colorId?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  getCartTotal: () => number;
  getDeliveryFee: () => number;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

type CartAction =
  | { type: 'CART_REQUEST' }
  | { type: 'CART_SUCCESS'; payload: CartResponse }
  | { type: 'CART_FAILURE'; payload: string }
  | { type: 'CART_RESET' };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'CART_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        items: action.payload.items,
        cartId: action.payload.id,
        total: action.payload.total,
        itemCount: action.payload.item_count,
        sessionKey: action.payload.session_key || state.sessionKey,
        lastRefreshed: Date.now(),
        deliveryFee: action.payload.delivery || 0
      };
    case 'CART_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'CART_RESET':
      return {
        ...state,
        items: [],
        cartId: null,
        total: 0,
        itemCount: 0,
        lastRefreshed: Date.now(),
        deliveryFee: 0
      };
    default:
      return state;
  }
};

// Minimum time between cart refreshes (in milliseconds)
const REFRESH_THROTTLE = 2000; // 2 seconds

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    error: null,
    cartId: null,
    total: 0,
    itemCount: 0,
    sessionKey: null,
    lastRefreshed: 0,
    deliveryFee: 0
  });

  // Load cart from API on mount and when page becomes visible
  useEffect(() => {
    console.log('🛒 CartProvider mounted, initializing cart...');
    refreshCart();
    
    // Add event listener for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Page became visible, refreshing cart...');
        refreshCart();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Refresh cart from API with throttling
  const refreshCart = async () => {
    // Check if we've refreshed recently to avoid excessive API calls
    const now = Date.now();
    if (now - state.lastRefreshed < REFRESH_THROTTLE) {
      console.log(`🛑 Skipping cart refresh - last refresh was ${(now - state.lastRefreshed) / 1000}s ago`);
      return;
    }

    try {
      dispatch({ type: 'CART_REQUEST' });
      
      // Get session key from localStorage if available
      const sessionKey = localStorage.getItem('rafal_cart_session_key');
      console.log('🔑 Using session key for cart refresh:', sessionKey || 'No session key found');
      
      const cartResponse = await CartService.getCart();
      
      if (cartResponse) {
        dispatch({ type: 'CART_SUCCESS', payload: cartResponse });
        console.log(`🛒 Cart refreshed: ${cartResponse.items.length} items, total: ${cartResponse.total} EGP, delivery: ${cartResponse.delivery || 0} EGP`);
      } else {
        dispatch({ type: 'CART_RESET' });
        console.log('🛒 Cart refreshed: empty cart');
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to load cart' 
      });
      console.error('❌ Failed to refresh cart:', error);
    }
  };

  // Add product to cart
  const addToCart = async (product: Product, quantity: number = 1, colorId?: number) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      
      // Call the API to add the product to cart
      const cartResponse = await CartService.addToCart(product.id, quantity, colorId);
      
      if (cartResponse) {
        dispatch({ type: 'CART_SUCCESS', payload: cartResponse });
        console.log(`✅ Added ${quantity} ${product.name} to cart`);
      } else {
        // If API call fails, dispatch failure
        dispatch({ 
          type: 'CART_FAILURE', 
          payload: 'Failed to add product to cart' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to add product to cart' 
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      
      // Call the API to remove the item from cart
      const cartResponse = await CartService.removeFromCart(itemId);
      
      if (cartResponse) {
        dispatch({ type: 'CART_SUCCESS', payload: cartResponse });
        console.log(`✅ Removed item ${itemId} from cart`);
      } else {
        // If API call fails, dispatch failure
        dispatch({ 
          type: 'CART_FAILURE', 
          payload: 'Failed to remove item from cart' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to remove item from cart' 
      });
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      // If quantity is 0, remove the item
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }
      
      dispatch({ type: 'CART_REQUEST' });
      
      // Call the API to update the item quantity
      const cartResponse = await CartService.updateCartItemQuantity(itemId, quantity);
      
      if (cartResponse) {
        dispatch({ type: 'CART_SUCCESS', payload: cartResponse });
        console.log(`✅ Updated quantity for item ${itemId} to ${quantity}`);
      } else {
        // If API call fails, dispatch failure
        dispatch({ 
          type: 'CART_FAILURE', 
          payload: 'Failed to update item quantity' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to update item quantity' 
      });
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return state.total;
  };

  // Get delivery fee
  const getDeliveryFee = () => {
    return state.deliveryFee;
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_REQUEST' });
      
      // Call the API to clear the cart
      const cartResponse = await CartService.clearCart();
      
      if (cartResponse) {
        dispatch({ type: 'CART_SUCCESS', payload: cartResponse });
        console.log('✅ Cart cleared successfully');
      } else {
        // If API call fails, dispatch failure
        dispatch({ 
          type: 'CART_FAILURE', 
          payload: 'Failed to clear cart' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CART_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to clear cart' 
      });
    }
  };

  const value: CartContextType = {
    cartItems: state.items,
    isLoading: state.isLoading,
    error: state.error,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getDeliveryFee,
    clearCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};