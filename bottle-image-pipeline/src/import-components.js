
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

const MATRIX_DATA = JSON.parse(fs.readFileSync('/Users/jordanrichter/Projects/Clients/Best Bottles/best-bottles-v2/data/roll-on-9ml-cylinder.json', 'utf8'))

async function importComponents() {
    console.log('📦 Importing standalone 9ml components...')

    // 1. Import Caps
    for (const cap of MATRIX_DATA.capOptions) {
        const { error } = await supabase
            .from('product_images')
            .insert({
                sku: `CAP-9ML-${cap.skuCode}`,
                product_name: `9ml Roll-On Cap: ${cap.name}`,
                bottle_shape: 'component',
                original_color: cap.finish,
                capacity_ml: 9,
                cap_type: cap.name.toLowerCase().replace(/\s+/g, '_'),
                original_image_url: cap.imageUrl,
                processing_status: 'pending',
                variations_needed: []
            })
            .select()

        if (error && error.code !== '23505') { // Ignore unique constraint errors
            console.error(`Error importing cap ${cap.name}:`, error.message)
        } else {
            console.log(`✅ Cap imported: ${cap.name}`)
        }
    }

    // 2. Import Rollers (Manual as they aren't in options as images)
    const rollers = [
        { name: 'Metal Roller', sku: 'ROLLER-9ML-METAL', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif' }, // We'll extract the roller area
        { name: 'Plastic Roller', sku: 'ROLLER-9ML-PLASTIC', url: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9RollBlkDot.gif' }
    ]

    for (const roller of rollers) {
        const { error } = await supabase
            .from('product_images')
            .insert({
                sku: roller.sku,
                product_name: `9ml Roll-On Roller: ${roller.name}`,
                bottle_shape: 'component',
                original_color: roller.name.toLowerCase(),
                capacity_ml: 9,
                cap_type: 'roller',
                original_image_url: roller.url,
                processing_status: 'pending',
                variations_needed: []
            })
            .select()

        if (error && error.code !== '23505') {
            console.error(`Error importing roller ${roller.name}:`, error.message)
        } else {
            console.log(`✅ Roller imported: ${roller.name}`)
        }
    }

    console.log('\n🏁 Component import complete.')
}

importComponents()
