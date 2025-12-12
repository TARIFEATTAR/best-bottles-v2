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
  { icon: "spray", label: "Spray Bottles" },
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
    image: "https://images.unsplash.com/photo-1615634260167-c8c9c313880b?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Sustainable Packaging Trends 2024",
    excerpt: "Moving beyond recycling to complete circularity.",
    date: "Sep 28, 2023",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Design Language of Luxury",
    excerpt: "How weight and texture influence consumer perception.",
    date: "Sep 15, 2023",
    image: "https://images.unsplash.com/photo-1585675100412-42b100619297?auto=format&fit=crop&q=80&w=800"
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

// Extracted from the user's TSV-like data
export const PRODUCTS: Product[] = [
  {
    sku: "GB6TPlGl",
    name: "Octagonal 6ml Gold",
    description: "Octagonal style 6 ml glass bottle with shiny gold cap and red bead. Traditionally called 'tola' bottles.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GB6TPlGl.gif",
    price: "$0.52",
    bulkPrice: "3600pc @ $0.43",
    capacity: "6 ml (0.2 oz)",
    color: "Gold",
    category: "Glass Bottles & Vials",
  },
  {
    sku: "GB6TPlSl",
    name: "Octagonal 6ml Silver",
    description: "Octagonal style 6 ml glass bottle with shiny silver cap and blue bead.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GB6TPlSl.gif",
    price: "$0.52",
    bulkPrice: "3600pc @ $0.43",
    capacity: "6 ml (0.2 oz)",
    color: "Silver",
    category: "Glass Bottles & Vials",
  },
  {
    sku: "GBSQSTBlue",
    name: "Blue Rectangular 9ml",
    description: "Blue glass rectangular shaped bottle with glass stopper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBSQSTBlue.gif",
    price: "$3.04",
    bulkPrice: "2000pc @ $2.50",
    capacity: "9 ml (0.3 oz)",
    color: "Blue",
    category: "Glass Stopper Bottles",
  },
  {
    sku: "GBSQSTClear",
    name: "Clear Rectangular 9ml",
    description: "Clear glass rectangular shaped bottle with glass stopper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBSQSTClear.gif",
    price: "$3.04",
    bulkPrice: "2000pc @ $2.50",
    capacity: "9 ml (0.3 oz)",
    color: "Clear",
    category: "Glass Stopper Bottles",
  },
  {
    sku: "GBSQSTGREEN",
    name: "Green Rectangular 9ml",
    description: "Green glass rectangular shaped bottle with glass stopper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBSQSTGREEN.gif",
    price: "$3.04",
    bulkPrice: "2000pc @ $2.50",
    capacity: "9 ml (0.3 oz)",
    color: "Green",
    category: "Glass Stopper Bottles",
  },
  {
    sku: "GBTrdpBlue",
    name: "Blue Teardrop 9ml",
    description: "Blue glass teardrop shaped bottle with glass stopper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBTrdpBlue.gif",
    price: "$3.04",
    bulkPrice: "2000pc @ $2.50",
    capacity: "9 ml (0.3 oz)",
    color: "Blue",
    category: "Glass Stopper Bottles",
  },
  {
    sku: "GBTRDPClear",
    name: "Clear Teardrop 9ml",
    description: "Clear glass teardrop shaped bottle with glass stopper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBTRDPClear.gif",
    price: "$3.04",
    bulkPrice: "2000pc @ $2.50",
    capacity: "9 ml (0.3 oz)",
    color: "Clear",
    category: "Glass Stopper Bottles",
  },
  {
    sku: "GBMtlCylGl",
    name: "Royal Cylinder 14ml",
    description: "Royal cylinder bottle with Crystal Cap with glass applicator.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlCylGl.gif",
    price: "$6.79",
    bulkPrice: "1500pc @ $5.58",
    capacity: "14 ml (0.47 oz)",
    color: "Gold/Glass",
    category: "Decorative",
  },
  {
    sku: "GBMtlMrblSmall",
    name: "Marble Crystal 5ml",
    description: "Marble bottle with Crystal Cap and glass applicator.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlMrblSmall.gif",
    price: "$5.70",
    bulkPrice: "1000pc @ $4.68",
    capacity: "5 ml (0.17 oz)",
    color: "Marble",
    category: "Decorative",
  },
  {
    sku: "GBVAmb1DrmBlkDrpr",
    name: "Amber Vial Dropper",
    description: "Vial design 1 dram Amber glass vial with black dropper. Ideal for essential oils.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif",
    price: "$0.77",
    bulkPrice: "2880pc @ $0.63",
    capacity: "4 ml (0.14 oz)",
    color: "Amber",
    category: "Vials",
  },
  {
    sku: "GBVGr1DrmBlackCapSht",
    name: "Green Vial 1 Dram",
    description: "Vial design 1 dram Green glass vial with black short cap. For use with perfume or fragrance oil.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVGr1DrmBlackCapSht.gif",
    price: "$1.31",
    bulkPrice: "2880pc @ $1.08",
    capacity: "4 ml (0.14 oz)",
    color: "Green",
    category: "Vials",
  },
  {
    sku: "GBVialAmb1o5WhtCapSht",
    name: "Amber Vial 1.5ml",
    description: "Vial design 1.5ml, Amber glass vial with white short cap. Ideal sample size.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1o5WhtCapSht.gif",
    price: "$0.36",
    bulkPrice: "2880pc @ $0.30",
    capacity: "2 ml (0.07 oz)",
    color: "Amber",
    category: "Vials",
  },
  {
    sku: "GBVAmb2BlackCap",
    name: "Amber Vial 2ml",
    description: "Vial design 2 ml Amber glass vial with short black cap. Mini size for promotions.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb2BlackCap.gif",
    price: "$0.36",
    bulkPrice: "2880pc @ $0.30",
    capacity: "2 ml (0.07 oz)",
    color: "Amber",
    category: "Vials",
  },
  // New Items
  {
    sku: "GBMtlCylSl",
    name: "Royal Cylinder 11ml Silver",
    description: "Royal cylinder bottle with Crystal Cap with glass applicator.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlCylSl.gif",
    price: "$6.79",
    bulkPrice: "1500pc @ $5.58",
    capacity: "11 ml (0.37 oz)",
    color: "Silver/Glass",
    category: "Decorative",
  },
  {
    sku: "GBMtlMrblLarge",
    name: "Marble Crystal 10ml",
    description: "Marble bottle with Crystal Cap and glass applicator.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlMrblLarge.gif",
    price: "$6.65",
    bulkPrice: "1000pc @ $5.46",
    capacity: "10 ml (0.34 oz)",
    color: "Marble",
    category: "Decorative",
  },
  {
    sku: "GBVBlu1DrmBlkDropper",
    name: "Blue Vial Dropper",
    description: "Vial design 1 dram Blue glass vial with black dropper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVBlu1DrmBlkDropper.gif",
    price: "$1.85",
    bulkPrice: "2880pc @ $1.52",
    capacity: "4 ml (0.14 oz)",
    color: "Blue",
    category: "Vials",
  },
  {
    sku: "GBVBlu1DrmBlackCapSht",
    name: "Blue Vial 1 Dram",
    description: "Vial design 1 dram Blue glass vial with black short cap.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVBlu1DrmBlackCapSht.gif",
    price: "$1.31",
    bulkPrice: "2880pc @ $1.08",
    capacity: "4 ml (0.14 oz)",
    color: "Blue",
    category: "Vials",
  },
  {
    sku: "GBV1DrmBlkDropper",
    name: "Clear Vial Dropper",
    description: "Vial design 1 dram Clear glass vial with black dropper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBV1DrmBlkDropper.gif",
    price: "$0.77",
    bulkPrice: "2880pc @ $0.63",
    capacity: "4 ml (0.14 oz)",
    color: "Clear",
    category: "Vials",
  },
  {
    sku: "GBV1DrmBlackCapSht",
    name: "Clear Vial 1 Dram",
    description: "Vial design 1 dram Clear glass vial with black short cap.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVial1DrmBlackCapSht.gif",
    price: "$0.37",
    bulkPrice: "2880pc @ $0.30",
    capacity: "4 ml (0.14 oz)",
    color: "Clear",
    category: "Vials",
  },
  {
    sku: "GBVGr1DrmBlkDropper",
    name: "Green Vial Dropper",
    description: "Vial design 1 dram Green glass vial with black dropper.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVGr1DrmBlkDropper.gif",
    price: "$1.85",
    bulkPrice: "2880pc @ $1.52",
    capacity: "4 ml (0.14 oz)",
    color: "Green",
    category: "Vials",
  },
  {
    sku: "GBVialClr2mlBlackCap",
    name: "Clear Vial 2ml",
    description: "Vial design 2 ml clear glass vial with short black cap.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVClr2mlBlackCap.gif",
    price: "$0.36",
    bulkPrice: "2880pc @ $0.30",
    capacity: "2 ml (0.07 oz)",
    color: "Clear",
    category: "Vials",
  },
  {
    sku: "GBVGreen2o4BlackCapSht",
    name: "Green Vial 3ml",
    description: "Vial design 5/8 dram Green glass vial with black short cap.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBVGreen2o4BlackCapSht.gif",
    price: "$1.03",
    bulkPrice: "2880pc @ $0.84",
    capacity: "3 ml (0.1 oz)",
    color: "Green",
    category: "Vials",
  },
  {
    sku: "GB09BlackCapApp",
    name: "Clear Cylinder 9ml Applicator",
    description: "Cylinder design 9 ml clear glass vial with black cap with glass rod applicator.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GB09BlackCapApp.gif",
    price: "$0.44",
    bulkPrice: "8400pc @ $0.36",
    capacity: "9 ml (0.3 oz)",
    color: "Clear",
    category: "Vials",
  },
  {
    sku: "GB09BlackCapSht",
    name: "Clear Cylinder 9ml Cap",
    description: "Cylinder design 9 ml clear glass vial with black short cap.",
    imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GB09BlackCapSht.gif",
    price: "$0.38",
    bulkPrice: "8400pc @ $0.31",
    capacity: "9 ml (0.3 oz)",
    color: "Clear",
    category: "Vials",
  },
];