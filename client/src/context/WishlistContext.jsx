/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const WISHLIST_STORAGE_KEY_PREFIX = "moonWishlistItems";
const GUEST_WISHLIST_KEY = `${WISHLIST_STORAGE_KEY_PREFIX}:guest`;
const WishlistContext = createContext(null);

const getWishlistStorageKey = (userKey) =>
  userKey ? `${WISHLIST_STORAGE_KEY_PREFIX}:${String(userKey).trim().toLowerCase()}` : GUEST_WISHLIST_KEY;

const readStoredWishlist = (storageKey) => {
  try {
    const rawItems = localStorage.getItem(storageKey);
    const items = rawItems ? JSON.parse(rawItems) : [];
    return items.map((item) => ({
      ...item,
      sku: item.sku ?? item.id,
    }));
  } catch {
    return [];
  }
};

export function WishlistProvider({ children, userKey = "" }) {
  const storageKey = getWishlistStorageKey(userKey);
  const [items, setItems] = useState(() => readStoredWishlist(storageKey));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = useCallback((product) => {
    setItems((currentItems) => {
      if (currentItems.some((item) => item.sku === product.sku)) {
        return currentItems;
      }

      return [...currentItems, product];
    });
  }, []);

  const removeItem = useCallback((productSku) => {
    setItems((currentItems) => currentItems.filter((item) => item.sku !== productSku));
  }, []);

  const isInWishlist = useCallback(
    (productSku) => items.some((item) => item.sku === productSku),
    [items]
  );

  const toggleItem = useCallback(
    (product) => {
      if (isInWishlist(product.sku)) {
        removeItem(product.sku);
        return;
      }

      addItem(product);
    },
    [addItem, isInWishlist, removeItem]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      isInWishlist,
      toggleItem,
      storageKey,
    }),
    [addItem, isInWishlist, items, removeItem, storageKey, toggleItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
}
