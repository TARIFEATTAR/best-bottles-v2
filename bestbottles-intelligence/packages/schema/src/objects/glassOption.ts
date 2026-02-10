import { defineField, defineType } from 'sanity';

/**
 * GlassOption
 * Represents a glass color/style variant with its base image.
 * The base image includes the bottle + fitment (roller) already combined.
 */
export const glassOption = defineType({
  name: 'glassOption',
  title: 'Glass Option',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Display name (e.g., "Blue", "Clear", "Amber", "Frosted")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'baseImage',
      title: 'Base Image',
      type: 'image',
      description: 'Bottle + fitment combo image (transparent PNG)',
      validation: (Rule) => Rule.required(),
      options: {
        accept: '.png',
      },
    }),
  ],
  preview: {
    select: {
      title: 'label',
      media: 'baseImage',
    },
  },
});


