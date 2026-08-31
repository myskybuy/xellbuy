"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: number;
  name: string;
  image: string;
  salePrice: number;
  qty: number;
  size?: string;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: number, size?: string) => void;
  updateQty: (id: number, qty: number, size?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isInCart: (id: number, size?: string) => boolean;
};

const CART_KEY = "xellbuy_cart";
const CartContext = createContext<CartContextValue | null>(null);

function persist(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const addToCart = (product: Omit<CartItem, "qty">, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id && i.size === product.size);
        const next = existing
          ? prev.map((i) =>
              i.id === product.id && i.size === product.size ? { ...i, qty: i.qty + qty } : i
            )
          : [...prev, { ...product, qty }];
        persist(next);
        return next;
      });
    };

    const removeFromCart = (id: number, size?: string) =>
      setCart((prev) => {
        const next = prev.filter((i) => !(i.id === id && i.size === size));
        persist(next);
        return next;
      });
    const updateQty = (id: number, qty: number, size?: string) =>
      setCart((prev) => {
        const next = prev.map((i) => (i.id === id && i.size === size ? { ...i, qty: Math.max(1, qty) } : i));
        persist(next);
        return next;
      });
    const clearCart = () => {
      setCart([]);
      persist([]);
    };
    const cartTotal = cart.reduce((sum, i) => sum + i.salePrice * i.qty, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const isInCart = (id: number, size?: string) => cart.some((i) => i.id === id && i.size === size);

    return { cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, isInCart };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
