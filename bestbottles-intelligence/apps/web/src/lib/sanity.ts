import { createClient } from 'next-sanity';

/**
 * Minimal Sanity client for proof-of-concept viewer
 * 
 * Environment variables:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=gv4os6ef
 *   NEXT_PUBLIC_SANITY_DATASET=production
 */
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Always fresh data for proof viewer
  stega: {
    enabled: true,
    studioUrl: 'http://localhost:3333',
  },
});

