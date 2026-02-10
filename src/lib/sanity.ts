import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Best Bottles Sanity Configuration
const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || 'gv4os6ef';
const DATASET = import.meta.env.VITE_SANITY_DATASET || 'production';

export const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: false, // set to `false` to bypass the edge cache for real-time demo updates
  apiVersion: '2024-01-01',
  stega: {
    enabled: true,
    studioUrl: 'http://localhost:3333',
  },
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Re-export from sanityDemo for convenience
export {
  fetchProductBySlug,
  fetchFirstProduct,
  fetchBottleModel,
  type ProductData,
  type ProductGlassOption,
  type ProductCapOption,
  type FitmentVariant,
  type ProductViewer,
} from './sanityDemo';
