import { defineType, defineField } from 'sanity'

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
            description: 'e.g., "18-415 Roll-On", "20-400 Dropper"',
        }),
        defineField({
            name: 'skuPart',
            title: 'SKU Part',
            type: 'string',
            description: 'The SKU component for this fitment',
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
            name: 'overcap_url',
            title: 'Overcap URL',
            type: 'url',
            hidden: true
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
        defineField({
            name: 'neckFinish',
            title: 'Neck Finish',
            type: 'string',
            description: 'Standard neck finish size (e.g., 18-415, 20-400, 24-410)',
        }),
        defineField({
            name: 'fitmentType',
            title: 'Fitment Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Roll-On Ball', value: 'roll-on' },
                    { title: 'Dropper', value: 'dropper' },
                    { title: 'Spray Pump', value: 'spray' },
                    { title: 'Lotion Pump', value: 'lotion-pump' },
                    { title: 'Screw Cap', value: 'screw-cap' },
                    { title: 'Plug', value: 'plug' },
                    { title: 'Stopper', value: 'stopper' },
                ],
            },
        }),
        defineField({
            name: 'material',
            title: 'Material',
            type: 'string',
            description: 'e.g., Steel, Plastic, Glass',
        }),
        defineField({
            name: 'compatibleGlassOptions',
            title: 'Compatible Glass Options',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'glassOption' }] }],
            description: 'Glass bottles this fitment works with',
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
            subtitle: 'neckFinish',
            fitmentType: 'fitmentType',
        },
        prepare({ title, subtitle, fitmentType }) {
            return {
                title: title || 'Untitled Fitment',
                subtitle: [subtitle, fitmentType].filter(Boolean).join(' • '),
            }
        },
    },
})
