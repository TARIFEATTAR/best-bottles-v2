import { defineArrayMember, defineField, defineType } from 'sanity'

export const productViewerBlock = defineType({
    name: 'productViewerBlock',
    title: 'Product Viewer Layers',
    type: 'object',
    description: 'Controls layered rendering for the configurator/product detail experience.',
    fields: [
        defineField({
            name: 'outlineImage',
            title: 'Outline / Blueprint Image',
            type: 'image',
            description: 'Base technical drawing used as a reference outline.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'lightingOverlay',
            title: 'Lighting Overlay',
            type: 'image',
            description: 'Optional highlights/shadows applied above the glass layer.',
        }),
        defineField({
            name: 'shadowLayer',
            title: 'Shadow Layer',
            type: 'image',
            description: 'Optional drop shadow rendered underneath the bottle.',
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Viewer Background Color',
            type: 'string',
            description: 'Hex value such as #F7F4EF.',
        }),
        defineField({
            name: 'layerOrder',
            title: 'Custom Layer Order',
            type: 'array',
            description: 'Optional override for how layers render in the UI.',
            of: [
                defineArrayMember({
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Outline', value: 'outline' },
                            { title: 'Glass', value: 'glass' },
                            { title: 'Cap', value: 'cap' },
                            { title: 'Lighting Overlay', value: 'lighting' },
                            { title: 'Shadow', value: 'shadow' },
                        ],
                    },
                }),
            ],
        }),
    ],
})
