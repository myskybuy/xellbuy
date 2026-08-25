"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import ForgotPasswordStep from "@/components/ForgotPasswordStep";
import OtpStep from "@/components/OtpStep";

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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!open) return null;

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.needsOtp && data.email) {
        toast.success("Verification code sent");
        setOtpEmail(data.email);
      } else if (data.success && data.user) {
        toast.success("Logged in");
        onSuccess(data.user);
      } else {
        toast.error(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        toast.success("Account created. You're logged in.");
        onSuccess(data.user);
      } else {
        toast.error(data.error || "Sign up failed");
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
        <h2>{otpEmail ? "Verify email" : showForgotPassword ? "Reset password" : title}</h2>
        <p className="auth-modal-msg">
          {otpEmail ? "We sent a 6-digit code to your email." : showForgotPassword ? "" : message}
        </p>
        {otpEmail ? (
          <OtpStep email={otpEmail} purpose="login" onVerified={onSuccess} onBack={() => setOtpEmail(null)} />
        ) : showForgotPassword ? (
          <ForgotPasswordStep onDone={onSuccess} onBack={() => setShowForgotPassword(false)} />
        ) : (
          <>
            <div className="account-tabs">
              <button type="button" className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
                Log in
              </button>
              <button type="button" className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>
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
                <div style={{ textAlign: "right", marginBottom: 14 }}>
                  <button type="button" className="otp-link" onClick={() => setShowForgotPassword(true)}>
                    Forgot password?
                  </button>
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
                  {loading ? "Please wait…" : "Log in"}
                </button>
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
          </>
        )}
      </div>
    </div>
  );
}
