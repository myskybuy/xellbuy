"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";

export default function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setNavOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" onClick={() => setNavOpen(false)}>
          <span className="logo-mark">X</span>
          <span className="logo-word">
            <span className="logo-my">XELL</span>
            <span className="logo-skybuy">BUY</span>
          </span>
        </Link>

        {showSearch ? (
          <form onSubmit={onSearch} className="search-wrap">
            <span className="search-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </span>
            <input
              className="search-box"
              placeholder="Search skincare, makeup, haircare…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>
        ) : null}

        <button
          type="button"
          className={`nav-toggle ${navOpen ? "open" : ""}`}
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${navOpen ? "open" : ""}`}>
          <Link href="/shop?category=Skincare" onClick={() => setNavOpen(false)}>
            Skincare
          </Link>
          <Link href="/shop?category=Haircare" onClick={() => setNavOpen(false)}>
            Haircare
          </Link>
          <Link href="/shop?category=Makeup" onClick={() => setNavOpen(false)}>
            Makeup
          </Link>
          <Link href="/shop?category=Bath%20%26%20Body" onClick={() => setNavOpen(false)}>
            Bath &amp; Body
          </Link>
          <Link href="/shop?category=Fragrance" onClick={() => setNavOpen(false)}>
            Fragrance
          </Link>
          <Link href="/shop?sale=1" onClick={() => setNavOpen(false)}>
            Price Drops
          </Link>
          <Link href="/about" onClick={() => setNavOpen(false)}>
            About Us
          </Link>
        </nav>

        <div className="header-actions">
          <Link href={user ? "/profile" : "/account"} className="profile-link" title={user ? "My profile" : "Login / Sign up"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="profile-label">{user ? user.name.split(" ")[0] : "Account"}</span>
          </Link>
          <Link href="/cart" className="cart-pill">
            Cart ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}
