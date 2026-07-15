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

export const countryOptions = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "India",
  "Germany",
  "France"
];

export const featureCards = [
  {
    slug: "contactless-delivery",
    title: "Contactless delivery",
    body: "Free, safe delivery with every order, no matter how big or small.",
    icon: "□",
    detailTitle: "Delivery built for comfort from checkout to doorstep",
    detailBody:
      "Corebed delivery flow is designed to stay simple, safe, and visible. Customers can place an order, receive confirmation, track progress, and stay updated without friction.",
    bullets: [
      "Clear delivery expectations from order placement to final handover",
      "Safer handling structure for mattresses, pillows, and accessories",
      "Customer-friendly updates for dispatch and arrival stages"
    ]
  },
  {
    slug: "15-years-warranty",
    title: "15-years warranty",
    body: "Long-term comfort backed by a simple and clear support promise.",
    icon: "◔",
    detailTitle: "Warranty clarity that feels easy to trust",
    detailBody:
      "The Corebed warranty story is structured to explain support duration, care expectations, and after-purchase confidence in cleaner language.",
    bullets: [
      "Long-term support positioning for premium sleep products",
      "Simple policy storytelling that can expand into FAQ and support pages",
      "A cleaner post-purchase experience for mattress buyers"
    ]
  },
  {
    slug: "highest-hygiene-standards",
    title: "Highest hygiene standards",
    body: "Your mattress stays protected from finishing to final delivery.",
    icon: "◌",
    detailTitle: "Cleaner handling and product protection across the journey",
    detailBody:
      "Corebed product presentation is framed around safer packaging, cleaner finishing, and more reassuring care standards from storage to delivery.",
    bullets: [
      "Packaging and finishing that support premium brand trust",
      "Clearer hygiene positioning for modern mattress retail",
      "Suitable for showrooms, delivery messaging, and product education"
    ]
  }
] as const;

export const storeLocations = [
  {
    slug: "granbury-texas",
    city: "Granbury",
    address: "307 West Pearl Street",
    state: "Texas",
    postalCode: "76048",
    country: "United States",
    timezone: "(GMT-08:00) Pacific Time",
    timing: "By appointment",
    phone: "+15855029662",
    summary: "Private Corebed showroom support for appointments, consultations, and direct purchase guidance.",
    mapQuery: "307 West Pearl Street, Granbury, Texas 76048, United States",
    mapEmbedUrl:
      "https://www.google.com/maps?q=307+West+Pearl+Street,+Granbury,+Texas+76048,+United+States&z=15&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=307+West+Pearl+Street,+Granbury,+Texas+76048,+United+States"
  }
];

export const accountLinks = [
  { href: "/account/login", label: "Sign in" },
  { href: "/account/register", label: "Create account" },
  { href: "/account/forgot-password", label: "Forgot password" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track-order", label: "Track order" }
];
