import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  isAdmin?: boolean;
  pendingOtpEmail?: string;
}

const useSecureCookie =
  process.env.COOKIE_SECURE === "true" ||
  (process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production");

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "xellbuy-dev-secret-change-in-production",
  cookieName: "xellbuy_session",
  cookieOptions: {
    secure: useSecureCookie,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
