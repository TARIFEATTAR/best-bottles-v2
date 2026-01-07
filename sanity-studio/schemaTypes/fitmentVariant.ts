import { defineField, defineType } from 'sanity'

export const fitmentVariant = defineType({
    name: 'fitmentVariant',
    title: 'Fitment Variant',
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
            description: 'The unique SKU fragment for this mech (e.g. "MtlRoll"). Used to generate the final product SKU.',
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Roller', value: 'Roller' },
                    { title: 'Spray', value: 'Spray' },
                    { title: 'Pump', value: 'Pump' },
                    { title: 'Dropper', value: 'Dropper' },
                    { title: 'Reducer', value: 'Reducer' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'layerImage',
            title: 'Layer Image (Mechanism)',
            type: 'image',
            description: 'OPTIONAL: Independent image for the mechanism (e.g., the roller ball itself). If undefined, assumes mechanism is part of the Glass layer.',
            options: { hotspot: true },
        }),
        defineField({
            name: 'overcapImage',
            title: 'Overcap Image (Spray Only)',
            type: 'image',
            description: 'OPTIONAL: For spray mechanisms, the decorative overcap that covers the pump. When set, this replaces the user-selected cap.',
            options: { hotspot: true },
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'type',
            media: 'layerImage',
        },
    },
})
