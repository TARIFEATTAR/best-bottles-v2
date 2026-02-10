
/**
 * THE SHORTEST ROUTE TO SANITY STUDIO
 * 
 * Instructions:
 * 1. Go to your Sanity Studio codebase (usually a folder named 'studio' or a separate repo).
 * 2. Locate the 'schemas' folder.
 * 3. Create a new file called `bottleCatalog.js` (or .ts).
 * 4. Paste the code below EXACTLY into that file.
 * 5. In your `schemas/index.js` (or index.ts), import these 4 types and add them to the array.
 * 
 * That's it. Your Studio will now have the "Bottle Builder" content types ready for image uploads.
 */

// ---------------------------------------------------------
// 1. GLASS COMPONENT
// Represents the bottle body (Includes Neck + Mechanism like Roller/Sprayer)
// ---------------------------------------------------------
const glassOption = {
    name: 'glassOption',
    title: 'Glass Option',
    type: 'document',
    fields: [
        { name: 'name', title: 'Name', type: 'string' }, // e.g., "Amber"
        {
            name: 'layerImage',
            title: 'Visual Layer (Body + Mechanism)',
            type: 'image',
            description: 'Upload the Full Bottle Body here (Glass + Roller/Sprayer).',
            options: { hotspot: true }
        },
        {
            name: 'previewSwatch',
            title: 'Preview Swatch',
            type: 'image',
            description: 'Small color chip for the UI selector.'
        },
        { name: 'price', title: 'Price', type: 'number' }
    ]
}

// ---------------------------------------------------------
// 2. CAP COMPONENT
// Represents the cap (e.g. Gold, Black)
// ---------------------------------------------------------
const capOption = {
    name: 'capOption',
    title: 'Cap Option',
    type: 'document',
    fields: [
        { name: 'name', title: 'Name', type: 'string' }, // e.g., "Gold"
        {
            name: 'layerImage',
            title: 'Visual Layer (Cap Only)',
            type: 'image',
            description: 'Upload the transparent PNG of the cap here.'
        },
        {
            name: 'previewSwatch',
            title: 'Preview Swatch',
            type: 'image',
            description: 'Small color chip for the UI selector.'
        }
    ]
}

// ---------------------------------------------------------
// 3. BOTTLE BLUEPRINT (The Parent Container)
// Groups these options into a specific "Product" (e.g. 9ml Roll-on)
// ---------------------------------------------------------
const bottleModel = {
    name: 'bottleModel',
    title: 'Bottle Blueprint',
    type: 'document',
    fields: [
        { name: 'name', title: 'Model Name', type: 'string' }, // e.g. "9ml Roll-On"
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name' }
        },
        {
            name: 'outlineImage',
            title: 'Blueprint Outline',
            type: 'image',
            description: 'The Black & White architectural outline used as the base.'
        },
        // The Lists of Valid Parts for this Bottle
        {
            name: 'glassOptions',
            title: 'Compatible Glass',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'glassOption' }] }]
        },
        // Removed Roller Options - Baking it into Glass
        {
            name: 'capOptions',
            title: 'Compatible Caps',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'capOption' }] }]
        }
    ]
}

// Export the array for easy import
export const bottleTypes = [glassOption, capOption, bottleModel];
