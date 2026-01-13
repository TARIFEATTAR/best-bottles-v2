import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  name: 'best-bottles',
  title: 'Best Bottles',

  projectId: 'gv4os6ef',
  dataset: 'production',

  plugins: [
    structureTool({ structure }), // Custom structure with Exploded View preview
    visionTool(),
    media(), // Media Library for 2,000+ assets
  ],

  schema: {
    types: schemaTypes,
  },
})

