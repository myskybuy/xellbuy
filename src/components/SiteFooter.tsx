"use client";

import Link from "next/link";
import { COMPANY } from "@/lib/policies";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label="Xellbuy home">
            <img src="/images/xellbuy-logo-transparent-light.png" alt="Xellbuy" className="footer-logo-img" width={335} height={512} />
          </Link>
          <p className="footer-tagline">
            India-first women&apos;s fashion by {COMPANY.name} — dresses, ethnic wear, denim and everyday essentials with clear INR pricing.
          </p>
          <div className="footer-contact">
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link href="/shop?category=Dresses">Dresses</Link>
            <Link href="/shop?category=Tops">Tops</Link>
            <Link href="/shop?category=Blouses">Blouses</Link>
            <Link href="/shop?category=Jeans">Jeans</Link>
            <Link href="/shop?category=Sarees">Sarees</Link>
            <Link href="/shop?category=Ethnic%20Wear">Ethnic Wear</Link>
            <Link href="/shop?sale=1">Price Drops</Link>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <Link href="/contact">Contact</Link>
            <Link href="/shipping-delivery-policy">Shipping</Link>
            <Link href="/return-policy">Returns</Link>
            <Link href="/refund-policy">Refunds</Link>
            <Link href="/cancellation-policy">Cancellation</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-use">Terms</Link>
          </div>

          <div className="footer-col footer-col--company">
            <h4>Company</h4>
            <p className="footer-company-name">{COMPANY.name}</p>
            <p className="footer-address">{COMPANY.address}</p>
            <p className="footer-hours">{COMPANY.supportHours}</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Xellbuy</span>
        <span className="footer-pills">
          <span>INR pricing</span>
          <span>COD available</span>
          <span>Ships across India</span>
        </span>
      </div>
    </footer>
  );
}
