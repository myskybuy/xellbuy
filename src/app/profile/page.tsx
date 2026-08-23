"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

type Order = { id: number; total: number; status: string; createdAt: string; items: unknown[] };

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearUser, loading: authLoading, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Session may still be settling after signup — one refresh before bounce.
      refreshUser().then((u) => {
        if (!u) router.replace("/account");
      });
      return;
    }

    setOrdersLoading(true);
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setOrdersLoading(false));
  }, [user, authLoading, refreshUser, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUser();
    toast.success("Logged out");
    router.push("/account");
  }

  if (authLoading || (!user && ordersLoading)) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page">
          <p>Loading…</p>
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  if (!user) return null;

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="cart-page profile-page">
        <h2>My Profile</h2>
        <div className="profile-card">
          <div className="profile-avatar" aria-hidden>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
          </div>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Log out
          </button>
        </div>

        <h3 className="profile-section-title">Recent orders</h3>
        {ordersLoading ? (
          <p style={{ color: "var(--color-muted)" }}>Loading orders…</p>
        ) : orders.length ? (
          orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-head">
                <span>Order #{o.id}</span>
                <span className={`status-tag ${o.status}`}>{o.status}</span>
              </div>
              <div style={{ color: "var(--color-muted)", fontSize: 13.5, marginBottom: 6 }}>
                {new Date(o.createdAt).toLocaleDateString()} · {Array.isArray(o.items) ? o.items.length : 0} item(s)
              </div>
              <div style={{ fontWeight: 700 }}>₹{o.total}</div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--color-muted)" }}>
            No orders yet. <Link href="/shop">Start shopping →</Link>
          </p>
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
