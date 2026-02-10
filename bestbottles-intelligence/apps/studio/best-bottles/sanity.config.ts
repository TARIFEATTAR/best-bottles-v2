import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Best Bottles',

  projectId: 'gv4os6ef',
  dataset: 'demo',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
