"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";

type User = { id: number; name: string; email: string };

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  function goCheckout(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      setShowAuth(true);
    }
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <AuthModal
        open={showAuth}
        title="Login to checkout"
        message="Please log in or sign up before proceeding to checkout."
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuth(false);
          window.location.href = "/checkout";
        }}
      />
      <div className="cart-page">
        <h2>My Cart</h2>
        {!cart.length ? (
          <p style={{ color: "var(--color-muted)" }}>
            Your cart is empty. <Link href="/shop">Continue shopping →</Link>
          </p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <div>₹{item.salePrice}</div>
                  <div className="qty-controls">
                    <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>₹{item.salePrice * item.qty}</div>
                  <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="cart-summary">
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <Link href="/checkout" className="btn btn-accent" style={{ marginTop: 16, display: "inline-block" }} onClick={goCheckout}>
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
