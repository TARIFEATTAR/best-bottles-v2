// src/import-data.js
// Import product data from CSV into Supabase
// Usage: npm run import

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import Papa from 'papaparse'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function importCSV(filePath = './data/test-products.csv') {
  console.log('📥 Importing product data from CSV...\n')

  // Read CSV file
  const csvData = fs.readFileSync(filePath, 'utf8')
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true
  })

  console.log(`Found ${parsed.data.length} products in CSV\n`)

  let imported = 0
  let errors = 0

  for (const row of parsed.data) {
    if (!row.sku) continue

    // Parse variations_needed from semicolon-separated string to array
    const variationsArray = row.variations_needed
      ? row.variations_needed.split(';').map(v => v.trim()).filter(Boolean)
      : []

    const productData = {
      sku: row.sku,
      product_name: row.product_name,
      bottle_shape: row.bottle_shape,
      original_color: row.original_color,
      capacity_ml: parseInt(row.capacity_ml) || null,
      cap_type: row.cap_type,
      original_image_url: row.original_image_url,
      variations_needed: variationsArray,
      processing_status: 'pending'
    }

    const { error } = await supabase
      .from('product_images')
      .upsert(productData, { onConflict: 'sku' })

    if (error) {
      console.error(`  ❌ ${row.sku}: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ ${row.sku}: ${row.product_name}`)
      imported++
    }
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`📊 IMPORT COMPLETE`)
  console.log(`   Imported: ${imported}`)
  console.log(`   Errors: ${errors}`)
  console.log('─'.repeat(50))
}

// Run import
const filePath = process.argv[2] || './data/test-products.csv'
importCSV(filePath)
