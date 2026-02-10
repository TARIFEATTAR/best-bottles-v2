import { defineField, defineType } from 'sanity';

/**
 * ProductViewerBlock
 * Drives code-based stacking of transparent PNG components.
 * Sanity defines intent; frontend renders generically.
 */
export const productViewerBlock = defineType({
  name: 'productViewerBlock',
  title: 'Product Viewer Block',
  type: 'object',
  description:
    'Configuration for code-based image stacking (base, fitment, cap)',
  fields: [
    defineField({
      name: 'baseImage',
      title: 'Base Image',
      type: 'image',
      description:
        'Required. Bottom layer – transparent PNG of bottle base.',
      validation: (Rule) => Rule.required(),
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'fitmentImage',
      title: 'Fitment Image',
      type: 'image',
      description:
        'Optional. Middle layer – transparent PNG of fitment (roller, spray, etc.)',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'capImage',
      title: 'Cap Image',
      type: 'image',
      description:
        'Optional. Top layer – transparent PNG of cap.',
      options: {
        accept: '.png',
      },
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      description:
        'Controls the fixed container ratio used by the frontend to ensure consistent stacking.',
      options: {
        list: [
          { title: 'Square (1:1)', value: 'square' },
          { title: 'Portrait (3:4)', value: 'portrait' },
          { title: 'Landscape (4:3)', value: 'landscape' },
        ],
        layout: 'radio',
      },
      initialValue: 'square',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment Overrides',
      type: 'object',
      description:
        'Optional fine-tuning. Use sparingly—defaults should work for most products.',
      fields: [
        defineField({
          name: 'xOffset',
          title: 'X Offset (px)',
          type: 'number',
          description:
            'Horizontal offset in pixels. Negative = left, positive = right.',
          initialValue: 0,
        }),
        defineField({
          name: 'yOffset',
          title: 'Y Offset (px)',
          type: 'number',
          description:
            'Vertical offset in pixels. Negative = up, positive = down.',
          initialValue: 0,
        }),
        defineField({
          name: 'scale',
          title: 'Scale',
          type: 'number',
          description:
            'Scale factor. 1.0 = 100%. Use only when assets require adjustment.',
          initialValue: 1.0,
          validation: (Rule) => Rule.min(0.5).max(2.0),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      baseImage: 'baseImage',
      fitmentImage: 'fitmentImage',
      capImage: 'capImage',
    },
    prepare({ baseImage, fitmentImage, capImage }) {
      const layers = [
        baseImage && 'Base',
        fitmentImage && 'Fitment',
        capImage && 'Cap',
      ]
        .filter(Boolean)
        .join(' + ');

      return {
        title: 'Product Viewer',
        subtitle: layers || 'Base only',
        media: baseImage,
      };
    },
  },
});

