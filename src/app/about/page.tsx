import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY } from "@/lib/policies";

const HERO_IMG = "/images/about/hero.svg";
const WHO_IMG = "/images/about/who.svg";

const categoryBlocks = [
  {
    title: "Skincare",
    text: "Everyday basics — cleansers, sunscreens, serums and moisturisers chosen for routines people will actually stick with, not 12-step regimens nobody has time for.",
    icon: "🧴",
  },
  {
    title: "Haircare",
    text: "Built around real concerns: frizz, dryness, hair fall, dullness — shampoos, oils, serums and masks that address one of those instead of promising to fix everything at once.",
    icon: "💇‍♀️",
  },
  {
    title: "Makeup",
    text: "Stays wearable. Lip, eye and face products in shades and finishes meant for daily use, not just for a one-time festival look that sits in a drawer afterward.",
    icon: "💄",
  },
  {
    title: "Bath, Body & Fragrance",
    text: "Body washes, lotions, deodorants and perfumes that make the rest of a self-care routine feel finished, not like an afterthought.",
    icon: "🧼",
  },
];

export default function AboutPage() {
  return (
    <StoreShell>
      <SiteHeader />

      <section className="about-hero">
        <div className="container about-split">
          <div className="about-copy">
            <p className="about-eyebrow gold">About Xellbuy</p>
            <h1>Beauty shouldn&apos;t be complicated. We&apos;re here to make it simple.</h1>
            <p className="about-lead">
              Xellbuy exists because shopping for skincare and beauty online in India can feel oddly overwhelming —
              hundreds of near-identical products, confusing ingredient claims, and no easy way to tell what&apos;s
              actually worth your money. We built Xellbuy as the antidote to that: a tighter, more honest selection of
              skincare, haircare, makeup and body-care essentials, picked because they work, not because they&apos;re
              trending for a week.
            </p>
            <p className="about-lead">
              We&apos;re run by {COMPANY.name} out of Surat, and our team is small on purpose. It lets us actually look
              at what we&apos;re listing instead of just uploading a catalogue feed and hoping for the best.
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

      <section className="about-who">
        <div className="container about-split reverse">
          <div className="about-media">
            <img src={WHO_IMG} alt="Xellbuy beauty products" />
          </div>
          <div className="about-copy">
            <p className="about-eyebrow teal">How we pick</p>
            <h2>What goes on the site — and what doesn&apos;t.</h2>
            <p>
              Every product goes through a basic filter before it&apos;s listed: is the description honest, is the
              packaging something we&apos;d trust with our own skin, and is the price fair once you compare it against
              what&apos;s actually inside the bottle. We&apos;re not chasing every new launch — we&apos;d rather have
              fewer products we stand behind than a catalogue padded with filler.
            </p>
            <p>
              Prices are shown clearly in ₹ with no hidden add-ons at checkout. You can pay via Cash on Delivery if you
              want to see the product before paying, or complete a quick, secure online payment if you&apos;d rather
              finish in one step. Either way, support is a real conversation — not a bot loop — whenever something needs
              sorting.
            </p>
          </div>
        </div>
      </section>

      <section className="about-offer">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">Our categories</p>
            <h2>Four categories, and why they exist</h2>
            <p className="about-sub">
              A tighter selection of everyday essentials — chosen for real routines, not noise.
            </p>
          </div>
          <div className="about-offer-grid">
            {categoryBlocks.map((item) => (
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

      <section className="about-mission">
        <div className="container about-mission-inner">
          <p className="about-eyebrow gold">Our aim</p>
          <h2>A beauty store that treats your routine seriously — without making it complicated.</h2>
          <p>
            If you&apos;re looking for honest listings, clear INR pricing, and products we&apos;d stand behind, that&apos;s
            what we&apos;re aiming to be — from discovery on Xellbuy to delivery at your doorstep across India.
          </p>
        </div>
      </section>

      <section className="about-bottom-cta">
        <div className="container">
          <div className="about-cta-banner">
            <h2>Find your everyday essential</h2>
            <p>Explore our collection and discover products that fit your skin, hair and everyday routine.</p>
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
