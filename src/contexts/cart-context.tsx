
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { PopulatedCart, ProductVariant } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { getCart, addToCart as addToCartAction, updateCartItemQuantity, removeFromCart as removeFromCartAction } from '@/lib/actions';

interface CartContextType {
  cart: PopulatedCart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<PopulatedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchCart = async () => {
    if (status === 'authenticated') {
      setLoading(true);
      const userCart = await getCart();
      setCart(userCart);
      setLoading(false);
    } else {
      setCart(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [status]);

  const addToCart = async (productId: string, quantity: number, variantId?: string) => {
    if (!session) return;
    const result = await addToCartAction(productId, quantity, variantId);
    if (result.success && result.cart) {
      setCart(result.cart);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variantId?: string) => {
    if (!session) return;
    const result = await updateCartItemQuantity(productId, quantity, variantId);
    if (result.success && result.cart) {
      setCart(result.cart);
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    if (!session) return;
    const result = await removeFromCartAction(productId, variantId);
    if (result.success && result.cart) {
      setCart(result.cart);
    }
  };

  const clearCart = () => {
    setCart(null);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
