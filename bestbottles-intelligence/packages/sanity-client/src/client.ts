/**
 * Sanity client configuration
 * 
 * This package provides shared Sanity configuration for use across
 * the monorepo. In a real implementation, these values would come
 * from environment variables or a config file.
 */

export const clientConfig = {
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
};

if (!clientConfig.projectId) {
  console.warn(
    'Warning: Sanity project ID not configured. Set SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID environment variable.'
  );
}


