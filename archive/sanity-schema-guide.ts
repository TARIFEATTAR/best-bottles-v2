
/**
 * SANITY SCHEMA DEFINITIONS
 * Copy these into your Sanity Studio project (usually in the 'schemas' folder).
 * 
 * CONCEPT:
 * We treat the bottle as a composition of layers. Each component (Glass, Cap, Roller)
 * has a "Layer Image" which is a transparent PNG pre-rendered to align perfectly
 * on a common canvas (e.g., 1000x2000px).
 */

// 1. GLASS OPTION
export const glassOption = {
    name: 'glassOption',
    title: 'Glass Option',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string', // e.g., "Amber", "Frosted", "Clear"
        },
        {
            name: 'layerImage',
            title: 'Layer Image (Full Bottle)',
            type: 'image',
            description: 'Transparent PNG of the bottle body. Must be same dimensions as other layers.',
            options: { hotspot: true }
        },
        {
            name: 'price',
            title: 'Price Adjustment',
            type: 'number'
        },
        {
            name: 'demoOnly',
            title: 'Demo Only',
            type: 'boolean'
        }
    ]
}

// 2. CAP OPTION
export const capOption = {
    name: 'capOption',
    title: 'Cap Option',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string', // e.g., "Gold", "Black"
        },
        {
            name: 'layerImage',
            title: 'Layer Image (Cap Only)',
            type: 'image',
            description: 'Transparent PNG of the cap. Must align perfectly with the bottle body on the canvas.',
        },
        {
            name: 'finish',
            title: 'Finish',
            type: 'string',
            options: {
                list: ['Matte', 'Polished', 'Brushed']
            }
        }
    ]
}

// 3. ROLLER OPTION
export const rollerOption = {
    name: 'rollerOption',
    title: 'Roller Option',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string', // e.g., "Metal", "Plastic"
        },
        {
            name: 'layerImage',
            title: 'Layer Image (Ball Only)',
            type: 'image',
            description: 'Transparent PNG of the roller ball.',
        }
    ]
}

// 4. BOTTLE BLUEPRINT (The Configuration Container)
export const bottleBlueprint = {
    name: 'bottleModel',
    title: 'Bottle Blueprint',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Model Name',
            type: 'string', // e.g. "9ml Roll-On"
        },
        {
            name: 'baseWidth',
            title: 'Canvas Base Width',
            type: 'number',
            description: 'Width of the source images in px (e.g. 1000)'
        },
        {
            name: 'baseHeight',
            title: 'Canvas Base Height',
            type: 'number',
            description: 'Height of the source images in px (e.g. 2000)'
        },
        {
            name: 'glassOptions',
            title: 'Available Glass Options',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'glassOption' }] }]
        },
        {
            name: 'capOptions',
            title: 'Available Cap Options',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'capOption' }] }]
        },
        {
            name: 'rollerOptions',
            title: 'Available Roller Options',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'rollerOption' }] }]
        }
    ]
}
