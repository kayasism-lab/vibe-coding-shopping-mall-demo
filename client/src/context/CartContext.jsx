/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { parseKrwAmount } from "../utils/currency";

const CART_STORAGE_KEY_PREFIX = "moonCartItems";
const GUEST_CART_KEY = `${CART_STORAGE_KEY_PREFIX}:guest`;

const CartContext = createContext(null);

const getCartStorageKey = (userKey) =>
  userKey ? `${CART_STORAGE_KEY_PREFIX}:${String(userKey).trim().toLowerCase()}` : GUEST_CART_KEY;

const readStoredItems = (storageKey) => {
  try {
    const rawItems = localStorage.getItem(storageKey);
    const items = rawItems ? JSON.parse(rawItems) : [];
    return items.map((line) => ({
      ...line,
      product: line.product
        ? {
            ...line.product,
            sku: line.product.sku ?? line.product.id,
          }
        : line.product,
    }));
  } catch {
    return [];
  }
};

export function CartProvider({ children, userKey = "" }) {
  const storageKey = getCartStorageKey(userKey);
  const [items, setItems] = useState(() => readStoredItems(storageKey));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product, selectedColor, selectedSize, quantity = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.product.sku === product.sku &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingItemIndex >= 0) {
        const nextItems = [...currentItems];
        nextItems[existingItemIndex] = {
          ...nextItems[existingItemIndex],
          quantity: nextItems[existingItemIndex].quantity + quantity,
        };
        return nextItems;
      }

      return [
        ...currentItems,
        {
          product,
          quantity,
          selectedColor,
          selectedSize,
        },
      ];
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const updateQuantity = (productSku, selectedColor, selectedSize, quantity) => {
    if (quantity < 1) {
      removeItem(productSku, selectedColor, selectedSize);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.sku === productSku &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productSku, selectedColor, selectedSize) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.product.sku === productSku &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          )
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + parseKrwAmount(item.product.price) * item.quantity, 0);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    justAdded,
    storageKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
