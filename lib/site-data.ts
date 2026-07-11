export const navigation = [
  {
    href: "/shop",
    label: "Shop",
    groups: [
      {
        title: "Mattress Range",
        links: [
          { href: "/shop", label: "All Mattresses" },
          { href: "/compare", label: "Compare Models" },
          { href: "/wishlist", label: "Saved Products" }
        ]
      },
      {
        title: "Buying Tools",
        links: [
          { href: "/track-order", label: "Track Order" },
          { href: "/store-locator", label: "Store Locator" },
          { href: "/faq", label: "Support FAQ" }
        ]
      }
    ]
  },
  {
    href: "/compare",
    label: "Compare",
    groups: [
      {
        title: "Comparison",
        links: [
          { href: "/compare", label: "Compare Mattresses" },
          { href: "/materials", label: "Material Guide" }
        ]
      }
    ]
  },
  {
    href: "/materials",
    label: "Materials",
    groups: [
      {
        title: "Inside CoreSleep",
        links: [
          { href: "/materials", label: "Natural Latex" },
          { href: "/materials", label: "Pocket Springs" },
          { href: "/materials", label: "Cooling Layers" }
        ]
      }
    ]
  },
  {
    href: "/blog",
    label: "Guides",
    groups: [
      {
        title: "Editorial",
        links: [
          { href: "/blog", label: "Sleep Guides" },
          { href: "/reviews", label: "Customer Reviews" },
          { href: "/faq", label: "Policies & FAQ" }
        ]
      }
    ]
  }
];

export const announcementItems = [
  "Eco Materials",
  "Secure Payments Gateway",
  "Diamond Health Shield +"
];

export const heroMetrics = [
  "Server-driven cart and checkout flow with payment-state scaffolding",
  "Dummy product, content and order records stored in a DB-ready layout",
  "Admin create/delete flows ready to swap to Prisma repositories"
];

export const adminQueues = [
  "Review product copy and verified material claims",
  "Approve launch-safe FAQ and policy content",
  "Wire Stripe webhook and order status transitions",
  "Upload 3D model URLs, poster images and hotspot JSON"
];

export const comfortFeatures = [
  {
    title: "Tailored firmness",
    body: "Map mattress options by sleeping position, body type and support preference."
  },
  {
    title: "Pressure relief",
    body: "Explain comfort layers with clear language instead of placeholder claims."
  },
  {
    title: "Breathable layers",
    body: "Material storytelling is ready for verified latex, cotton, spring and cooling specs."
  },
  {
    title: "Showroom support",
    body: "Guide buyers through quiz, compare and WhatsApp touchpoints without clutter."
  }
];

export const materialHighlights = [
  "Natural latex layers with verified certifications",
  "Pocket spring engineering for motion control and edge support",
  "Cotton and wool comfort stories for breathability and finish"
];

export const guideHighlights = [
  "Best Mattress for Back Pain in Pakistan",
  "How to Choose Mattress Firmness",
  "Mattress Care Guide for Hot Weather Homes"
];

export const faqPreview = [
  "Which mattress is best for side sleepers?",
  "Do you offer custom sizes or firmness options?",
  "How does delivery and warranty registration work?"
];

export const testimonials = [
  {
    quote: "It has only been a few weeks, but the cooler sleep surface already feels like a meaningful upgrade.",
    author: "Hira, Lahore"
  },
  {
    quote: "Bought it just in time for the heatwave. It feels calmer, cooler and much easier to sleep on.",
    author: "Faisal, Karachi"
  },
  {
    quote: "The product quality feels premium and the overall support story is much clearer than a typical store.",
    author: "Areeba, Islamabad"
  }
];

export const storeLocations = [
  {
    city: "Lahore",
    address: "MM Alam Road showroom district",
    timing: "11am to 9pm",
    phone: "+15855029662"
  },
  {
    city: "Karachi",
    address: "Shahrah-e-Faisal partner studio",
    timing: "11am to 9pm",
    phone: "+15855029662"
  },
  {
    city: "Islamabad",
    address: "Blue Area appointment showroom",
    timing: "12pm to 8pm",
    phone: "+15855029662"
  }
];

export const accountLinks = [
  { href: "/account/login", label: "Sign in" },
  { href: "/account/register", label: "Create account" },
  { href: "/account/forgot-password", label: "Forgot password" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track-order", label: "Track order" }
];
