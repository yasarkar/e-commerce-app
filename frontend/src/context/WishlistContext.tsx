import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Wishlist } from '../types';
import { wishlistService } from '../api/wishlistService';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  itemCount: number;
  isLoading: boolean;
  isWishlistOpen: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist(null);
      setIsWishlistOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      alert('Favorilere eklemek için lütfen giriş yapın.');
      window.location.href = '/login';
      return;
    }
    setIsLoading(true);
    try {
      const response = await wishlistService.addItem(productId);
      setWishlist(response.data);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Ürün favorilere eklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await wishlistService.removeItem(productId);
      setWishlist(response.data);
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      alert('Ürün favorilerden çıkarılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await wishlistService.clearWishlist();
      setWishlist({
        id: wishlist?.id || '',
        userId: wishlist?.userId || '',
        items: [],
        totalItems: 0,
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Favoriler temizlenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    if (!wishlist) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  const toggleWishlist = () => setIsWishlistOpen((prev) => !prev);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const itemCount = wishlist?.items.length || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        itemCount,
        isLoading,
        isWishlistOpen,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};