/**
 * BACKGROUND COMPONENT
 * 
 * Layer 1 (Z-Index 0) - The Base Layer
 * Represents the architectural grid/blueprint background.
 * 
 * Examples: Blueprint Grid, White Studio, Measurement Overlay
 */

import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const background = defineType({
  name: 'background',
  title: 'Background Style',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., "Blueprint Grid V1", "White Studio", "Measurement Overlay"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'The base layer image (can be opaque or transparent).',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Blueprint/Technical', value: 'blueprint' },
          { title: 'White Studio', value: 'white-studio' },
          { title: 'Dark Studio', value: 'dark-studio' },
          { title: 'Lifestyle', value: 'lifestyle' },
          { title: 'Transparent', value: 'transparent' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'showMeasurements',
      title: 'Show Measurements',
      type: 'boolean',
      description: 'Does this background include measurement overlays?',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'style',
      media: 'backgroundImage',
    },
  },
})

