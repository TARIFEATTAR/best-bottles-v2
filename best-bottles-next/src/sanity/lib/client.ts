import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'gv4os6ef',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Set to false for always-fresh data
})

