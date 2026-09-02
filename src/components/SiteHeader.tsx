"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

const NAV = [
  { href: "/shop?category=Dresses", label: "Dresses" },
  { href: "/shop?category=Tops", label: "Tops" },
  { href: "/shop?category=Blouses", label: "Blouses" },
  { href: "/shop?category=Jeans", label: "Jeans" },
  { href: "/shop?category=Sarees", label: "Sarees" },
  { href: "/shop?category=Ethnic%20Wear", label: "Ethnic Wear" },
  { href: "/shop?sale=1", label: "Price Drops" },
  { href: "/about", label: "About" },
];

export default function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
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
      <div className="header-top">
        <Link href="/" className="logo" onClick={() => setNavOpen(false)} aria-label="Xellbuy home">
          <img src="/images/xellbuy-logo-transparent.png" alt="Xellbuy" className="logo-img" width={335} height={512} />
        </Link>

        {showSearch ? (
          <form onSubmit={onSearch} className="search-wrap" role="search">
            <span className="search-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </span>
            <input
              className="search-box"
              placeholder="Search dresses, tops, sarees…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="search-submit" disabled={!query.trim()}>
              Search
            </button>
          </form>
        ) : (
          <div className="search-wrap search-wrap--empty" aria-hidden />
        )}

        <div className="header-actions">
          <Link
            href={user ? "/profile" : "/account"}
            className="header-icon-btn"
            title={user ? "My profile" : "Login / Sign up"}
            aria-label={user ? "My profile" : "Login or sign up"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 19.5c0-3.4 3.1-6 7-6s7 2.6 7 6" />
            </svg>
            <span className="header-icon-label">{user ? user.name.split(" ")[0] : "Account"}</span>
          </Link>

          <Link href="/wishlist" className="header-icon-btn wishlist-icon-btn" aria-label={`Wishlist, ${wishlistCount} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.7 2.2 4 5.9 4c2.1 0 3.7 1.1 4.6 2.6C11.4 5.1 13 4 15.1 4c3.7 0 5.5 3.7 3.9 7.2-2.5 4.7-10 9.3-10 9.3z" />
            </svg>
            {wishlistCount > 0 ? <span className="cart-badge">{wishlistCount > 99 ? "99+" : wishlistCount}</span> : null}
          </Link>

          <Link href="/cart" className="header-icon-btn cart-icon-btn" aria-label={`Cart, ${cartCount} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6l-1-3H2" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {cartCount > 0 ? <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span> : null}
          </Link>

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
        </div>
      </div>

      <nav className={`main-nav ${navOpen ? "open" : ""}`} aria-label="Primary">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setNavOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
