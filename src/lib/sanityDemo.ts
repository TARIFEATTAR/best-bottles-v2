/**
 * Sanity Client for Demo Dataset
 * 
 * This client is specifically configured to fetch from the 'demo' dataset,
 * keeping demo content isolated from production.
 */

import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const demoClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef',
  dataset: 'production',
  useCdn: false, // Use false for fresh data to avoid caching delays initially
  apiVersion: '2024-01-01',
});

console.log("[Sanity Demo] Initializing with Project ID:", import.meta.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef', "Dataset:", 'production');

const builder = createImageUrlBuilder(demoClient);

export function urlForDemo(source: any) {
  if (!source) return '';
  return builder.image(source).url();
}

// ============================================
// GROQ QUERIES FOR BOTTLE BLUEPRINT DEMO
// ============================================

// Legacy query for old bottleModel documents (kept for backwards compatibility)
export const BOTTLE_MODEL_QUERY = `
  *[_type == "bottleModel"][0]{
    _id,
    name,
    "outlineImageUrl": outlineImage.asset->url,
    dimensions,
    glassOptions[]->{
      _id,
      name,
      "overlayUrl": layerImage.asset->url,
      "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url)
    },
    capOptions[]->{
      _id,
      name,
      finish,
      "overlayUrl": layerImage.asset->url,
      "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url)
    }
  }
`;

// New query for product documents (matches rebuilt schema)
export const PRODUCT_QUERY = `
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    summary,
    "heroImageUrl": heroImage.asset->url,
    specifications,
    basePrice,
    priceTiers[],
    fitmentVariants[]->{
      _id,
      title,
      description,
      glassOptions[]->{
        _id,
        title,
        "overlayUrl": layerImage.asset->url,
        "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url),
        hexColor,
        priceModifier,
        isDefault
      }
    },
    capOptions[]->{
      _id,
      title,
      finish,
      "overlayUrl": layerImage.asset->url,
      "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url),
      assemblyOffsetY,
      priceModifier
    },
    defaultCap->{
      _id,
      title,
      "overlayUrl": layerImage.asset->url
    },
    productViewer {
      "outlineImageUrl": outlineImage.asset->url,
      "lightingOverlayUrl": lightingOverlay.asset->url,
      "shadowLayerUrl": shadowLayer.asset->url,
      layerOrder,
      backgroundColor
    }
  }
`;

// Query to get first available product (for demo)
export const FIRST_PRODUCT_QUERY = `
  *[_type == "product"][0]{
    _id,
    title,
    slug,
    summary,
    "heroImageUrl": heroImage.asset->url,
    specifications,
    basePrice,
    priceTiers[],
    fitmentVariants[]->{
      _id,
      title,
      description,
      glassOptions[]->{
        _id,
        title,
        "overlayUrl": layerImage.asset->url,
        "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url),
        hexColor,
        priceModifier,
        isDefault
      }
    },
    capOptions[]->{
      _id,
      title,
      finish,
      "overlayUrl": layerImage.asset->url,
      "swatchUrl": coalesce(previewSwatch.asset->url, layerImage.asset->url),
      assemblyOffsetY,
      priceModifier
    },
    defaultCap->{
      _id,
      title,
      "overlayUrl": layerImage.asset->url
    },
    productViewer {
      "outlineImageUrl": outlineImage.asset->url,
      "lightingOverlayUrl": lightingOverlay.asset->url,
      "shadowLayerUrl": shadowLayer.asset->url,
      layerOrder,
      backgroundColor
    }
  }
`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface GlassOption {
  _id: string;
  name: string;
  colorHex?: string;
  overlayUrl?: string;
  swatchUrl?: string;
}



export interface CapOption {
  _id: string;
  name: string;
  finish?: 'Matte' | 'Polished' | 'Brushed';
  overlayUrl?: string;
  swatchUrl?: string;
}

export interface BottleModelData {
  _id: string;
  name: string;
  outlineImageUrl?: string;
  measurementsOverlayUrl?: string;
  dimensions?: {
    heightWithCap?: number;
    heightWithoutCap?: number;
    diameter?: number;
    thread?: string;
  };
  glassOptions: GlassOption[];
  capOptions: CapOption[];
}

// New types for rebuilt schema
export interface ProductGlassOption {
  _id: string;
  title: string;
  overlayUrl?: string;
  swatchUrl?: string;
  hexColor?: string;
  priceModifier?: number;
  isDefault?: boolean;
}

export interface ProductCapOption {
  _id: string;
  title: string;
  finish?: 'Matte' | 'Polished' | 'Brushed';
  overlayUrl?: string;
  swatchUrl?: string;
  assemblyOffsetY?: number;
  priceModifier?: number;
}

export interface FitmentVariant {
  _id: string;
  title: string;
  description?: string;
  glassOptions: ProductGlassOption[];
}

export interface ProductViewer {
  outlineImageUrl?: string;
  lightingOverlayUrl?: string;
  shadowLayerUrl?: string;
  layerOrder?: string[];
  backgroundColor?: string;
}

export interface ProductData {
  _id: string;
  title: string;
  slug?: { current: string };
  summary?: string;
  heroImageUrl?: string;
  specifications?: {
    capacity?: string;
    neckFinish?: string;
    material?: string;
    dimensions?: string;
  };
  basePrice?: number;
  priceTiers?: { label: string; minQty: number; price: number }[];
  fitmentVariants: FitmentVariant[];
  capOptions: ProductCapOption[];
  defaultCap?: ProductCapOption;
  productViewer?: ProductViewer;
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

// Legacy fetch for old bottleModel documents
export async function fetchBottleModel(): Promise<BottleModelData | null> {
  try {
    const data = await demoClient.fetch(BOTTLE_MODEL_QUERY);
    return data;
  } catch (error) {
    console.warn('[Sanity Demo] Failed to fetch bottle model:', error);
    return null;
  }
}

// Fetch product by slug
export async function fetchProductBySlug(slug: string): Promise<ProductData | null> {
  try {
    const data = await demoClient.fetch(PRODUCT_QUERY, { slug });
    return data;
  } catch (error) {
    console.warn('[Sanity Demo] Failed to fetch product:', error);
    return null;
  }
}

// Fetch first available product (for demo/testing)
export async function fetchFirstProduct(): Promise<ProductData | null> {
  try {
    const data = await demoClient.fetch(FIRST_PRODUCT_QUERY);
    return data;
  } catch (error) {
    console.warn('[Sanity Demo] Failed to fetch first product:', error);
    return null;
  }
}
