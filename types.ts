export interface Product {
  sku: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  bulkPrice: string;
  capacity: string;
  color: string;
  category: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}