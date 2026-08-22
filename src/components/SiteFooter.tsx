"use client";

import Link from "next/link";
import { COMPANY } from "@/lib/policies";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h4>XELLBUY</h4>
          <p>
            An India-first beauty catalogue by {COMPANY.name} for skincare, haircare, makeup and fragrance.
          </p>
        </div>
        <div>
          <h4>SHOP</h4>
          <Link href="/shop?category=Skincare">Skincare</Link>
          <Link href="/shop?category=Haircare">Haircare</Link>
          <Link href="/shop?category=Makeup">Makeup</Link>
        </div>
        <div>
          <h4>SUPPORT</h4>
          <Link href="/contact">Contact</Link>
          <Link href="/return-policy">Return Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/cancellation-policy">Cancellation Policy</Link>
          <Link href="/shipping-delivery-policy">Shipping &amp; Delivery Policy</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-use">Terms of Use</Link>
        </div>
        <div>
          <h4>COMPANY</h4>
          <p>
            <strong>{COMPANY.name}</strong>
          </p>
          <p>{COMPANY.address}</p>
          <p>
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
          </p>
          <p>
            <a href="tel:+919213558031">+91 92135-58031</a>
          </p>
          <p>
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 XELLBUY BEAUTY</span>
        <span>TRUSTED BRANDS • INR PRICING • COD CHECKOUT</span>
      </div>
    </footer>
  );
}
