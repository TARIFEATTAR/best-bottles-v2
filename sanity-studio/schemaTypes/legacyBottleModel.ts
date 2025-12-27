
import { defineType } from 'sanity'

export const bottleModel = defineType({
    name: 'bottleModel',
    title: 'Products (Legacy)',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
        }
    ]
})

export const productRollOn = defineType({
    name: 'productRollOn',
    title: 'Products (Old RollOn)',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        }
    ]
})
