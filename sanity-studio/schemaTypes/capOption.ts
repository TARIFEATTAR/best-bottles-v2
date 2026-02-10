import { defineType, defineField } from 'sanity'

export const capOption = defineType({
    name: 'capOption',
    title: 'Cap Option',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'skuPart',
            title: 'SKU Part',
            type: 'string',
            description: 'The SKU component for this cap option',
        }),
        defineField({
            name: 'image_url',
            title: 'Image URL',
            type: 'url',
            description: 'Direct URL to the image stored in Supabase',
            validation: (Rule) =>
                Rule.uri({
                    scheme: ['http', 'https'],
                }),
        }),
        defineField({
            name: 'color',
            title: 'Color',
            type: 'string',
            description: 'Cap color (e.g., Black, Gold, Silver)',
        }),
        defineField({
            name: 'material',
            title: 'Material',
            type: 'string',
            description: 'Cap material (e.g., Plastic, Metal, Aluminum)',
        }),
        defineField({
            name: 'compatibleFitments',
            title: 'Compatible Fitments',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'fitmentVariant' }] }],
            description: 'Fitment sizes this cap works with',
        }),
        defineField({
            name: 'sortOrder',
            title: 'Sort Order',
            type: 'number',
            description: 'Used for ordering in lists',
        }),
        defineField({
            name: 'assembly_offset_x',
            type: 'number',
            hidden: true
        }),
        defineField({
            name: 'assembly_offset_y',
            type: 'number',
            hidden: true
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'skuPart',
            color: 'color',
        },
        prepare({ title, subtitle, color }) {
            return {
                title: title || 'Untitled Cap Option',
                subtitle: [subtitle, color].filter(Boolean).join(' • '),
            }
        },
    },
})
