"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";

type WishlistContextValue = {
  wishlistIds: number[];
  wishlistCount: number;
  loading: boolean;
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (id: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      const data = await res.json();
      setWishlistIds((data.items || []).map((p: { id: number }) => p.id));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<WishlistContextValue>(() => {
    const isWishlisted = (id: number) => wishlistIds.includes(id);

    const toggleWishlist = async (id: number) => {
      if (!user) {
        toast.error("Login to save items to your wishlist", {
          action: { label: "Login", onClick: () => router.push("/account") },
        });
        return;
      }
      const already = wishlistIds.includes(id);
      setWishlistIds((prev) => (already ? prev.filter((x) => x !== id) : [...prev, id]));
      try {
        if (already) {
          await fetch(`/api/wishlist?productId=${id}`, { method: "DELETE", credentials: "include" });
          toast.success("Removed from wishlist");
        } else {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId: id }),
          });
          toast.success("Added to wishlist");
        }
      } catch {
        setWishlistIds((prev) => (already ? [...prev, id] : prev.filter((x) => x !== id)));
        toast.error("Something went wrong");
      }
    };

    return { wishlistIds, wishlistCount: wishlistIds.length, loading, isWishlisted, toggleWishlist };
  }, [wishlistIds, loading, user, router]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
