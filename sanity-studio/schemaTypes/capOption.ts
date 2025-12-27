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
            name: 'finish',
            title: 'Finish (Legacy)',
            type: 'string',
            hidden: true,
        }),
        defineField({
            name: 'assemblyOffsetY',
            title: 'Assembly Offset Y (px)',
            type: 'number',
            description: 'Vertical pixel adjustment to align this cap with the bottle neck.',
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
