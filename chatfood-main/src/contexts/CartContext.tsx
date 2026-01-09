import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PublicProduct } from '@/hooks/usePublicRestaurant';

export interface CartItem {
  product: PublicProduct;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantSlug: string | null;
  addItem: (product: PublicProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setRestaurantSlug: (slug: string) => void;
  totalItems: number;
  totalPrice: number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chatfood_cart';

interface StoredCart {
  items: CartItem[];
  restaurantSlug: string | null;
  updatedAt: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantSlug, setRestaurantSlugState] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: StoredCart = JSON.parse(stored);
        // Check if cart is less than 24 hours old
        const isRecent = Date.now() - parsed.updatedAt < 24 * 60 * 60 * 1000;
        if (isRecent && parsed.items.length > 0) {
          setItems(parsed.items);
          setRestaurantSlugState(parsed.restaurantSlug);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    const cart: StoredCart = {
      items,
      restaurantSlug,
      updatedAt: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [items, restaurantSlug]);

  const setRestaurantSlug = useCallback((slug: string) => {
    // If switching restaurants, clear the cart
    if (restaurantSlug && restaurantSlug !== slug) {
      setItems([]);
    }
    setRestaurantSlugState(slug);
  }, [restaurantSlug]);

  const addItem = useCallback((product: PublicProduct, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.unit_price * item.quantity,
    0
  );

  const getItemQuantity = useCallback((productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    return item?.quantity || 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantSlug,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setRestaurantSlug,
        totalItems,
        totalPrice,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
