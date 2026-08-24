export const COMPANY = {
  name: "SKYBUY PRIVATE LIMITED",
  brand: "Xellbuy",
  address:
    "2ND FLOOR,Building No./Flat No.: 208,RANGILA PAR,Surat,Gujarat-394101",
  phone: "+91 92135-58031",
  email: "hello@xellbuy.com",
  website: "https://xellbuy.com",
  supportHours: "Monday–Saturday, 10:00 AM – 6:30 PM IST",
};

export type PolicyContent = {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string; bullets?: string[] }>;
};

export const policies: Record<string, PolicyContent> = {
  "return-policy": {
    title: "Return Policy",
    intro:
      "We know beauty products are personal — here's exactly what makes something returnable at Xellbuy, and what doesn't.",
    sections: [
      {
        heading: "How long you have",
        body: "You get a 7-day window from your delivery date to raise a return request. This is checked against the courier's own delivery timestamp, so keep an eye on your tracking updates. If something arrives defective or isn't what you ordered, we handle that separately — see the section below; no 7-day clock is involved for those cases.",
      },
      {
        heading: "What qualifies for return",
        body: "A return is accepted when all of the following are true:",
        bullets: [
          "The product is completely unused and unopened — this matters a lot for beauty items.",
          "Seals, shrink-wrap, and any tamper-evident packaging are still intact.",
          "Original box, batch sticker and any inner packaging are all present.",
          "You can share your order number and, if we ask, a few clear photos.",
          "The item matches exactly what shows on your order confirmation.",
        ],
      },
      {
        heading: "What we can't accept back",
        body: "Because these are personal-use products, a few categories are excluded from returns for hygiene reasons regardless of condition — opened or used skincare, haircare or makeup, any lip or eye product once the seal is broken, items marked \"final sale,\" and free samples or testers included with an order. If any of these arrive damaged, defective, or wrong, that's a different process — covered next.",
      },
      {
        heading: "How to request a return",
        body: `Email ${COMPANY.email} or call ${COMPANY.phone} with your order number, which product it's for, and the reason. We typically get back to you within 1–2 business days with either pickup arrangements or self-ship instructions, whichever suits your location.`,
      },
      {
        heading: "What we do once it reaches us",
        body: "Our team checks the returned item against the conditions above before approving anything. If it passes, we move straight into processing your refund. If it doesn't — say, the seal's broken or packaging is missing — we'll explain why and may need to send it back to you, with shipping on your side.",
      },
      {
        heading: "Received something damaged, wrong, or expired?",
        body: "This one's on us to fix quickly. Get in touch within 48 hours of delivery with photos of the unboxing, and we'll arrange either a replacement or a full refund — no shipping cost to you once it's confirmed.",
      },
      {
        heading: "Legal",
        body: `Returns are managed by ${COMPANY.name}. Any legal dispute is governed by Indian law, with courts in Surat, Gujarat having jurisdiction.`,
      },
    ],
  },

  "refund-policy": {
    title: "Refund Policy",
    intro: "Here's the honest breakdown of how and when your money comes back.",
    sections: [
      {
        heading: "Cases where a refund kicks in",
        body: "A refund applies when:",
        bullets: [
          "Your returned product passed inspection and was approved.",
          "You cancelled before dispatch and had already paid online.",
          "A payment was deducted but your order never actually went through.",
          "We couldn't fulfil the order due to something on our side.",
        ],
      },
      {
        heading: "Paid online?",
        body: "Refunds go back to the exact card, UPI ID or bank account you paid with — we can't redirect it elsewhere. Once approved on our end, expect it to land within 5–7 business days, though the final leg depends on your bank or UPI app's own processing time, which we can't speed up.",
      },
      {
        heading: "Paid Cash on Delivery?",
        body: "Since no payment was collected at the time of the order, there's nothing to reverse automatically. For an approved COD return, we'll email you asking for a UPI ID or bank account, then transfer the amount directly — usually completed within 7–10 business days of approval.",
      },
      {
        heading: "What you actually get back",
        body: "The product price, minus any coupon that was already applied, is refundable. Shipping charges don't come back unless the return was our fault — wrong item sent, or a confirmed manufacturing defect.",
      },
      {
        heading: "Only returning part of a bigger order?",
        body: "We refund just the item(s) that were returned and approved, not the whole order value. If a discount code applied across the full cart, we recalculate its share against what's actually being refunded.",
      },
      {
        heading: "Charged more than once for the same order?",
        body: `Send payment screenshots and your order ID to ${COMPANY.email}. We'll verify with our payment gateway and push the duplicate amount back to your original payment method once confirmed.`,
      },
      {
        heading: "Updates & support",
        body: `You'll see refund updates land in your registered email as things progress. Questions along the way — ${COMPANY.email} or ${COMPANY.phone}. We're ${COMPANY.name}, and we do read these emails ourselves.`,
      },
    ],
  },

  "cancellation-policy": {
    title: "Cancellation Policy",
    intro:
      "Sometimes you just need to cancel — here's how that works depending on where your order is in the process.",
    sections: [
      {
        heading: "Order hasn't shipped yet",
        body: `This is the simple case. Write to ${COMPANY.email} or call ${COMPANY.phone} with your order ID and we'll check if it's still sitting with us. If the courier hasn't picked it up, we cancel it right there.`,
      },
      {
        heading: "If you'd already paid online",
        body: "Once we confirm the cancellation before dispatch, your entire payment — product price and any shipping charge — is refunded per our Refund Policy, no deductions.",
      },
      {
        heading: "If it was a COD order",
        body: "Nothing needs refunding since no money was ever collected. We just mark it cancelled in our system. One thing worth knowing: if COD cancellations become a repeated pattern on an account, we may restrict COD as a payment option for future orders — it helps us keep things fair for our delivery partners.",
      },
      {
        heading: "Order's already left our warehouse",
        body: "At this point, cancelling through the site isn't possible anymore. You've still got options — decline the package at your doorstep if the courier permits it (it'll route back to us for standard return processing), or simply accept it and file a return request within our usual window instead.",
      },
      {
        heading: "When we cancel from our end",
        body: "Occasionally we have to — a product sells out faster than our stock count updates, we catch a listing or pricing mistake, a payment looks incomplete or suspicious, or your pin code turns out to be outside our delivery zone. Whenever this happens, we refund whatever was paid, in full, automatically.",
      },
      {
        heading: "Want to check your order status?",
        body: "It's visible anytime under your account's Orders section. If a cancellation is time-sensitive, reach out as early as you can — once packing starts, the window closes fast.",
      },
    ],
  },

  "shipping-delivery-policy": {
    title: "Shipping & Delivery Policy",
    intro: "The practical details on how your order gets to you.",
    sections: [
      {
        heading: "Pin codes we cover",
        body: "We ship across the vast majority of India using established courier partners. A small number of remote or restricted pin codes may face longer delivery windows or reduced COD availability — this shows up automatically at checkout if it applies to you.",
      },
      {
        heading: "Time to dispatch",
        body: "Once your order is confirmed, it typically leaves our facility within 1–3 business days, not counting Sundays or public holidays. Sale periods can add a bit of extra time on our end — we'll notify you by email or SMS if that's the case.",
      },
      {
        heading: "How long delivery takes after that",
        body: "Most metro and Tier-1 city orders arrive within 3–7 business days of dispatch. More remote locations can take up to 7–10 business days. These are realistic estimates based on courier performance, not fixed promises — occasional delays outside our control can happen.",
      },
      {
        heading: "Shipping charges, if any",
        body: "Whatever shipping fee applies is shown at checkout before you confirm your order — never as a surprise afterward. Any live free-shipping offer will also show up there.",
      },
      {
        heading: "How your order is packed",
        body: "Beauty products travel with extra care — bottles, tubes and glass packaging get cushioned specifically to survive transit without leaking or cracking. When your parcel arrives, a quick glance at the outer box before accepting it is a good habit; flag anything visibly damaged with the courier if you can.",
      },
      {
        heading: "If delivery attempts don't work out",
        body: "Courier partners generally try more than once before giving up. If they still can't reach you — say, an unreachable number or repeated unavailability — the order returns to us, and sending it out again may involve an additional shipping charge.",
      },
      {
        heading: "Parcel arrived damaged, or something's missing?",
        body: "Reach out within 48 hours with photos of the box and the product itself. We'll coordinate with the courier partner directly and get you a resolution.",
      },
      {
        heading: "Get in touch",
        body: `${COMPANY.name}, ${COMPANY.address} | ${COMPANY.phone} | ${COMPANY.email}`,
      },
    ],
  },

  "privacy-policy": {
    title: "Privacy Policy",
    intro: "A plain-language explanation of how Xellbuy handles your personal information.",
    sections: [
      {
        heading: "What we collect from you",
        body: "Your name, phone number, email, and delivery/billing address, to start. If you have an account, we keep your login credentials (never as plain text) and your order history. We also track what you've bought, how much you paid, and whether it was COD or an online payment, plus basic technical details like browser type, device and IP address through the cookies that keep the site functioning. Anything you send us via a contact form, email, or call is stored too.",
      },
      {
        heading: "Why we actually need it",
        body: "Primarily to get your order to you correctly — confirmations, shipping updates, and support replies all depend on this data. Beyond that, it helps us keep your account secure, understand how the site is used so we can improve it, and meet tax and accounting requirements under Indian law.",
      },
      {
        heading: "About your consent",
        body: "By creating an account, checking out, or messaging us through a contact form, you're agreeing to this kind of processing. Marketing emails are opt-out any time you like — order and delivery-related emails will keep coming regardless, since we need those to actually get your products to you.",
      },
      {
        heading: "Who we share data with",
        body: "We don't sell your information to anyone. It's shared only where necessary: courier partners to deliver your parcel, Razorpay to process online payments securely, our hosting providers to keep the site running, and authorities where legally required.",
      },
      {
        heading: "Cookies, briefly",
        body: "We use essential cookies so your login and cart persist as you browse, and some lightweight analytics to see how the site is being used overall. Your browser settings let you turn these off, though checkout and login may not work properly without the essential ones.",
      },
      {
        heading: "How we protect it",
        body: "Passwords are hashed, sessions are encrypted, and we don't keep data any longer than business, legal or tax obligations require — after that, records are deleted or anonymised where feasible.",
      },
      {
        heading: "If you want to see or delete your data",
        body: `Email ${COMPANY.email} and we'll help, after verifying it's genuinely you asking (a quick identity check protects your data as much as ours).`,
      },
      {
        heading: "One note on age",
        body: "Xellbuy is meant for shoppers 18 and older. We don't intentionally collect data from minors — if you believe we have, let us know and we'll remove it.",
      },
      {
        heading: "Reach us",
        body: `${COMPANY.email} | ${COMPANY.phone} | ${COMPANY.name}, Surat, Gujarat.`,
      },
    ],
  },

  "terms-of-use": {
    title: "Terms of Use",
    intro:
      "Using xellbuy.com means you're agreeing to the terms below — please read them before you check out.",
    sections: [
      {
        heading: "Who's behind this site",
        body: `Xellbuy is run by ${COMPANY.name}, registered at ${COMPANY.address}. You can reach us at ${COMPANY.email} or ${COMPANY.phone}.`,
      },
      {
        heading: "Eligibility to shop",
        body: "You need to be at least 18 and legally capable of entering a contract in India. Placing an order means you're confirming the details you've provided are correct.",
      },
      {
        heading: "About our listings and prices",
        body: "We try to keep every product description, image and ₹ price accurate, but minor shade or texture differences can occur between what's on-screen and the actual product, especially with makeup and skincare batches — that's normal, not a fault. Prices can be revised without prior notice, and if a listing has an obvious pricing error, we can cancel that order and refund whatever you paid.",
      },
      {
        heading: "When your order counts as accepted",
        body: "An order you place is an offer, not an automatic sale — a confirmation email doesn't guarantee fulfilment. We consider it accepted once we've confirmed dispatch. We can still decline or cancel orders for reasons like stock shortages, suspected fraud, or delivery limitations to your area.",
      },
      {
        heading: "How you can pay",
        body: "Cash on Delivery (where available), or online via UPI, card or netbanking through our payment partners. Full card information is never stored on our own servers.",
      },
      {
        heading: "Your account and your responsibility for it",
        body: "Keep your login private, and tell us right away if you spot anything unusual. We reserve the right to suspend accounts that misuse the platform — including repeatedly refusing COD orders without genuine reason.",
      },
      {
        heading: "Who owns the content on this site",
        body: "Everything you see — logos, product photography, descriptions, layout — belongs to us or is used under licence. Copying or reusing it commercially without our written permission isn't allowed.",
      },
      {
        heading: "Playing fair on the platform",
        body: "Please don't attempt unauthorised access, interfere with the site's security, post unlawful content, or try to push fraudulent transactions through. It affects everyone who shops here.",
      },
      {
        heading: "Where our responsibility ends",
        body: "If a product or the site itself causes a problem, our liability is limited to what you paid for that specific order. We're not responsible for indirect losses, including courier delays that are genuinely beyond our control.",
      },
      {
        heading: "These Terms work alongside our other policies",
        body: "Our Return, Refund, Cancellation, Shipping & Delivery and Privacy policies, all published on this site, apply to every purchase and are considered part of these Terms.",
      },
      {
        heading: "Governing law",
        body: "These Terms are governed by Indian law, with courts at Surat, Gujarat holding jurisdiction — this doesn't affect any rights you separately have under consumer protection legislation.",
      },
      {
        heading: "We may update this page",
        body: "Continuing to use xellbuy.com after we revise these Terms means you accept the update. Check the \"Last updated\" date here for the most current version.",
      },
    ],
  },
};
