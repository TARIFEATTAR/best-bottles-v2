/**
 * FITMENT COMPONENT
 * 
 * Layer 3 (Z-Index 2) - The Middle Layer
 * Represents the fitment mechanism (roller, sprayer, dropper, pump).
 * 
 * Examples: Metal Roller Ball, Plastic Sprayer, Glass Dropper
 */

import { defineType, defineField } from 'sanity'
import { CircleIcon } from '@sanity/icons'

export const fitment = defineType({
  name: 'fitment',
  title: 'Fitment (Mechanism)',
  type: 'document',
  icon: CircleIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., "Metal Roller Ball", "Fine Mist Sprayer", "Glass Dropper"',
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
      description: 'Upload the transparent PNG of the fitment mechanism.',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewSwatch',
      title: 'Preview Swatch',
      type: 'image',
      description: 'Small icon for the UI selector (optional).',
    }),
    defineField({
      name: 'type',
      title: 'Fitment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Roller Ball', value: 'roller-ball' },
          { title: 'Sprayer', value: 'sprayer' },
          { title: 'Dropper', value: 'dropper' },
          { title: 'Pump', value: 'pump' },
          { title: 'Disc Top', value: 'disc-top' },
          { title: 'Flip Top', value: 'flip-top' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      options: {
        list: [
          { title: 'Metal', value: 'metal' },
          { title: 'Plastic', value: 'plastic' },
          { title: 'Glass', value: 'glass' },
          { title: 'Stainless Steel', value: 'stainless-steel' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'assemblyOffsetY',
      title: 'Assembly Y-Offset (pixels)',
      type: 'number',
      description: 'Vertical adjustment to align with the bottle body.',
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
      subtitle: 'type',
      media: 'layerImage',
    },
  },
})

