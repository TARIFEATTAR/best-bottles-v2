/**
 * PRODUCT ROLL-ON (MVP Proof of Concept)
 * 
 * ============================================================
 * THE "EXPLODED VIEW" ARCHITECTURE
 * ============================================================
 * 
 * This schema represents a single 9ML Roll-on Bottle composed
 * of THREE distinct image layers stacked via CSS Z-index:
 * 
 *   ┌─────────────────────────────────────┐
 *   │  [ Z-Index 3 ] ── Cap Component     │  ← Top Layer
 *   │       🔘 Silver Screw Cap           │
 *   │                                     │
 *   │  [ Z-Index 2 ] ── Fitment Component │  ← Middle Layer  
 *   │       ⚙️  Metal Roller Ball         │    (floats above neck)
 *   │                                     │
 *   │  [ Z-Index 1 ] ── Base Glass        │  ← Base Layer
 *   │       🔵 Cobalt Blue Glass          │
 *   └─────────────────────────────────────┘
 * 
 * WHY THIS STRUCTURE:
 * - The fitment image will be REUSED across 500+ other products
 * - Centralized asset management via Media Library
 * - Visual composability for rapid product creation
 * 
 * ============================================================
 */

import { defineType, defineField } from 'sanity'
import { PackageIcon } from '@sanity/icons'

export const productRollOn = defineType({
  name: 'productRollOn',
  title: '9ML Roll-On Bottle (MVP)',
  type: 'document',
  icon: PackageIcon,
  
  // Group fields for better Studio UX
  groups: [
    { name: 'info', title: 'Product Info', default: true },
    { name: 'composition', title: 'Visual Composition (Exploded View)' },
  ],
  
  fields: [
    // ============================================================
    // STANDARD FIELDS
    // ============================================================
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'e.g., "9ML Roll-On - Cobalt Blue / Silver Cap / Metal Ball"',
      validation: (rule) => rule.required(),
      group: 'info',
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title)',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
      group: 'info',
    }),
    
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      description: 'Base price for this configuration',
      validation: (rule) => rule.required().positive(),
      group: 'info',
    }),
    
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'info',
    }),

    // ============================================================
    // THE VISUAL ENGINE: "Composition" Object
    // ============================================================
    // This is the CORE of the Exploded View architecture.
    // Three image layers that stack to create one unified product.
    // ============================================================
    
    defineField({
      name: 'composition',
      title: 'Visual Composition',
      type: 'object',
      description: 'The three image layers that compose the "Exploded View" of this product.',
      group: 'composition',
      
      fields: [
        // ────────────────────────────────────────────────────────
        // LAYER 1: BASE GLASS (Z-Index 1)
        // The glass bottle body - sits at the bottom of the stack
        // ────────────────────────────────────────────────────────
        defineField({
          name: 'baseGlass',
          title: '🔵 Base Glass (Layer 1 - Bottom)',
          type: 'image',
          description: 'The glass bottle body. This sits at the BOTTOM of the visual stack (Z-Index 1).',
          options: {
            hotspot: true, // Enable focal point selection
          },
          validation: (rule) => rule.required(),
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Accessibility description (e.g., "Cobalt blue glass bottle body")',
            }),
          ],
        }),
        
        // ────────────────────────────────────────────────────────
        // LAYER 2: FITMENT COMPONENT (Z-Index 2)
        // The roller ball / mechanism - floats above the neck
        // NOTE: This image will be REUSED across 500+ products!
        // ────────────────────────────────────────────────────────
        defineField({
          name: 'fitmentComponent',
          title: '⚙️ Fitment Component (Layer 2 - Middle)',
          type: 'image',
          description: 'The roller ball or mechanism. Visually "floats" above the bottle neck (Z-Index 2). This asset is REUSABLE across many products.',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'offsetY',
              title: 'Vertical Offset (px)',
              type: 'number',
              description: 'Fine-tune vertical position. Negative = move up.',
              initialValue: 0,
            }),
          ],
        }),
        
        // ────────────────────────────────────────────────────────
        // LAYER 3: CAP COMPONENT (Z-Index 3)
        // The cap - sits at the very top of the stack
        // ────────────────────────────────────────────────────────
        defineField({
          name: 'capComponent',
          title: '🔘 Cap Component (Layer 3 - Top)',
          type: 'image',
          description: 'The cap. Sits at the TOP of the visual stack (Z-Index 3).',
          options: {
            hotspot: true,
          },
          validation: (rule) => rule.required(),
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'offsetY',
              title: 'Vertical Offset (px)',
              type: 'number',
              description: 'Fine-tune vertical position. Negative = move up.',
              initialValue: 0,
            }),
          ],
        }),
      ],
      
      // Visual preview hint in Studio
      options: {
        collapsible: false,
        collapsed: false,
      },
    }),
  ],
  
  // ============================================================
  // STUDIO PREVIEW
  // ============================================================
  preview: {
    select: {
      title: 'title',
      price: 'price',
      media: 'composition.baseGlass',
    },
    prepare({ title, price, media }) {
      return {
        title: title || 'Untitled Roll-On',
        subtitle: price ? `$${price.toFixed(2)}` : 'No price set',
        media,
      }
    },
  },
})

