import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types';
import { cartService } from '../api/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, openDrawer?: boolean) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
      setIsCartOpen(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity = 1, openDrawer = true) => {
    if (!isAuthenticated) {
      // Kullanıcı giriş yapmamış — yönlendirme zaten yapılıyor, toast gerekmez
      window.location.href = '/login';
      return;
    }
    setIsLoading(true);
    try {
      const response = await cartService.addItem(productId, quantity);
      setCart(response.data);
      if (openDrawer) {
        setIsCartOpen(true);
      }
    } catch (error) {
      // Hata sessizce loglanır — kullanıcı drawer içinde zaten geri bildirim alır
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setIsLoading(true);
    try {
      const response = await cartService.updateItemQuantity(productId, quantity);
      setCart(response.data);
    } catch (error) {
      // Hata sessizce loglanır — anlık güncelleme zaten görünür
      console.error('Error updating quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await cartService.removeItem(productId);
      setCart(response.data);
    } catch (error) {
      // Hata sessizce loglanır — drawer içinde anında güncellenir
      console.error('Error removing item from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await cartService.clearCart();
      setCart({
        id: cart?.id || '',
        userId: cart?.userId || '',
        items: [],
        totalAmount: 0,
      });
    } catch (error) {
      // Hata sessizce loglanır
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        isCartOpen,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clear,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
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