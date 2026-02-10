import imageUrlBuilder from '@sanity/image-url';
import { SanityImageObject } from '@sanity/image-url/lib/types/types';

/**
 * Helper to build Sanity image URLs
 * 
 * Uses environment variables or falls back to @bestbottles/sanity-client config
 */
let builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder() {
  if (!builder) {
    // Try to use shared config first, fall back to env vars
    let projectId: string;
    let dataset: string;

    try {
      // Try to import from shared config package
      const { clientConfig } = require('@bestbottles/sanity-client');
      projectId = clientConfig.projectId;
      dataset = clientConfig.dataset;
    } catch {
      // Fall back to environment variables
      projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
      dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    }

    if (!projectId) {
      throw new Error(
        'Sanity project ID not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID or install @bestbottles/sanity-client'
      );
    }

    builder = imageUrlBuilder({
      projectId,
      dataset,
    });
  }

  return builder;
}

export function urlFor(source: SanityImageObject) {
  return getBuilder().image(source);
}
