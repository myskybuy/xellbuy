"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FestivePopup from "@/components/FestivePopup";
import ProductCard, { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

const heroAllowedCategories = ["Dresses", "Tops", "Jeans", "Sarees", "Ethnic Wear", "Blouses", "Skirts"];

export default function HomePage() {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; image: string }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

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
                    <span className="cc-label">{c.name}</span>
                  </div>
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
