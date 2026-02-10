import { defineConfig, defineField, defineType } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { presentationTool } from 'sanity/presentation';

// ─────────────────────────────────────────────────────────────────────────────
// Inline schemas temporarily to verify Studio works
// TODO: Move back to @bestbottles/schema once bundling is resolved
// ─────────────────────────────────────────────────────────────────────────────

// ─── Glass Option ────────────────────────────────────────────────────────────
const glassOption = defineType({
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

// ─── Cap Option ──────────────────────────────────────────────────────────────
const capOption = defineType({
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

// ─── Fitment Variant ─────────────────────────────────────────────────────────
const fitmentVariant = defineType({
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

// ─── Product Viewer Block (Legacy) ───────────────────────────────────────────
const productViewerBlock = defineType({
  name: 'productViewerBlock',
  title: 'Product Viewer Block',
  type: 'object',
  fields: [
    defineField({
      name: 'baseImage',
      title: 'Base Image',
      type: 'image',
      description: 'Bottom layer – transparent PNG of bottle base.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fitmentImage',
      title: 'Fitment Image',
      type: 'image',
      description: 'Middle layer – transparent PNG of fitment (optional)',
    }),
    defineField({
      name: 'capImage',
      title: 'Cap Image',
      type: 'image',
      description: 'Top layer – transparent PNG of cap (optional)',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
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
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'object',
      fields: [
        defineField({ name: 'xOffset', title: 'X Offset', type: 'number', initialValue: 0 }),
        defineField({ name: 'yOffset', title: 'Y Offset', type: 'number', initialValue: 0 }),
        defineField({ name: 'scale', title: 'Scale', type: 'number', initialValue: 1.0 }),
      ],
    }),
  ],
});

// ─── Product Document ────────────────────────────────────────────────────────
const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'configurator', title: 'Product Configurator' },
  ],
  fields: [
    // Basic Info
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
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),

    // Product Configurator
    defineField({
      name: 'fitmentVariants',
      title: 'Fitment Variants',
      type: 'array',
      group: 'configurator',
      of: [{ type: 'fitmentVariant' }],
      description: 'Each variant groups glass options by fitment type (e.g., Metal Roller, Plastic Roller)',
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

    // Legacy Support (hidden)
    defineField({
      name: 'viewer',
      title: 'Legacy Viewer',
      type: 'productViewerBlock',
      group: 'basic',
      hidden: true,
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
        subtitle: `${variantCount} fitment${variantCount !== 1 ? 's' : ''}, ${capCount} cap${capCount !== 1 ? 's' : ''}`,
      };
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Schema Types Array
// ─────────────────────────────────────────────────────────────────────────────
const schemaTypes = [
  // Documents
  product,
  // Objects
  productViewerBlock,
  glassOption,
  capOption,
  fitmentVariant,
];

// ─────────────────────────────────────────────────────────────────────────────
// Sanity Config
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'gv4os6ef',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  title: 'Best Bottles Intelligence',

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: 'http://localhost:3000',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
