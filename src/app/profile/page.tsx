"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

type OrderItem = { name?: string; qty?: number; salePrice?: number };
type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[] | unknown;
  phone?: string;
  address?: string;
  paymentMethod?: string;
};

type Tab = "details" | "orders" | "password";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, clearUser, loading: authLoading, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>("details");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      refreshUser().then((u) => {
        if (!u) router.replace("/account");
      });
      return;
    }

    setName(user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");

    setOrdersLoading(true);
    fetch("/api/account/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setOrdersLoading(false));
  }, [user, authLoading, refreshUser, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearUser();
    toast.success("Logged out");
    router.push("/account");
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.user) {
        setUser(data.user);
        toast.success("Profile updated");
      } else {
        toast.error(data.error || "Could not update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (savingPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        toast.success("Password updated");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Could not update password");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  if (authLoading || !user) {
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

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="cart-page profile-page">
        <div className="profile-card">
          <div className="profile-avatar" aria-hidden>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-card-meta">
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            {user.phone ? <div className="profile-meta-line">{user.phone}</div> : null}
          </div>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Log out
          </button>
        </div>

        <div className="profile-tabs">
          <button type="button" className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>
            Details
          </button>
          <button type="button" className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button type="button" className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
            Password
          </button>
        </div>

        {tab === "details" ? (
          <form className="profile-panel" onSubmit={saveProfile}>
            <h3 className="profile-section-title">Account details</h3>
            <p className="profile-help">Keep these updated for faster checkout and delivery.</p>
            <div className="form-group">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={user.email} disabled />
            </div>
            <div className="form-group">
              <label>Mobile number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
              />
            </div>
            <div className="form-group">
              <label>Default delivery address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / street, city, state, pincode"
              />
            </div>
            <button className="btn btn-accent" type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save details"}
            </button>
          </form>
        ) : null}

        {tab === "orders" ? (
          <div className="profile-panel">
            <h3 className="profile-section-title">Your orders</h3>
            {ordersLoading ? (
              <p style={{ color: "var(--color-muted)" }}>Loading orders…</p>
            ) : orders.length ? (
              orders.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                return (
                  <div key={o.id} className="order-card">
                    <div className="order-head">
                      <span>Order #{o.id}</span>
                      <span className={`status-tag ${o.status}`}>{o.status}</span>
                    </div>
                    <div className="order-meta">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {items.length} item(s)
                      {o.paymentMethod ? ` · ${o.paymentMethod}` : ""}
                    </div>
                    {items.length ? (
                      <ul className="order-items">
                        {items.slice(0, 4).map((item, idx) => (
                          <li key={idx}>
                            {(item as OrderItem).name || "Item"}
                            {(item as OrderItem).qty ? ` × ${(item as OrderItem).qty}` : ""}
                          </li>
                        ))}
                        {items.length > 4 ? <li>+{items.length - 4} more</li> : null}
                      </ul>
                    ) : null}
                    <div className="order-total">₹{o.total.toLocaleString("en-IN")}</div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "var(--color-muted)" }}>
                No orders yet. <Link href="/shop">Start shopping →</Link>
              </p>
            )}
          </div>
        ) : null}

        {tab === "password" ? (
          <form className="profile-panel" onSubmit={changePassword}>
            <h3 className="profile-section-title">Update password</h3>
            <p className="profile-help">Use a strong password you don&apos;t reuse elsewhere.</p>
            <div className="form-group">
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-accent" type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        ) : null}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
