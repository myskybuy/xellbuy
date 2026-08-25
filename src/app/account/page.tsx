"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ForgotPasswordStep from "@/components/ForgotPasswordStep";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useAuth } from "@/components/AuthProvider";

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [showForgot, setShowForgot] = useState(false);
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
  const [resendIn, setResendIn] = useState(0);

  const AUTH_FETCH: RequestInit = { credentials: "include" };

  useEffect(() => {
    if (!authLoading && user) router.replace("/profile");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

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
      if (data.success && (data.otpRequired || data.needsOtp)) {
        setOtpEmail(data.email || loginEmail.trim().toLowerCase());
        setOtp("");
        setResendIn(60);
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
        body: JSON.stringify({ email: otpEmail, purpose: "login", code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        if (data.user) setUser(data.user);
        toast.success("Logged in successfully");
        window.location.assign("/profile");
        return;
      }
      const msg = data.error || "Invalid or expired code";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function doResendOtp() {
    if (loading || resendIn > 0) return;
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, purpose: "login" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setResendIn(60);
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

  if (authLoading || user) {
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
      <div className="auth-page">
        <div className="auth-shell">
          <aside className="auth-aside">
            <p className="auth-aside-kicker">Xellbuy account</p>
            <img src="/images/xellbuy-mark.png" alt="" className="auth-aside-mark" width={56} height={56} />
            <h1>Welcome back to clearer fashion shopping.</h1>
            <p>Log in for orders and checkout, or create an account in under a minute.</p>
            <ul className="auth-aside-list">
              <li>Track orders in one place</li>
              <li>Faster COD / online checkout</li>
              <li>Email OTP for secure login</li>
            </ul>
          </aside>

          <div className="auth-panel">
            {step === "otp" ? (
              <div className="auth-panel-body">
                <h2>Verify it&apos;s you</h2>
                <p className="auth-panel-lead">{otpNotice}</p>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                  />
                </div>
                <button className="btn btn-accent auth-submit" onClick={doVerifyOtp} disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying…" : "Verify & Log in"}
                </button>
                {loginError ? <p className="account-error">{loginError}</p> : null}
                <p className="account-note">
                  Didn&apos;t get the code?{" "}
                  <button type="button" className="auth-modal-link" onClick={doResendOtp} disabled={loading || resendIn > 0}>
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
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
              <div className="auth-panel-body">
                {showForgot ? (
                  <>
                    <h2>Reset password</h2>
                    <ForgotPasswordStep
                      onDone={(u) => {
                        setUser(u);
                        setShowForgot(false);
                        window.location.assign("/profile");
                      }}
                      onBack={() => setShowForgot(false)}
                    />
                  </>
                ) : (
                  <>
                    <h2>My Account</h2>
                    <p className="auth-panel-lead">Sign in or create a new Xellbuy account.</p>
                    <div className="account-tabs">
                      <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
                        Log in
                      </button>
                      <button type="button" className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>
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
                        <p className="auth-forgot-row">
                          <button type="button" className="auth-modal-link" onClick={() => setShowForgot(true)}>
                            Forgot password?
                          </button>
                        </p>
                        <button className="btn btn-accent auth-submit" onClick={doLogin} disabled={loading}>
                          {loading ? "Please wait…" : "Continue"}
                        </button>
                        <p className="account-note">We&apos;ll email a one-time code to verify it&apos;s you.</p>
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
                        <button className="btn btn-accent auth-submit" onClick={doSignup} disabled={loading}>
                          {loading ? "Please wait…" : "Create account"}
                        </button>
                        {signupError ? <p className="account-error">{signupError}</p> : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
