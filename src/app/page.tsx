"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FestivePopup from "@/components/FestivePopup";
import ProductCard, { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { StarRatingDisplay } from "@/components/StarRating";

const heroAllowedCategories = ["Dresses", "Tops", "Jeans", "Sarees", "Ethnic Wear", "Blouses", "Skirts"];

const USPS = [
  {
    title: "Cash on delivery",
    desc: "Pay when it arrives, anywhere in India",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <circle cx="12" cy="12.5" r="3" />
        <path d="M6 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
      </svg>
    ),
  },
  {
    title: "Easy 7-day returns",
    desc: "Changed your mind? Send it back, no fuss",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    ),
  },
  {
    title: "Quality checked",
    desc: "Every piece inspected before it ships",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Pan-India shipping",
    desc: "Delivered fast to your doorstep",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7.5" cy="19" r="1.6" />
        <circle cx="17.5" cy="19" r="1.6" />
      </svg>
    ),
  },
];

const PROMO_TILES = [
  {
    kicker: "New in",
    title: "Festive Ethnic Edit",
    cta: "Shop ethnic wear",
    href: "/shop?category=Ethnic%20Wear",
    className: "promo-tile--teal",
  },
  {
    kicker: "Trending",
    title: "Denim, done right",
    cta: "Shop jeans",
    href: "/shop?category=Jeans",
    className: "promo-tile--slate",
  },
  {
    kicker: "Best value",
    title: "Price drops up to 50%",
    cta: "Shop the sale",
    href: "/shop?sale=1",
    className: "promo-tile--rose",
  },
];

type RecentReview = {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  product: { id: number; name: string; image: string };
};

export default function HomePage() {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; image: string }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        const withImage = data.filter((p) => p.image && !p.image.includes("placeholder"));
        const preferred = withImage.filter((p) => heroAllowedCategories.includes(p.category));
        setHeroProducts((preferred.length ? preferred : withImage).slice(0, 8));
      });
    fetch("/api/reviews/recent?limit=6")
      .then((r) => r.json())
      .then(setRecentReviews)
      .catch(() => setRecentReviews([]));
  }, []);

  useEffect(() => {
    if (!heroProducts.length || heroPaused) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % heroProducts.length), 5200);
    return () => clearInterval(timer);
  }, [heroProducts.length, heroPaused]);

  const currentHero = heroProducts[heroIndex];
  const lookLabel = currentHero
    ? `${String(heroIndex + 1).padStart(2, "0")} / ${String(heroProducts.length).padStart(2, "0")}`
    : null;

  return (
    <>
      <FestivePopup />
      <StoreShell>
        <SiteHeader />

        <section
          className="hero hero--fashion"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="hero-stage">
            {heroProducts.length ? (
              heroProducts.map((product, index) => {
                const active = index === heroIndex;
                return (
                  <div
                    key={product.id}
                    className={`hero-stage-slide ${active ? "active" : ""}`}
                    aria-hidden={!active}
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="hero-stage-img"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                );
              })
            ) : (
              <div className="hero-stage-slide active hero-stage-slide--empty" />
            )}
            <div className="hero-stage-shade" aria-hidden />
            <div className="hero-stage-grain" aria-hidden />

            <div className="hero-stage-content" key={heroIndex}>
              <p className="hero-brand">Xellbuy</p>
              <h1>
                Women&apos;s fashion,
                <span>cut clean.</span>
              </h1>
              <p className="hero-lead">
                Dresses, ethnic wear and denim — honest ₹ prices, COD across India.
              </p>
              <div className="hero-actions">
                <Link href="/shop" className="btn btn-accent">
                  Shop the edit
                </Link>
                <Link href="/shop?category=Dresses" className="btn btn-ghost">
                  Dresses
                </Link>
              </div>
            </div>

            {heroProducts.length > 1 ? (
              <div className="hero-rail">
                <div className="hero-rail-meta">
                  <span className="hero-look-num">{lookLabel}</span>
                  {currentHero ? (
                    <Link href={`/product/${currentHero.id}`} className="hero-look-link">
                      View look
                    </Link>
                  ) : null}
                </div>
                <div
                  className={`hero-progress ${heroPaused ? "is-paused" : ""}`}
                  key={`progress-${heroIndex}`}
                  aria-hidden
                />
                <div className="hero-controls">
                  <button
                    type="button"
                    className="hero-nav-btn"
                    aria-label="Previous look"
                    onClick={() => setHeroIndex((i) => (i - 1 + heroProducts.length) % heroProducts.length)}
                  >
                    ‹
                  </button>
                  <div className="hero-thumbs">
                    {heroProducts.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        className={`hero-thumb ${index === heroIndex ? "active" : ""}`}
                        aria-label={`Look ${index + 1}`}
                        aria-current={index === heroIndex}
                        onClick={() => setHeroIndex(index)}
                      >
                        <img src={product.image} alt="" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="hero-nav-btn"
                    aria-label="Next look"
                    onClick={() => setHeroIndex((i) => (i + 1) % heroProducts.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="usp-strip">
          <div className="container usp-strip-inner">
            {USPS.map((u) => (
              <div className="usp-item" key={u.title}>
                <span className="usp-icon" aria-hidden>
                  {u.icon}
                </span>
                <div>
                  <strong>{u.title}</strong>
                  <span>{u.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Shop by category</div>
                <h2>Find your next look</h2>
              </div>
            </div>
            <div className="category-cards">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  className={`category-card cc-${c.name.replace(/[^a-zA-Z]/g, "").toLowerCase()}`}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                >
                  <div className="cc-thumb">
                    {c.image ? (
                      <img src={c.image} alt="" className="cc-img" />
                    ) : (
                      <span className="cc-initial" aria-hidden>
                        {c.name.charAt(0)}
                      </span>
                    )}
                    <span className="cc-shade" aria-hidden />
                    <span className="cc-label">
                      {c.name}
                      <span className="cc-arrow" aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="promo-grid">
              {PROMO_TILES.map((tile) => (
                <Link key={tile.title} href={tile.href} className={`promo-tile ${tile.className}`}>
                  <span className="promo-tile-kicker">{tile.kicker}</span>
                  <span className="promo-tile-title">{tile.title}</span>
                  <span className="promo-tile-cta">{tile.cta} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Freshly curated</div>
                <h2>Featured styles</h2>
              </div>
              <Link href="/shop">View all →</Link>
            </div>
            <div className="product-grid">{products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>

        {products.length > 8 ? (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container">
              <div className="section-head">
                <div>
                  <div className="eyebrow">Just landed</div>
                  <h2>New arrivals</h2>
                </div>
                <Link href="/shop">View all →</Link>
              </div>
              <div className="product-grid">
                {[...products]
                  .reverse()
                  .slice(0, 8)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            </div>
          </section>
        ) : null}

        {recentReviews.length ? (
          <section className="section testimonial-section" style={{ paddingTop: 0 }}>
            <div className="container">
              <div className="section-head">
                <div>
                  <div className="eyebrow">Loved by customers</div>
                  <h2>What shoppers are saying</h2>
                </div>
              </div>
              <div className="testimonial-grid">
                {recentReviews.map((r) => (
                  <div className="testimonial-card" key={r.id}>
                    <StarRatingDisplay rating={r.rating} />
                    <p className="testimonial-comment">&ldquo;{r.comment}&rdquo;</p>
                    <div className="testimonial-meta">
                      <img src={r.product.image} alt="" className="testimonial-product-img" />
                      <div>
                        <strong>{r.userName}</strong>
                        <Link href={`/product/${r.product.id}`}>{r.product.name}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="cta-band">
          <div className="eyebrow">Explore the catalogue</div>
          <h2>Browse dresses, ethnic wear, denim and everyday essentials in one place.</h2>
          <Link href="/shop" className="btn btn-outline">
            See all styles →
          </Link>
        </div>

        <SiteFooter />
      </StoreShell>
    </>
  );
}
