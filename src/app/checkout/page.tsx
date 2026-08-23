"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, setUser, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name || "");
      setEmail((e) => e || user.email || "");
    }
    setRazorpayEnabled(!!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  }, [user]);

  const subtotal = cartTotal;
  const total = Math.max(0, subtotal - discount);
  const showAuthModal = !authLoading && !user;

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, orderTotal: subtotal }),
    });
    const data = await res.json();
    if (data.success) {
      setDiscount(data.discount);
      setAppliedCode(data.code);
      const msg = `Coupon applied: -₹${data.discount}`;
      setCouponMsg(msg);
      toast.success(msg);
    } else {
      setDiscount(0);
      setAppliedCode("");
      const msg = data.error || "Invalid coupon";
      setCouponMsg(msg);
      toast.error(msg);
    }
  }

  async function placeOrder() {
    if (!user) return;
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!name || !phone || !address) {
      toast.error("Please fill all required fields");
      return;
    }
    if (paymentMethod === "RAZORPAY" && !razorpayEnabled) {
      toast.error("Online payment is not configured yet. Choose Cash on Delivery or contact support.");
      return;
    }

    const payload = {
      items: cart,
      customerName: name,
      phone,
      address,
      email,
      couponCode: appliedCode,
      discount,
      paymentMethod,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Order failed");
      return;
    }

    if (paymentMethod === "RAZORPAY" && data.razorpayOrderId && data.key) {
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: "Xellbuy",
        description: `Order #${data.orderId}`,
        order_id: data.razorpayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verify.json();
          if (verify.ok) {
            clearCart();
            setSuccessId(verifyData.orderId);
            toast.success("Payment successful — order placed");
          } else {
            toast.error(verifyData.error || "Payment verification failed");
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#9c2d4a" },
      });
      rzp.open();
      return;
    }

    clearCart();
    setSuccessId(data.orderId);
    toast.success("Order placed successfully");
  }

  if (successId) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page" style={{ textAlign: "center", padding: "40px 0" }}>
          <h2 style={{ color: "var(--color-primary)" }}>Your order is successfully completed</h2>
          <p>
            Your order id is <strong>{successId}</strong>. We&apos;ve emailed you a confirmation.
          </p>
          <Link href="/shop" className="btn btn-accent">
            Continue shopping
          </Link>
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <SiteHeader showSearch={false} />
      <AuthModal
        open={showAuthModal}
        title="Login to checkout"
        message="You must be logged in before placing an order. Sign in or create an account below."
        onSuccess={(u) => {
          setUser(u);
          setName(u.name || "");
          setEmail(u.email || "");
        }}
      />

      <div className={`cart-page ${showAuthModal ? "checkout-locked" : ""}`}>
        <h2>Checkout</h2>
        <p style={{ color: "var(--color-muted)" }}>
          Cash on Delivery or online payment. Order confirmation will be emailed to you.
        </p>

        {!cart.length ? (
          <p>
            Cart empty. <Link href="/shop">Shop now →</Link>
          </p>
        ) : user ? (
          <>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label>Email (order confirmation yahan aayega)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Delivery address</label>
              <textarea value={address} rows={3} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street, city, state, pincode" />
            </div>

            <div className="cart-summary" style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Have a coupon code?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  style={{ flex: 1, padding: "11px 14px", border: "1px solid var(--color-border)", borderRadius: 8, textTransform: "uppercase" }}
                />
                <button className="btn btn-outline" style={{ border: "1px solid var(--color-primary)", color: "var(--color-primary)", whiteSpace: "nowrap" }} onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {couponMsg ? <p style={{ fontSize: 13, margin: "8px 0 0" }}>{couponMsg}</p> : null}
            </div>

            <div className="cart-summary">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 ? (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: "var(--color-sale)" }}>
                  <span>Coupon discount</span>
                  <span>-₹{discount}</span>
                </div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, marginBottom: 10, borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <div className="payment-options">
                <div className="payment-options-title">Payment method</div>
                <label className="payment-option">
                  <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives</small>
                  </span>
                </label>
                <label className={`payment-option ${!razorpayEnabled ? "disabled" : ""}`}>
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={() => setPaymentMethod("RAZORPAY")}
                    disabled={!razorpayEnabled}
                  />
                  <span>
                    <strong>Pay online (UPI / Card / Netbanking)</strong>
                    <small>{razorpayEnabled ? "Secured by Razorpay" : "Not configured — add Razorpay keys in .env"}</small>
                  </span>
                </label>
              </div>
            </div>

            <button className="btn btn-accent" style={{ marginTop: 20, width: "100%" }} onClick={placeOrder}>
              {paymentMethod === "RAZORPAY" ? "Pay & place order" : "Place order (COD)"}
            </button>
          </>
        ) : !authLoading ? (
          <p style={{ color: "var(--color-muted)" }}>Complete login in the popup above to continue checkout.</p>
        ) : (
          <p>Loading…</p>
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
