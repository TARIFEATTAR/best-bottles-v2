import { defineField, defineType } from 'sanity'

export const product = defineType({
    name: 'product',
    title: 'Product (Bottle Model)',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title', maxLength: 96 },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'basePrice',
            title: 'Base Price',
            type: 'number',
        }),
        defineField({
            name: 'shopifyProductId',
            title: 'Shopify Product ID',
            type: 'string',
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'sku',
            title: 'SKU',
            type: 'string',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Draft', value: 'product_draft' },
                    { title: 'Preview', value: 'product_preview' },
                    { title: 'Published', value: 'product_published' },
                    { title: 'Archived', value: 'product_archived' },
                ],
                layout: 'radio',
            },
            initialValue: 'product_draft',
        }),
        defineField({
            name: 'specifications',
            title: 'Specifications',
            type: 'object',
            fields: [
                defineField({ name: 'capacity', title: 'Capacity', type: 'string' }),
                defineField({ name: 'material', title: 'Material', type: 'string' }),
            ],
        }),
        defineField({
            name: 'defaultGlass',
            title: 'Default Glass Option',
            type: 'reference',
            to: [{ type: 'glassOption' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'defaultCap',
            title: 'Default Cap Option',
            type: 'reference',
            to: [{ type: 'capOption' }],
        }),
        defineField({
            name: 'glassOptions',
            title: 'Compatible Glass',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'glassOption' }] }],
        }),
        defineField({
            name: 'fitmentVariants',
            title: 'Available Fitments',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'fitmentVariant' }] }],
        }),
        defineField({
            name: 'capOptions',
            title: 'Compatible Caps',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'capOption' }] }],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'defaultGlass.layerImage',
        },
    },
})
