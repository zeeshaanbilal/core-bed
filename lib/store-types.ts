export type ProductVariantRecord = {
  id: string;
  sku: string;
  size: string;
  firmness: string;
  height: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
};

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  badge: string;
  firmness: string;
  material: string;
  image: string;
  gallery: string[];
  features: string[];
  sizes: string[];
  firmnessOptions: string[];
  variants: ProductVariantRecord[];
  variantMatrix?: string;
  support: string;
  feel: string;
  status: "active" | "draft";
  inventory: number;
  rating: number;
  reviewCount: number;
};

export type TestimonialRecord = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  customerName: string;
  customerCity: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  featuredOnHome: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type ContentRecord = {
  id: string;
  type: "guide" | "policy" | "homepage";
  title: string;
  slug: string;
  summary: string;
  status: "active" | "draft";
};

export type BlogSectionRecord = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogFaqRecord = {
  question: string;
  answer: string;
};

export type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  categories: string[];
  featured: boolean;
  readTime: number;
  bodyIntro: string[];
  sections: BlogSectionRecord[];
  faq: BlogFaqRecord[];
  tags: string[];
  relatedSlugs: string[];
};

export type CartItemRecord = {
  id: string;
  productSlug: string;
  quantity: number;
  selectedSize: string;
  selectedFirmness?: string;
  unitPrice: number;
};

export type CartRecord = {
  sessionId: string;
  items: CartItemRecord[];
  updatedAt: string;
};

export type PaymentMethod = "stripe_card" | "bank_transfer" | "cash_on_delivery";

export type CustomerProfileRecord = {
  email: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  sessionId: string;
  customerType: "account" | "guest";
  linkedAccountEmail?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  orderStatus: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
  shippingStatus?: string;
  items: Array<{
    productSlug: string;
    name: string;
    selectedSize: string;
    selectedFirmness?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentReference: string;
  paymentClientSecret?: string;
  createdAt: string;
};

export type WishlistRecord = {
  sessionId: string;
  productSlugs: string[];
  updatedAt: string;
};
