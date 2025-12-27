import { defineField, defineType } from 'sanity'

export const glassOption = defineType({
    name: 'glassOption',
    title: 'Glass Option',
    type: 'document',
    fields: [
        defineField({
            name: 'name', // Using 'name' as per request, mapped to title in UI usually
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'previewSwatch',
            title: 'Preview Swatch',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'layerImage',
            title: 'Layer Image (Base Bottle)',
            type: 'image',
            description: 'The base bottle image (2000x2000 transparent PNG).',
            options: { hotspot: true },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price (Legacy)',
            type: 'number',
            hidden: true,
        }),
        defineField({
            name: 'priceModifier',
            title: 'Price Modifier',
            type: 'number',
            initialValue: 0,
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'layerImage',
        },
    },
})
