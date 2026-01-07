import { defineField, defineType } from 'sanity'

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
            name: 'previewSwatch',
            title: 'Preview Swatch',
            type: 'image',
            options: { hotspot: true },
            description: 'Small texture pattern used for simple color buttons (optional).',
        }),
        defineField({
            name: 'layerImage',
            title: 'Layer Image (Cap)',
            type: 'image',
            description: 'The cap image (2000x2000 transparent PNG).',
            options: { hotspot: true },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'skuPart',
            title: 'SKU Part',
            type: 'string',
            description: 'The unique SKU fragment for this cap (e.g. "GlSh"). Used to generate the final product SKU.',
        }),
        defineField({
            name: 'finish',
            title: 'Finish (Legacy)',
            type: 'string',
            hidden: true,
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'layerImage',
        },
    },
})
