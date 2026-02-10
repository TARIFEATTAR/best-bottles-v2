import { getCliClient } from 'sanity/cli'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

console.log(`🔑 Token check: Trying CLI Client...`)

const client = getCliClient({
    apiVersion: '2024-01-01',
    projectId: 'gv4os6ef',
    dataset: 'production',
})

// --- DATA DEFINITIONS ---

// 1. Caps (Isolated Images available)
const CAPS = [
    { name: 'Shiny Gold Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnGl.png', finish: 'Shiny Gold' },
    { name: 'Matte Gold Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattGl.png', finish: 'Matte Gold' },
    { name: 'Shiny Silver Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnSl.png', finish: 'Shiny Silver' },
    { name: 'Matte Silver Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattSl.png', finish: 'Matte Silver' },
    { name: 'Black Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollBlkDot.png', finish: 'Black/Dot' },
    { name: 'White Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollWhite.png', finish: 'White' },
    { name: 'Shiny Black Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnBlk.png', finish: 'Shiny Black' },
    { name: 'Pink Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollPnkDot.png', finish: 'Pink/Dot' },
    { name: 'Silver Dot Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollSlDot.png', finish: 'Silver/Dot' },
    { name: 'Copper Matte Cap', url: 'https://www.bestbottles.com/images/store/caps/17-415CpRollCu.png', finish: 'Copper' },
]

// 2. Glass (Using "Metal Roller" variants as base images for now)
const GLASS = [
    { name: 'Clear Glass', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif', hex: '#FFFFFF' },
    { name: 'Amber Glass', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylAmb9MtlRollShnGl.gif', hex: '#e8b57b' },
    { name: 'Frosted Glass', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBTallCylFrst9MtlRollBlkDot.gif', hex: '#E0E0E0' },
    { name: 'Cobalt Glass', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylBlu9MtlRollBlkDot.gif', hex: '#002060' },
    { name: 'Swirl Glass', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylSwrl9MtlRollBlkDot.gif', hex: '#FFFFFF' },
]

// 3. Fitments (Abstract data for now, reusing glass image as placeholder if needed, or null)
const FITMENTS = [
    { name: 'Metal Roller', type: 'Roller Ball' },
    { name: 'Plastic Roller', type: 'Roller Ball' },
]

async function uploadImage(url: string) {
    console.log(`   Uploading: ${url}...`)
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText} `)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const asset = await client.assets.upload('image', buffer, {
            filename: url.split('/').pop()
        })
        return asset._id
    } catch (e) {
        console.error(`   ❌ Failed to upload ${url}: ${(e as any).message} `)
        return null
    }
}

async function seedMasterProduct() {
    console.log('🚀 Starting Master Product Population for "9ml Roll On"')

    // --- A. Create Caps ---
    console.log('\n🧢 Processing Caps...')
    const capIds: string[] = []
    for (const item of CAPS) {
        const assetId = await uploadImage(item.url)
        if (!assetId) continue

        const doc = await client.create({
            _type: 'capOption',
            name: item.name,
            finish: item.finish,
            assemblyOffsetY: 0, // Default offset
            layerImage: { _type: 'image', asset: { _ref: assetId } },
            previewSwatch: { _type: 'image', asset: { _ref: assetId } } // Use same image for swatch for now
        })
        console.log(`   ✅ Created: ${doc.name} `)
        capIds.push(doc._id)
    }

    // --- B. Create Glass ---
    console.log('\n🥃 Processing Glass...')
    const glassIds: string[] = []
    for (const item of GLASS) {
        const assetId = await uploadImage(item.url)
        if (!assetId) continue

        const doc = await client.create({
            _type: 'glassOption',
            name: item.name,
            priceModifier: 0,
            layerImage: { _type: 'image', asset: { _ref: assetId } },
            // Create a simple hex color swatch placeholder if we don't have a texture
            previewSwatch: { _type: 'image', asset: { _ref: assetId } }
        })
        console.log(`   ✅ Created: ${doc.name} `)
        glassIds.push(doc._id)
    }

    // --- C. Create Fitments ---
    console.log('\n⚙️  Processing Fitments...')
    const fitmentIds: string[] = []
    for (const item of FITMENTS) {
        // Reuse a glass image as a placeholder for the fitment layer if we had to, 
        // but ideally we want a specific fitment image. 
        // For now, we will create the DATA record without a layerImage 
        // essentially making it a data-only selection (which is fine for MVP logic if image is baked into glass)

        const doc = await client.create({
            _type: 'fitmentVariant',
            name: item.name,
            type: item.type,
            // No layerImage for now, assuming base glass might have it or we add later
        })
        console.log(`   ✅ Created: ${doc.name} `)
        fitmentIds.push(doc._id)
    }

    // --- D. Create/Update Master Product ---
    console.log('\n👑 Creating Master Product: "9ml Roll On Bottle"...')

    // Check if exists first to avoid duplicates or finding the wrong one
    const existing = await client.fetch(`* [_type == "product" && slug.current == "9ml-roll-on-bottle"][0]._id`)

    const productDoc = {
        _type: 'product',
        title: '9ml Roll On Bottle',
        slug: { _type: 'slug', current: '9ml-roll-on-bottle' },
        basePrice: 0.50,
        sku: '9ML-ROLL-MASTER',
        defaultGlass: { _type: 'reference', _ref: glassIds[0] }, // Default to Clear
        defaultCap: { _type: 'reference', _ref: capIds[0] },     // Default to Gold

        // Link Arrays
        glassOptions: glassIds.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        capOptions: capIds.map(id => ({ _type: 'reference', _ref: id, _key: id })),
        fitmentVariants: fitmentIds.map(id => ({ _type: 'reference', _ref: id, _key: id })),
    }

    if (existing) {
        console.log(`   🔄 Updating existing product(${existing})...`)
        await client.patch(existing).set(productDoc).commit()
    } else {
        console.log(`   ✨ Creating NEW product...`)
        await client.create(productDoc)
    }

    console.log('\n🎉 Master Product Population Complete!')
}

seedMasterProduct().catch(console.error)
