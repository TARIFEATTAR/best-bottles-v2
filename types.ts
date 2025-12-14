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
  subCategory?: string;
  neckFinish?: string;
  material?: string;
  minOrderQty?: string;
}

// ============================================
// CONFIGURABLE PRODUCT TYPES (Roll-on Bottles)
// ============================================

export interface BaseBottle {
  id: string;
  name: string;
  color: string;
  material: string;
  imageUrl: string;
  skuPrefix: string;
}

export interface RollerOption {
  id: string;
  name: string;
  type: 'metal' | 'plastic';
  skuCode: string;
  priceModifier: number;
  description: string;
}

export interface CapOption {
  id: string;
  name: string;
  color: string;
  finish: string;
  skuCode: string;
  imageUrl: string;
  available: boolean;
}

export interface SharedSpecs {
  capacity: string;
  neckThreadSize: string;
  heightWithCap: string;
  heightWithoutCap: string;
  diameter: string;
  recommendedUse: string[];
}

export interface PricingTier {
  quantity: number;
  price: number;
}

export interface SkuMatrixEntry {
  bottle: string;
  roller: string;
  cap: string;
  sku: string;
}

export interface ConfigurableProductCategory {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  sourceUrl: string;
  sharedSpecs: SharedSpecs;
  baseBottles: BaseBottle[];
  rollerOptions: RollerOption[];
  capOptions: CapOption[];
  pricingMatrix: {
    basePrices: Record<string, Record<string, number>>;
    metalRollerUpcharge: number;
  };
  skuMatrix: SkuMatrixEntry[];
}

// Selection state for product configurator
export interface ProductSelection {
  bottleId: string;
  rollerId: string;
  capId: string;
  quantity: number;
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