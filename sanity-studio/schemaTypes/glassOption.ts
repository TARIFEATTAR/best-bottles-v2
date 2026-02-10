import { defineType, defineField } from 'sanity'

export const glassOption = defineType({
    name: 'glassOption',
    title: 'Glass Option',
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
            description: 'The SKU component for this glass option',
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
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'sortOrder',
            title: 'Sort Order',
            type: 'number',
            description: 'Used for ordering in lists',
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'skuPart',
        },
        prepare({ title, subtitle }) {
            return {
                title: title || 'Untitled Glass Option',
                subtitle: subtitle,
            }
        },
    },
})
