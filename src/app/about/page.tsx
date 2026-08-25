import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/policies";

const FALLBACK = "/images/product-placeholder.svg";

const categoryCopy: Array<{ key: string; title: string; text: string; href: string }> = [
  {
    key: "Dresses",
    title: "Dresses",
    text: "Mini, midi and maxi silhouettes for everyday, parties and evenings.",
    href: "/shop?category=Dresses",
  },
  {
    key: "Sarees",
    title: "Sarees & Ethnic",
    text: "Festive sarees, Anarkalis and occasion sets without catalogue noise.",
    href: "/shop?category=Sarees",
  },
  {
    key: "Tops",
    title: "Tops & Blouses",
    text: "Crops, blouses and tees that layer into work and weekend outfits.",
    href: "/shop?category=Tops",
  },
  {
    key: "Jeans",
    title: "Denim & Essentials",
    text: "Jeans, shirts and outerwear for everyday rotation.",
    href: "/shop?category=Jeans",
  },
];

export default async function AboutPage() {
  const products = await prisma.product.findMany({
    where: { NOT: { image: { contains: "placeholder" } } },
    orderBy: { id: "asc" },
    take: 16,
    select: { id: true, name: true, image: true, category: true },
  });

  const byCategory = (name: string) => products.find((p) => p.category === name)?.image || products[0]?.image || FALLBACK;

  const heroMain = products[0]?.image || FALLBACK;
  const heroSide = [products[1], products[2], products[4], products[8]].map((p) => p?.image || FALLBACK);
  const pickImage = products[5]?.image || products[3]?.image || FALLBACK;

  return (
    <StoreShell>
      <SiteHeader />

      <section className="about-hero about-hero--fashion">
        <div className="container about-hero-grid">
          <div className="about-copy">
            <p className="about-eyebrow teal">About Xellbuy</p>
            <h1>Women&apos;s fashion, clearly priced and carefully listed.</h1>
            <p className="about-lead">
              Xellbuy is an India-first women&apos;s fashion catalogue — dresses, ethnic wear, denim and everyday
              essentials — so you can see what you&apos;re buying without surprise fees at checkout.
            </p>
            <p className="about-lead">
              Run by {COMPANY.name} out of Surat. We stay small on purpose so every listing gets a real look before it
              goes live.
            </p>
            <Link href="/shop" className="btn btn-accent about-cta">
              Explore the collection →
            </Link>
          </div>

          <div className="about-mosaic" aria-hidden={false}>
            <div className="about-mosaic-main">
              <img src={heroMain} alt={products[0]?.name || "Xellbuy dress"} />
            </div>
            <div className="about-mosaic-side">
              {heroSide.map((src, i) => (
                <div key={i} className="about-mosaic-tile">
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-who about-who--fashion">
        <div className="container about-who-grid">
          <div className="about-who-visual">
            <img src={pickImage} alt="How we pick styles for Xellbuy" />
            <div className="about-who-caption">
              <span>From Surat</span>
              <strong>Listed with clear ₹ pricing</strong>
            </div>
          </div>
          <div className="about-copy">
            <p className="about-eyebrow teal">How we pick</p>
            <h2>What goes on the site — and what doesn&apos;t.</h2>
            <p>
              Every style goes through a basic filter: honest description, wearable silhouette, and a fair ₹ price
              against what you actually get. Fewer pieces we stand behind beats a catalogue padded with filler.
            </p>
            <p>
              Pay via Cash on Delivery if you want to see the piece first, or complete a secure online payment in one
              step. Support is a real conversation when something needs sorting.
            </p>
            <ul className="about-checklist">
              <li>Clear product photos &amp; descriptions</li>
              <li>INR prices with no hidden checkout add-ons</li>
              <li>COD and online payment across India</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-offer about-offer--fashion">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">Shop by edit</p>
            <h2>A tighter edit of women&apos;s wear</h2>
            <p className="about-sub">Real styles from our catalogue — not stock illustrations.</p>
          </div>
          <div className="about-cat-grid">
            {categoryCopy.map((item) => (
              <Link key={item.key} href={item.href} className="about-cat-card">
                <div className="about-cat-media">
                  <img src={byCategory(item.key)} alt="" />
                </div>
                <div className="about-cat-body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span>Shop {item.title.split(" ")[0]} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-strip">
        <div className="container about-strip-row">
          {products.slice(0, 6).map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="about-strip-item" title={p.name}>
              <img src={p.image} alt={p.name} />
            </Link>
          ))}
        </div>
      </section>

      <section className="about-mission about-mission--fashion">
        <div className="container about-mission-inner">
          <p className="about-eyebrow teal">Our aim</p>
          <h2>Fashion discovery without the noise.</h2>
          <p>
            Honest listings, clear INR pricing, and styles we&apos;d stand behind — from discovery on Xellbuy to
            delivery at your doorstep across India.
          </p>
          <Link href="/shop" className="btn btn-accent about-cta">
            Shop now →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </StoreShell>
  );
}
