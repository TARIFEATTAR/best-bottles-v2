/**
 * CAP COMPONENT
 * 
 * Layer 4 (Z-Index 3) - The Top Layer
 * Represents the cap that sits on top of the bottle.
 * 
 * Examples: Silver Screw Cap, Gold Cap, Black Matte Cap
 */

import { defineType, defineField } from 'sanity'
import { BlockElementIcon } from '@sanity/icons'

export const cap = defineType({
  name: 'cap',
  title: 'Cap',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., "Silver Screw Cap", "Gold Cap", "Black Matte Cap"',
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
      description: 'Upload the transparent PNG of the cap.',
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
      title: 'Color/Finish',
      type: 'string',
      options: {
        list: [
          { title: 'Silver', value: 'silver' },
          { title: 'Gold', value: 'gold' },
          { title: 'Black Matte', value: 'black-matte' },
          { title: 'Black Gloss', value: 'black-gloss' },
          { title: 'Rose Gold', value: 'rose-gold' },
          { title: 'White', value: 'white' },
          { title: 'Natural Wood', value: 'natural-wood' },
        ],
      },
    }),
    defineField({
      name: 'style',
      title: 'Cap Style',
      type: 'string',
      options: {
        list: [
          { title: 'Screw Cap', value: 'screw-cap' },
          { title: 'Press Cap', value: 'press-cap' },
          { title: 'Spray Cap', value: 'spray-cap' },
          { title: 'Dropper Cap', value: 'dropper-cap' },
          { title: 'Bamboo Cap', value: 'bamboo-cap' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'assemblyOffsetY',
      title: 'Assembly Y-Offset (pixels)',
      type: 'number',
      description: 'Vertical adjustment to align the cap on the bottle.',
      initialValue: 0,
    }),
    defineField({
      name: 'shopifyVariantId',
      title: 'Shopify Variant ID',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'color',
      media: 'layerImage',
    },
  },
})

