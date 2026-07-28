import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/marketplace.service';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const loadWishlist = useCallback(async () => {
    if (!currentUser) {
      setWishlist([]);
      setWishlistedIds(new Set());
      return;
    }
    setLoading(true);
    const items = await wishlistService.getWishlist(currentUser.id);
    setWishlist(items);
    setWishlistedIds(new Set(items.map((p) => p.id)));
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = useCallback(async (productId) => {
    if (!currentUser) return { success: false, error: 'not_authenticated' };
    const result = await wishlistService.addToWishlist(currentUser.id, productId);
    if (result.success) {
      setWishlistedIds((prev) => new Set(prev).add(productId));
    }
    return result;
  }, [currentUser]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!currentUser) return { success: false, error: 'not_authenticated' };
    const result = await wishlistService.removeFromWishlist(currentUser.id, productId);
    if (result.success) {
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
    return result;
  }, [currentUser]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!currentUser) return { success: false, error: 'not_authenticated' };
    if (wishlistedIds.has(productId)) {
      return removeFromWishlist(productId);
    }
    return addToWishlist(productId);
  }, [currentUser, wishlistedIds, addToWishlist, removeFromWishlist]);

  const isWishlisted = useCallback((productId) => wishlistedIds.has(productId), [wishlistedIds]);

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
