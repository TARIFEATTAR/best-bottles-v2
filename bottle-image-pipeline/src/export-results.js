// src/export-results.js
// Export processed images to CSV for before/after comparison
// Usage: npm run export

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

async function exportToCSV() {
    console.log('📊 Exporting processed images to CSV...\n')

    // Fetch all completed products
    const { data: products, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('processing_status', 'completed')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching data:', error.message)
        process.exit(1)
    }

    console.log(`Found ${products.length} completed products\n`)

    // Build CSV header
    const csvLines = [
        'SKU,Product Name,Base Color,Cap/Roller Component,Source GIF (Before),Enhanced Result (After),Variations,Updated At'
    ]

    // Build CSV rows
    for (const product of products) {
        const variations = product.variation_urls || {}
        const variationList = Object.entries(variations)
            .filter(([_, url]) => !url.startsWith('error:'))
            .map(([name, url]) => `${name}: ${url}`)
            .join(' | ')

        const row = [
            product.sku,
            `"${product.product_name}"`,
            product.original_color,
            `"${product.cap_type.replace(/_/g, ' ')}"`,
            product.original_image_url,
            product.enhanced_image_url || 'PENDING',
            `"${variationList}"`,
            product.updated_at
        ]

        csvLines.push(row.join(','))
    }

    // Write to file
    const csvContent = csvLines.join('\n')
    const outputPath = './data/processed-images-export.csv'
    fs.writeFileSync(outputPath, csvContent)

    console.log(`✅ Exported ${products.length} products to: ${outputPath}`)
    console.log('\nSample row:')
    console.log(csvLines[1])
}

exportToCSV()
