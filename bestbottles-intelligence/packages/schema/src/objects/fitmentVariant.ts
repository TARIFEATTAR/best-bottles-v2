import { defineField, defineType } from 'sanity';

/**
 * FitmentVariant
 * Groups glass options by fitment type (e.g., Metal Roller, Plastic Roller).
 * Each variant contains an array of glass color options.
 */
export const fitmentVariant = defineType({
  name: 'fitmentVariant',
  title: 'Fitment Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Fitment Type',
      type: 'string',
      description: 'Display name (e.g., "Metal Roller", "Plastic Roller")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'glassOptions',
      title: 'Glass Options',
      type: 'array',
      of: [{ type: 'glassOption' }],
      description: 'Available glass colors/styles for this fitment type',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      glassOptions: 'glassOptions',
    },
    prepare({ title, glassOptions }) {
      const count = glassOptions?.length || 0;
      return {
        title: title || 'Untitled Variant',
        subtitle: `${count} glass option${count !== 1 ? 's' : ''}`,
      };
    },
  },
});


