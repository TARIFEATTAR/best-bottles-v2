/**
 * BOTTLE COMPONENT
 * 
 * Layer 2 (Z-Index 1) - The Glass Body
 * Represents the glass bottle body with transparent PNG.
 * 
 * Examples: Cobalt Blue, Amber, Clear, Frosted White
 */

import { defineType, defineField } from 'sanity'
import { DropIcon } from '@sanity/icons'

export const bottle = defineType({
  name: 'bottle',
  title: 'Bottle (Glass Body)',
  type: 'document',
  icon: DropIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., "Cobalt Blue Glass", "Amber Glass", "Clear Glass"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Internal SKU for inventory tracking',
    }),
    defineField({
      name: 'layerImage',
      title: 'Layer Image (Transparent PNG)',
      type: 'image',
      description: 'Upload the transparent PNG of the glass bottle body.',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewSwatch',
      title: 'Preview Swatch',
      type: 'image',
      description: 'Small color chip for the UI selector (optional).',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Cobalt Blue', value: 'cobalt-blue' },
          { title: 'Amber', value: 'amber' },
          { title: 'Clear', value: 'clear' },
          { title: 'Frosted White', value: 'frosted-white' },
          { title: 'Green', value: 'green' },
          { title: 'Black', value: 'black' },
        ],
      },
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity (ml)',
      type: 'number',
      description: 'Volume in milliliters (e.g., 9, 10, 30, 60)',
    }),
    defineField({
      name: 'shopifyVariantId',
      title: 'Shopify Variant ID',
      type: 'string',
      description: 'Links to Shopify for e-commerce.',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Component price in USD',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'capacity',
      media: 'layerImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `${subtitle}ml` : undefined,
        media,
      }
    },
  },
})

