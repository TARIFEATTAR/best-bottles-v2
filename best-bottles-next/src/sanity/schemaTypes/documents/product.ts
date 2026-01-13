/**
 * PRODUCT (Assembled Bottle)
 * 
 * The main document that combines all layers into a single product.
 * Uses REFERENCES to reusable components - this is the key to managing 2,000+ parts!
 * 
 * Visual Stack (Exploded View):
 * - Layer 1: Background (Z-Index 0)
 * - Layer 2: Bottle/Glass Body (Z-Index 1)
 * - Layer 3: Fitment/Mechanism (Z-Index 2)
 * - Layer 4: Cap (Z-Index 3)
 */

import { defineType, defineField } from 'sanity'
import { PackageIcon } from '@sanity/icons'

export const product = defineType({
  name: 'product',
  title: 'Product (Assembled Bottle)',
  type: 'document',
  icon: PackageIcon,
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'visualStack', title: 'Visual Stack (Layers)' },
    { name: 'commerce', title: 'Commerce' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ============ BASIC INFO ============
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'e.g., "9ML Roll-on - Cobalt Blue / Silver / Metal Roller"',
      validation: (rule) => rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'basic',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Roll-On Bottles', value: 'roll-on' },
          { title: 'Spray Bottles', value: 'spray' },
          { title: 'Dropper Bottles', value: 'dropper' },
          { title: 'Pump Bottles', value: 'pump' },
          { title: 'Jars', value: 'jar' },
          { title: 'Vials', value: 'vial' },
        ],
        layout: 'dropdown',
      },
      group: 'basic',
    }),

    // ============ VISUAL STACK (The Exploded View) ============
    defineField({
      name: 'visualStack',
      title: 'Visual Stack',
      type: 'object',
      description: 'The layered components that make up this product.',
      group: 'visualStack',
      fields: [
        defineField({
          name: 'backgroundLayer',
          title: 'Layer 1: Background (Z-Index 0)',
          type: 'reference',
          to: [{ type: 'background' }],
          description: 'The base architectural grid or studio background.',
        }),
        defineField({
          name: 'baseLayer',
          title: 'Layer 2: Bottle/Glass Body (Z-Index 1)',
          type: 'reference',
          to: [{ type: 'bottle' }],
          description: 'The glass bottle body (e.g., Cobalt Blue, Amber).',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'fitmentLayer',
          title: 'Layer 3: Fitment/Mechanism (Z-Index 2)',
          type: 'reference',
          to: [{ type: 'fitment' }],
          description: 'The mechanism (roller, sprayer, dropper) that sits in the middle.',
        }),
        defineField({
          name: 'capLayer',
          title: 'Layer 4: Cap (Z-Index 3)',
          type: 'reference',
          to: [{ type: 'cap' }],
          description: 'The cap that sits on top.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    // ============ ASSEMBLED PREVIEW ============
    defineField({
      name: 'assembledImage',
      title: 'Assembled Preview Image',
      type: 'image',
      description: 'Optional: A pre-rendered image of the fully assembled product.',
      options: { hotspot: true },
      group: 'basic',
    }),

    // ============ COMMERCE ============
    defineField({
      name: 'shopifyProductId',
      title: 'Shopify Product ID',
      type: 'string',
      group: 'commerce',
    }),
    defineField({
      name: 'price',
      title: 'Base Price',
      type: 'number',
      description: 'Total price (or calculated from components)',
      group: 'commerce',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
      group: 'commerce',
    }),
    defineField({
      name: 'minOrderQuantity',
      title: 'Minimum Order Quantity',
      type: 'number',
      initialValue: 1,
      group: 'commerce',
    }),

    // ============ SEO ============
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'assembledImage',
      bottle: 'visualStack.baseLayer.name',
      cap: 'visualStack.capLayer.name',
    },
    prepare({ title, subtitle, media, bottle, cap }) {
      return {
        title,
        subtitle: subtitle || `${bottle || '?'} + ${cap || '?'}`,
        media,
      }
    },
  },
})

