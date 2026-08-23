"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth, type AuthUser } from "./AuthProvider";

type AuthModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  onSuccess: (user: AuthUser) => void;
};

export default function AuthModal({
  open,
  title = "Login required",
  message = "Please log in or create an account to continue checkout.",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const AUTH_FETCH: RequestInit = { credentials: "include" };

  useEffect(() => {
    if (!open || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, resendIn]);

  if (!open) return null;

  function resetToForm() {
    setStep("form");
    setOtp("");
    setError("");
    setNotice("");
    setResendIn(0);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
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
        setStep("otp");
        if (data.emailSent === false && data.warning) {
          setNotice(data.warning);
          toast.warning(data.warning);
        } else {
          setNotice(`We've sent a 6-digit OTP to ${data.email || loginEmail}. Enter it below to log in.`);
          toast.success("OTP sent to your email");
        }
      } else {
        const msg = data.error || "Login failed";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        ...AUTH_FETCH,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, purpose: "login", code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.user) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        onSuccess(data.user);
        resetToForm();
      } else {
        const msg = data.error || "Invalid or expired code";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (loading || resendIn > 0) return;
    setError("");
    setNotice("");
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
          setNotice(data.warning);
          toast.warning(data.warning);
        } else {
          setNotice(`A new OTP has been sent to ${otpEmail}.`);
          toast.success("Code resent");
        }
      } else {
        const msg = data.error || "Could not resend OTP";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
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
        onSuccess(data.user);
      } else {
        const msg = data.error || "Sign up failed";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        {onClose ? (
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        ) : null}

        {step === "otp" ? (
          <>
            <h2>Verify your email</h2>
            <p className="auth-modal-msg">{notice}</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  required
                  style={{ letterSpacing: "6px", textAlign: "center", fontSize: "18px", fontWeight: 700 }}
                />
              </div>
              <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying…" : "Verify & Log in"}
              </button>
            </form>
            <p className="account-note">
              Didn&apos;t get the code?{" "}
              <button type="button" className="auth-modal-link" onClick={handleResendOtp} disabled={loading || resendIn > 0}>
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </button>
            </p>
            <p className="account-note">
              <button type="button" className="auth-modal-link" onClick={resetToForm}>
                ← Back to login
              </button>
            </p>
            {error ? <p className="auth-modal-error">{error}</p> : null}
          </>
        ) : (
          <>
            <h2>{title}</h2>
            <p className="auth-modal-msg">{message}</p>
            <div className="account-tabs">
              <button type="button" className={tab === "login" ? "active" : ""} onClick={() => { setTab("login"); setError(""); }}>
                Log in
              </button>
              <button type="button" className={tab === "signup" ? "active" : ""} onClick={() => { setTab("signup"); setError(""); }}>
                Sign up
              </button>
            </div>
            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Your password" required />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
                  {loading ? "Please wait…" : "Log in"}
                </button>
                <p className="account-note">We&apos;ll email you a one-time code to verify it&apos;s you.</p>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>Full name</label>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
                  {loading ? "Please wait…" : "Create account"}
                </button>
              </form>
            )}
            {error ? <p className="auth-modal-error">{error}</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
