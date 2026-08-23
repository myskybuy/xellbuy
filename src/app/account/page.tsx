"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/components/AuthProvider";

type Order = { id: number; total: number; status: string; createdAt: string; items: unknown[] };

export default function AccountPage() {
  const { user, setUser, clearUser, refreshUser } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const AUTH_FETCH: RequestInit = { credentials: "include" };

  async function loadOrders() {
    const data = await fetch("/api/account/orders", AUTH_FETCH).then((r) => r.json());
    setOrders(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (user) loadOrders();
    else setOrders([]);
  }, [user]);

  async function doLogin() {
    if (loading) return;
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.otpRequired) {
        setOtpEmail(data.email || loginEmail.trim().toLowerCase());
        if (data.emailSent === false && data.warning) {
          setOtpNotice(data.warning);
          toast.warning(data.warning);
        } else {
          setOtpNotice(`We've sent a 6-digit OTP to ${data.email || loginEmail}. Enter it below to log in.`);
          toast.success("OTP sent to your email");
        }
        setStep("otp");
      } else {
        const msg = data.error || "Login failed";
        setLoginError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function doVerifyOtp() {
    if (loading) return;
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        if (data.user) setUser(data.user);
        else await refreshUser();
        toast.success("Logged in successfully");
        window.location.assign("/profile");
        return;
      }
      const msg = data.error || "Invalid OTP";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function doResendOtp() {
    if (loading) return;
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        if (data.emailSent === false && data.warning) {
          setOtpNotice(data.warning);
          toast.warning(data.warning);
        } else {
          setOtpNotice(`A new OTP has been sent to ${otpEmail}.`);
          toast.success("OTP resent");
        }
      } else {
        const msg = data.error || "Could not resend OTP";
        setLoginError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function doSignup() {
    if (loading) return;
    setSignupError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.user) {
        setUser(data.user);
        toast.success("Account created — you're logged in");
        window.location.assign("/profile");
        return;
      }
      const msg = data.error || "Sign up failed";
      setSignupError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function doLogout() {
    await fetch("/api/auth/logout", { ...AUTH_FETCH, method: "POST" });
    clearUser();
    setOrders([]);
    toast.success("Logged out");
  }

  if (user) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page">
          <h2>My Account</h2>
          <div className="cart-summary" style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
            <div style={{ color: "var(--color-muted)", fontSize: 14 }}>{user.email}</div>
            <Link href="/profile" className="btn btn-outline" style={{ marginTop: 16, marginRight: 10, display: "inline-block" }}>
              View profile
            </Link>
            <button className="btn btn-outline" style={{ marginTop: 16, border: "1px solid var(--color-border)" }} onClick={doLogout}>
              Log out
            </button>
          </div>
          <h2 style={{ fontSize: 20 }}>My Orders</h2>
          {orders.length ? (
            orders.map((o) => (
              <div key={o.id} className="order-card">
                <div className="order-head">
                  <span>Order #{o.id}</span>
                  <span className={`status-tag ${o.status}`}>{o.status}</span>
                </div>
                <div style={{ color: "var(--color-muted)", fontSize: 13.5, marginBottom: 6 }}>
                  {new Date(o.createdAt).toLocaleDateString()} • {Array.isArray(o.items) ? o.items.length : 0} item(s)
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

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="account-page">
        <h2>My Account</h2>

        {step === "otp" ? (
          <div>
            <p className="account-note" style={{ marginBottom: 16 }}>
              {otpNotice}
            </p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                style={{ letterSpacing: "6px", textAlign: "center", fontSize: "18px", fontWeight: 700 }}
              />
            </div>
            <button className="btn btn-accent" style={{ width: "100%" }} onClick={doVerifyOtp} disabled={loading || otp.length !== 6}>
              {loading ? "Verifying…" : "Verify & Log in"}
            </button>
            {loginError ? <p className="account-error">{loginError}</p> : null}
            <p className="account-note">
              Didn&apos;t get the code?{" "}
              <button type="button" className="auth-modal-link" onClick={doResendOtp} disabled={loading}>
                Resend OTP
              </button>
            </p>
            <p className="account-note">
              <button
                type="button"
                className="auth-modal-link"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setLoginError("");
                }}
              >
                ← Back to login
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="account-tabs">
              <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
                Log in
              </button>
              <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>
                Sign up
              </button>
            </div>

            {tab === "login" ? (
              <div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Your password" />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} onClick={doLogin} disabled={loading}>
                  {loading ? "Please wait…" : "Log in"}
                </button>
                <p className="account-note">We&apos;ll email you a one-time code to verify it&apos;s you.</p>
                {loginError ? <p className="account-error">{loginError}</p> : null}
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Full name</label>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} onClick={doSignup} disabled={loading}>
                  {loading ? "Please wait…" : "Create account"}
                </button>
                {signupError ? <p className="account-error">{signupError}</p> : null}
              </div>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
