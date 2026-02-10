import { defineField, defineType } from 'sanity';

/**
 * CapOption
 * Represents a cap style/color variant.
 * These are shared across all fitment variants.
 */
export const capOption = defineType({
  name: 'capOption',
  title: 'Cap Option',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Display name (e.g., "Black", "Silver", "Gold")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'capImage',
      title: 'Cap Image',
      type: 'image',
      description: 'Cap image (transparent PNG)',
      validation: (Rule) => Rule.required(),
      options: {
        accept: '.png',
      },
    }),
  ],
  preview: {
    select: {
      title: 'label',
      media: 'capImage',
    },
  },
});


