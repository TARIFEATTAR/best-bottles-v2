import { defineField, defineType } from 'sanity';

/**
 * Product Document
 * 
 * Supports a product configurator where customers can:
 * 1. Select a fitment type (Metal Roller, Plastic Roller)
 * 2. Toggle between glass colors within that fitment
 * 3. Toggle between cap options (shared across all variants)
 */
export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'configurator', title: 'Product Configurator' },
  ],
  fields: [
    // ─── Basic Info ───────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),

    // ─── Product Configurator ─────────────────────────────────
    defineField({
      name: 'fitmentVariants',
      title: 'Fitment Variants',
      type: 'array',
      group: 'configurator',
      of: [{ type: 'fitmentVariant' }],
      description: 'Each variant groups glass options by fitment type (e.g., Metal Roller, Plastic Roller)',
      validation: (Rule) => Rule.min(1).error('Add at least one fitment variant'),
    }),

    defineField({
      name: 'capOptions',
      title: 'Cap Options',
      type: 'array',
      group: 'configurator',
      of: [{ type: 'capOption' }],
      description: 'Available caps (shared across all fitment variants)',
    }),

    defineField({
      name: 'defaultAspectRatio',
      title: 'Default Aspect Ratio',
      type: 'string',
      group: 'configurator',
      description: 'Container aspect ratio for the product viewer',
      options: {
        list: [
          { title: 'Square (1:1)', value: 'square' },
          { title: 'Portrait (3:4)', value: 'portrait' },
          { title: 'Landscape (4:3)', value: 'landscape' },
        ],
        layout: 'radio',
      },
      initialValue: 'square',
    }),

    // ─── Legacy Support ───────────────────────────────────────
    defineField({
      name: 'viewer',
      title: 'Legacy Viewer (deprecated)',
      type: 'productViewerBlock',
      group: 'basic',
      description: 'Old single-viewer format. Use Product Configurator instead.',
      hidden: true, // Hide from UI but keep for backward compatibility
    }),
  ],

  preview: {
    select: {
      title: 'title',
      fitmentVariants: 'fitmentVariants',
      capOptions: 'capOptions',
    },
    prepare({ title, fitmentVariants, capOptions }) {
      const variantCount = fitmentVariants?.length || 0;
      const capCount = capOptions?.length || 0;
      return {
        title: title || 'Untitled Product',
        subtitle: `${variantCount} fitment variant${variantCount !== 1 ? 's' : ''}, ${capCount} cap${capCount !== 1 ? 's' : ''}`,
      };
    },
  },
});
