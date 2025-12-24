/**
 * Sanity Client for Demo Dataset
 * 
 * This client is specifically configured to fetch from the 'demo' dataset,
 * keeping demo content isolated from production.
 */

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Demo dataset client - isolated from production
// Demo dataset client - switched to PRODUCTION 'zz8gyyv9'
export const demoClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false, // Use false for fresh data to avoid caching delays initially
  apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(demoClient);

export function urlForDemo(source: any) {
  if (!source) return '';
  return builder.image(source);
}

// ============================================
// GROQ QUERIES FOR BOTTLE BLUEPRINT DEMO
// ============================================

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

// ============================================
// DATA FETCHING HOOK
// ============================================

export async function fetchBottleModel(): Promise<BottleModelData | null> {
  try {
    const data = await demoClient.fetch(BOTTLE_MODEL_QUERY);
    return data;
  } catch (error) {
    console.warn('[Sanity Demo] Failed to fetch bottle model:', error);
    return null;
  }
}
