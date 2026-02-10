
import { Product, NavItem, Feature } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
  { label: "Custom", href: "#custom" },
  { label: "Journal", href: "#journal" },
];

export const FEATURES: Feature[] = [
  {
    icon: "local_shipping",
    title: "Global Logistics",
    description: "Reliable shipping to over 80 countries.",
  },
  {
    icon: "verified_user",
    title: "Quality Assured",
    description: "ISO 9001 certified production standards.",
  },
  {
    icon: "support_agent",
    title: "Expert Support",
    description: "Dedicated account managers for B2B.",
  },
];

export const FINDER_CATEGORIES = [
  { icon: "spray", label: "Vintage Bottles" },
  { icon: "water_drop", label: "Oil Vials" },
  { icon: "spa", label: "Essential Oils" },
  { icon: "gesture", label: "Roll-ons" },
  { icon: "check_circle", label: "Closures" },
  { icon: "shopping_bag", label: "Accessories" },
];

export const JOURNAL_POSTS = [
  {
    title: "The Art of Scent Preservation",
    excerpt: "Why UV-protection is crucial for organic fragrances.",
    date: "Oct 12, 2023",
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-853ad816_1.jpg?v=1765532240"
  },
  {
    title: "Sustainable Packaging Trends 2024",
    excerpt: "Moving beyond recycling to complete circularity.",
    date: "Sep 28, 2023",
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548"
  },
  {
    title: "Design Language of Luxury",
    excerpt: "How weight and texture influence consumer perception.",
    date: "Sep 15, 2023",
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-48628740_1.jpg?v=1765524503"
  }
];

export const FAQ_DATA = [
  {
    category: "Ordering & Payment",
    items: [
      {
        question: "Is there a minimum order requirement?",
        answer: "There is a minimum order requirement of $50.00."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and wire transfers for large wholesale orders."
      },
      {
        question: "Do you offer wholesale or bulk pricing?",
        answer: "Yes! Tiered pricing is automatically applied in your cart. You'll see discounts starting at 100 units, with deeper breaks at 500, 1000, and 5000+ units."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        question: "How long will it take to ship my order?",
        answer: "Most in-stock orders ship within 24-48 business hours. Depending on your location and the shipping method selected (UPS Ground is standard), delivery typically takes 3-7 business days within the continental US."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 80 countries. International shipping rates are calculated at checkout based on weight and destination. Please note that customers are responsible for any customs duties or taxes."
      },
      {
        question: "My tracking says delivered but I can't find it.",
        answer: "Please allow 24 hours as carriers sometimes mark packages as delivered prematurely. If it still hasn't arrived, check with neighbors or your building manager. Contact us immediately if it is still missing."
      }
    ]
  },
  {
    category: "Returns & Breakage",
    items: [
      {
        question: "What if my bottles arrive broken?",
        answer: "Glass is fragile, and while we pack carefully, breakage can happen. Please inspect your order immediately upon arrival. Claims for breakage must be made within 5 days of receipt. Email us photos of the damage, and we will issue a credit or send replacements."
      },
      {
        question: "What is your return policy?",
        answer: "We accept returns on unused, unaltered merchandise within 30 days of purchase. A 20% restocking fee applies to all returns to cover inspection and repackaging. Original shipping costs are non-refundable, and the customer is responsible for return shipping."
      },
      {
        question: "Can I return samples?",
        answer: "Sample kits and single-unit sample purchases are final sale and cannot be returned."
      }
    ]
  },
  {
    category: "Product & Technical",
    items: [
      {
        question: "Are your bottles food safe?",
        answer: "Yes, the majority of our glass and plastic containers are food grade. However, we primarily cater to the cosmetic and fragrance industry. We recommend washing all containers before use."
      },
      {
        question: "How do I know which cap fits which bottle?",
        answer: "You need to match the 'Neck Finish'. For example, if a bottle has an 18-400 neck, you must choose a cap with an 18-400 finish. Our product pages automatically suggest compatible closures."
      },
      {
        question: "Do you offer custom printing or labeling?",
        answer: "Yes! We offer silk screening, hot stamping, and labeling services. The minimum order for custom decoration is typically 1,000 units. Please visit our 'Custom' page to start a project."
      }
    ]
  }
];

// --- REAL INVENTORY DATA ---
import INVENTORY from './inventory.json';

export const PRODUCTS: Product[] = INVENTORY as Product[];

// --- DEMO: Only 9ml Cylinder Roll-On Bottles ---
// For client demo - showing ONLY the 9ml roll-on category
export const DEMO_PRODUCTS: Product[] = (INVENTORY as Product[]).filter(p => {
  // Filter for 9ml cylinder roll-on bottles only
  const isCylinder = p.sku?.includes('Cyl') && p.sku?.includes('9');
  const isRollOn = p.sku?.includes('Roll') || p.name?.toLowerCase().includes('roller');
  const is9ml = p.capacity?.includes('9 ml') || p.capacity?.includes('0.3 oz');

  return isCylinder && isRollOn && is9ml;
});
