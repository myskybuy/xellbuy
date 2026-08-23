import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY } from "@/lib/policies";

const HERO_IMG = "/images/about/hero.svg";
const WHO_IMG = "/images/about/who.svg";

const offers = [
  {
    title: "Skincare",
    text: "Serums, sunscreens, cleansers and moisturisers picked for everyday routines that actually work.",
    icon: "🧴",
  },
  {
    title: "Haircare",
    text: "Shampoos, hair oils, serums and masks for stronger, smoother, healthier-looking hair.",
    icon: "💇‍♀️",
  },
  {
    title: "Makeup",
    text: "Lip, eye and face essentials in wearable shades for everyday glam and special occasions.",
    icon: "💄",
  },
  {
    title: "Bath, Body & Fragrance",
    text: "Body washes, lotions, deodorants and perfumes that round out a complete self-care routine.",
    icon: "🧼",
  },
];

const reasons = [
  {
    num: "01",
    title: "Quality First",
    text: "Carefully selected beauty brands with quality in mind — honest listings and clear ingredient-led descriptions.",
  },
  {
    num: "02",
    title: "Trusted Brands",
    text: "A curated mix of loved skincare, haircare and makeup labels, chosen for real everyday results.",
  },
  {
    num: "03",
    title: "Great Value",
    text: "Beauty essentials with transparent INR pricing — no hidden surprises at checkout.",
  },
  {
    num: "04",
    title: "Customer Focused",
    text: "Your shopping experience is at the heart of what we do — COD, easy support, and clear policies.",
  },
];

export default function AboutPage() {
  return (
    <StoreShell>
      <SiteHeader />

      {/* Hero */}
      <section className="about-hero">
        <div className="container about-split">
          <div className="about-copy">
            <p className="about-eyebrow gold">About Xellbuy</p>
            <h1>More than just a beauty haul.</h1>
            <p className="about-lead">
              Xellbuy is an India-first beauty catalogue by {COMPANY.name}. We bring together skincare,
              haircare, makeup and fragrance from brands you trust — so you can build a routine that
              works, with transparent pricing, honest listings, and a checkout experience built for
              Indian shoppers, including Cash on Delivery.
            </p>
            <Link href="/shop" className="btn btn-accent about-cta">
              Explore Our Collection →
            </Link>
          </div>
          <div className="about-media">
            <img src={HERO_IMG} alt="Xellbuy beauty edit" />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="about-who">
        <div className="container about-split reverse">
          <div className="about-media">
            <img src={WHO_IMG} alt="Xellbuy beauty products" />
          </div>
          <div className="about-copy">
            <p className="about-eyebrow teal">Who We Are</p>
            <h2>Made For Your Everyday Routine.</h2>
            <p>
              At Xellbuy, we believe good beauty products do more than sit on a shelf — they support
              how you feel every day. Whether you are building a simple skincare routine, restocking
              your favourite shampoo, or picking up a new lipstick shade, the right product should feel
              reliable, be well-priced, and fit real Indian routines.
            </p>
            <p>
              We curate products with a focus on trusted brands, clear pricing in ₹, and a shopping
              experience that feels simple and trustworthy. From first visit to delivery, our goal is
              to help you choose with confidence — with honest product details, responsive support, and
              policies designed around how customers actually shop online.
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="about-offer">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">What We Offer</p>
            <h2>Designed For Every Routine</h2>
            <p className="about-sub">
              A curated selection of everyday beauty essentials — skincare, haircare, makeup and
              fragrance — chosen for quality, value and lasting everyday use.
            </p>
          </div>
          <div className="about-offer-grid">
            {offers.map((item) => (
              <article key={item.title} className="about-offer-card">
                <div className="about-offer-icon" aria-hidden>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="about-why">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">Why Xellbuy</p>
            <h2>Why Choose Us?</h2>
          </div>
          <div className="about-why-grid">
            {reasons.map((r) => (
              <article key={r.num} className="about-why-item">
                <span className="about-why-num">{r.num}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="container about-mission-inner">
          <p className="about-eyebrow gold">Our Mission</p>
          <h2>Making Everyday Beauty Better, One Product At A Time.</h2>
          <p>
            Our mission is to make trusted skincare, haircare and makeup accessible to everyone while
            creating a shopping experience built around quality, trust and customer satisfaction — from
            discovery on Xellbuy to delivery at your doorstep across India.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="about-bottom-cta">
        <div className="container">
          <div className="about-cta-banner">
            <h2>Find Your Everyday Essential</h2>
            <p>
              Explore our collection and discover the beauty products that fit your skin, hair and
              everyday routine.
            </p>
            <Link href="/shop" className="btn about-cta-btn">
              Shop Now →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </StoreShell>
  );
}
