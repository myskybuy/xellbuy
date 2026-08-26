"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/components/AuthProvider";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    fetch("/api/wishlist", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []));
  }, [user]);

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Saved for later</div>
              <h2>My wishlist</h2>
            </div>
          </div>

          {!authLoading && !user ? (
            <p className="review-empty">
              <Link href="/account">Login</Link> to see and save items to your wishlist.
            </p>
          ) : items === null ? (
            <p className="review-empty">Loading…</p>
          ) : items.length ? (
            <div className="product-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="review-empty">
              Nothing saved yet — tap the heart on any product to add it here. <Link href="/shop">Browse products →</Link>
            </p>
          )}
        </div>
      </section>
      <SiteFooter />
    </StoreShell>
  );
}
