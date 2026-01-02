import { defineArrayMember, defineField, defineType } from 'sanity'

export const homepageConfig = defineType({
    name: 'homepageConfig',
    title: 'Homepage Configuration',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Homepage Configuration'
        }),
        defineField({
            name: 'hero',
            title: 'Hero Section',
            type: 'object',
            fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'text' }),
                defineField({ name: 'desktopImage', title: 'Desktop Image', type: 'image', options: { hotspot: true } }),
                defineField({ name: 'mobileImage', title: 'Mobile Image', type: 'image', options: { hotspot: true } }),
                defineField({ name: 'exploreButtonText', title: 'Explore Button Text', type: 'string' }),
                defineField({ name: 'startButtonText', title: 'Start Button Text (Blueprint V2)', type: 'string' }),
                defineField({ name: 'highFiButtonText', title: 'High-Fi Demo Button Text', type: 'string' }),
            ]
        }),
        defineField({
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({ name: 'label', title: 'Label', type: 'string' }),
                        defineField({ name: 'iconName', title: 'Icon Name', type: 'string' }),
                        defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
                    ]
                })
            ]
        }),
        defineField({
            name: 'promoSlider',
            title: 'Promo / Before-After Slider',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({ name: 'labelBefore', title: 'Label (Before)', type: 'string' }),
                        defineField({ name: 'imageBefore', title: 'Image (Before)', type: 'image', options: { hotspot: true } }),
                        defineField({ name: 'labelAfter', title: 'Label (After)', type: 'string' }),
                        defineField({ name: 'imageAfter', title: 'Image (After)', type: 'image', options: { hotspot: true } }),
                    ]
                })
            ]
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: title || 'Homepage Config',
            }
        }
    }
})
