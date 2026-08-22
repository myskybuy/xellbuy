"use client";

import { FormEvent, useState } from "react";

type User = { id: number; name: string; email: string };

type AuthModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  onSuccess: (user: User) => void;
};

export default function AuthModal({
  open,
  title = "Login required",
  message = "Please log in or create an account to continue checkout.",
  onClose,
  onSuccess,
}: AuthModalProps) {
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

  if (!open) return null;

  function resetToForm() {
    setStep("form");
    setOtp("");
    setError("");
    setNotice("");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.otpRequired) {
        setOtpEmail(data.email || loginEmail);
        setStep("otp");
        setNotice(`We've sent a 6-digit OTP to ${data.email || loginEmail}. Enter it below to log in.`);
      } else {
        setError(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otp }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        resetToForm();
      } else {
        setError(data.error || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (data.success) setNotice(`A new OTP has been sent to ${otpEmail}.`);
      else setError(data.error || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) onSuccess(data.user);
      else setError(data.error || "Sign up failed");
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
              <button type="button" className="auth-modal-link" onClick={handleResendOtp} disabled={loading}>
                Resend OTP
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
