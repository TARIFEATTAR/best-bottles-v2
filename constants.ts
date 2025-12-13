
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
        answer: "We do not have a strict minimum order quantity (MOQ) for stock items. You can buy as little as one unit. However, orders under $50.00 are subject to a $10.00 small order handling fee to cover processing costs."
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

// --- THE 12 DEMO PRODUCTS (Reflecting varied logic paths) ---
export const PRODUCTS: Product[] = [
  // 1. Classic Essential Oil (Amber/10ml/Roll-on)
  {
    sku: "GBVAmb10Rl",
    name: "Classic Amber Roller 10ml",
    description: "The industry standard for essential oils. Thick amber glass provides superior UV protection.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif",
    price: "$0.45",
    bulkPrice: "1000pc @ $0.38",
    capacity: "10ml",
    color: "Amber",
    category: "Roll-ons",
  },
  // 2. Modern Essential Oil (Blue/10ml/Roll-on)
  {
    sku: "GBVBlu10Rl",
    name: "Cobalt Blue Roller 10ml",
    description: "Vibrant cobalt blue glass. Popular for 'Cooling' or 'Night' blends.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVBlu1DrmBlkDropper.gif",
    price: "$0.55",
    bulkPrice: "1000pc @ $0.48",
    capacity: "10ml",
    color: "Blue",
    category: "Roll-ons",
  },
  // 3. Premium Serum (Clear/30ml/Dropper)
  {
    sku: "GBBstn30Clr",
    name: "Flint Boston Round 30ml",
    description: "High-clarity flint glass. Ideal for serums where liquid color is a selling point.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A",
    price: "$0.85",
    bulkPrice: "500pc @ $0.72",
    capacity: "30ml",
    color: "Clear",
    category: "Droppers",
  },
  // 4. Luxury Perfume (Frosted/50ml/Spray)
  {
    sku: "GBSqFrst50",
    name: "Frosted Square 50ml",
    description: "Heavy-base square bottle with soft-touch frosted finish. Premium feel.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    price: "$1.85",
    bulkPrice: "500pc @ $1.60",
    capacity: "50ml",
    color: "Frosted",
    category: "Spray Bottles",
  },
  // 5. Men's Grooming (Black/30ml/Pump)
  {
    sku: "GBMatteBlk30",
    name: "Matte Black Cylinder 30ml",
    description: "Opaque matte black finish. Excellent for light-sensitive formulations and men's lines.",
    imageUrl: "https://images.unsplash.com/photo-1615634260167-c8c9c313880b?auto=format&fit=crop&q=80&w=400",
    price: "$1.10",
    bulkPrice: "1000pc @ $0.95",
    capacity: "30ml",
    color: "Black",
    category: "Droppers",
  },
  // 6. Traditional Attar (Crystal/12ml/Stick)
  {
    sku: "GBMtlCylGl",
    name: "Royal Cylinder 12ml",
    description: "Ornate glass bottle with crystal cap and glass rod applicator. For Attar/Oud.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlCylGl.gif",
    price: "$6.79",
    bulkPrice: "1500pc @ $5.58",
    capacity: "12ml",
    color: "Gold",
    category: "Decorative",
  },
  // 7. Apothecary (Green/15ml/Dropper)
  {
    sku: "GBEuroGrn15",
    name: "Emerald Euro 15ml",
    description: "Traditional European dropper style. Deep green glass.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVGr1DrmBlkDropper.gif",
    price: "$0.65",
    bulkPrice: "2000pc @ $0.55",
    capacity: "15ml",
    color: "Green",
    category: "Vials",
  },
  // 8. Travel Perfume (Metal/5ml/Atomizer)
  {
    sku: "GBMtlShell5",
    name: "Metal Shell Atomizer 5ml",
    description: "Glass vial encased in anodized aluminum. Laser engravable.",
    imageUrl: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537",
    price: "$2.25",
    bulkPrice: "1000pc @ $1.95",
    capacity: "5ml",
    color: "Silver",
    category: "Spray Bottles",
  },
  // 9. Large Cologne (Clear/100ml/Crimp)
  {
    sku: "GBRect100",
    name: "Classic Rectangular 100ml",
    description: "Wide panel rectangular bottle. Ideal for large labels.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBSQSTClear.gif",
    price: "$2.50",
    bulkPrice: "500pc @ $2.10",
    capacity: "100ml",
    color: "Clear",
    category: "Spray Bottles",
  },
  // 10. Eco Line (Bamboo/10ml/Roller)
  {
    sku: "GBBamboo10",
    name: "Bamboo Shell Roller 10ml",
    description: "Real bamboo outer shell over glass. Sustainable aesthetic.",
    imageUrl: "https://images.unsplash.com/photo-1595855709940-fa1d4f243029?auto=format&fit=crop&q=80&w=400",
    price: "$1.45",
    bulkPrice: "1000pc @ $1.25",
    capacity: "10ml",
    color: "Wood",
    category: "Roll-ons",
  },
  // 11. High End Serum (White/30ml/Pump)
  {
    sku: "GBOpal30",
    name: "White Opal Cylinder 30ml",
    description: "Opaque white glass (porcelain look). Very luxurious.",
    imageUrl: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-1a5ce90f_1.jpg?v=1765597664",
    price: "$1.60",
    bulkPrice: "1000pc @ $1.35",
    capacity: "30ml",
    color: "White",
    category: "Droppers",
  },
  // 12. Preservation (Violet/50ml/Jar)
  {
    sku: "GBVio50",
    name: "Violet Glass Jar 50ml",
    description: "Miron-style violet glass. Blocks all damaging light. For active creams.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
    price: "$3.50",
    bulkPrice: "500pc @ $3.00",
    capacity: "50ml",
    color: "Purple",
    category: "Jars",
  }
];
