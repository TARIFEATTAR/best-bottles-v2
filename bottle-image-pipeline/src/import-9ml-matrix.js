// src/import-9ml-matrix.js
// Specialized import script for the 9ml Roll-On matrix
// Sets up the 5 colors x 10 caps x 2 rollers configurations

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

const MATRIX_DATA = JSON.parse(fs.readFileSync('/Users/jordanrichter/Projects/Clients/Best Bottles/best-bottles-v2/data/roll-on-9ml-cylinder.json', 'utf8'))

async function importMatrix() {
    console.log('🧪 Importing 9ml Roll-On Matrix...')

    const baseBottles = MATRIX_DATA.baseBottles // 5 colors
    const rollerOptions = MATRIX_DATA.rollerOptions // 2 rollers
    const capOptions = MATRIX_DATA.capOptions // 10 caps

    let importedCount = 0

    for (const bottle of baseBottles) {
        for (const roller of rollerOptions) {
            // Use the specific GIF for this bottle/roller combo if it exists
            const originalImageUrl = roller.type === 'metal' ? bottle.imageUrlMetal : bottle.imageUrlPlastic
            const skuBase = `${bottle.skuPrefix}${roller.skuCode}`

            for (const cap of capOptions) {
                const fullSku = `${skuBase}${cap.skuCode}`

                console.log(`   📦 Preparing: ${fullSku} (${bottle.name} + ${roller.name} + ${cap.name})`)

                // Check if we already have it
                const { data: existing } = await supabase
                    .from('product_images')
                    .select('id')
                    .eq('sku', fullSku)
                    .single()

                if (existing) {
                    console.log(`      ⚠️  SKU ${fullSku} already exists, skipping.`)
                    continue
                }

                // Insert new product record
                const { error } = await supabase
                    .from('product_images')
                    .insert({
                        sku: fullSku,
                        product_name: `${bottle.name} with ${roller.name} and ${cap.name}`,
                        bottle_shape: 'cylinder',
                        original_color: bottle.color,
                        capacity_ml: 9,
                        cap_type: `${roller.type}_roll_with_${cap.name.toLowerCase().replace(/\s+/g, '_')}_cap`,
                        original_image_url: originalImageUrl,
                        processing_status: 'pending',
                        variations_needed: [] // We are processing each permutation as a primary image
                    })

                if (error) {
                    console.error(`      ❌ Error inserting ${fullSku}:`, error.message)
                } else {
                    importedCount++
                }
            }
        }
    }

    console.log(`\n✅ Finished! Imported ${importedCount} new configurations.`)
    console.log(`Total matrix size: ${baseBottles.length * rollerOptions.length * capOptions.length} products.`)
}

importMatrix()
