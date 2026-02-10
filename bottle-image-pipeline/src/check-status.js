// src/check-status.js
// Check the processing status of all product images
// Usage: npm run status

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function checkStatus() {
  console.log('\n📊 BEST BOTTLES IMAGE PROCESSING STATUS')
  console.log('═'.repeat(50))

  // Get all products and count by status
  const { data, error } = await supabase
    .from('product_images')
    .select('processing_status, sku, product_name, error_message, enhanced_image_url, variation_urls')

  if (error) {
    console.error('Database error:', error.message)
    process.exit(1)
  }

  // Count by status
  const counts = data.reduce((acc, row) => {
    acc[row.processing_status] = (acc[row.processing_status] || 0) + 1
    return acc
  }, {})

  // Calculate completion percentage
  const total = data.length
  const completed = counts.completed || 0
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  console.log(`\n📈 Overall Progress: ${percentage}% complete`)
  console.log('─'.repeat(50))
  console.log(`   ⏳ Pending:     ${counts.pending || 0}`)
  console.log(`   🔄 Processing:  ${counts.processing || 0}`)
  console.log(`   ✅ Completed:   ${counts.completed || 0}`)
  console.log(`   ❌ Errors:      ${counts.error || 0}`)
  console.log('─'.repeat(50))
  console.log(`   📦 Total:       ${total}`)

  // Show recent completions
  const recentCompleted = data
    .filter(r => r.processing_status === 'completed')
    .slice(0, 5)

  if (recentCompleted.length > 0) {
    console.log('\n✅ Recently Completed:')
    for (const row of recentCompleted) {
      const varCount = Object.keys(row.variation_urls || {}).length
      console.log(`   • ${row.sku} (${varCount} variations)`)
    }
  }

  // Show errors
  const errors = data.filter(r => r.processing_status === 'error')
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    for (const row of errors) {
      console.log(`   • ${row.sku}: ${row.error_message || 'Unknown error'}`)
    }
  }

  // Show sample output URLs
  const withUrls = data.filter(r => r.enhanced_image_url)
  if (withUrls.length > 0) {
    console.log('\n🔗 Sample Output URLs:')
    const sample = withUrls[0]
    if (sample.enhanced_image_url) {
      console.log(`   Enhanced: ${sample.enhanced_image_url}`)
    }
    const variations = Object.entries(sample.variation_urls || {})
    if (variations.length > 0) {
      console.log(`   Variations:`)
      for (const [color, url] of variations.slice(0, 3)) {
        console.log(`     • ${color}: ${url}`)
      }
    }
  }

  console.log('\n═'.repeat(50))
}

// Additional command: show details for a specific SKU
async function showProduct(sku) {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('sku', sku)
    .single()

  if (error || !data) {
    console.log(`Product ${sku} not found`)
    return
  }

  console.log('\n📦 Product Details')
  console.log('═'.repeat(50))
  console.log(`SKU: ${data.sku}`)
  console.log(`Name: ${data.product_name}`)
  console.log(`Shape: ${data.bottle_shape}`)
  console.log(`Color: ${data.original_color}`)
  console.log(`Capacity: ${data.capacity_ml}ml`)
  console.log(`Status: ${data.processing_status}`)
  console.log(`\nOriginal: ${data.original_image_url}`)
  
  if (data.enhanced_image_url) {
    console.log(`Enhanced: ${data.enhanced_image_url}`)
  }
  
  if (data.variation_urls && Object.keys(data.variation_urls).length > 0) {
    console.log('\nVariations:')
    for (const [color, url] of Object.entries(data.variation_urls)) {
      console.log(`  ${color}: ${url}`)
    }
  }

  if (data.error_message) {
    console.log(`\n❌ Error: ${data.error_message}`)
  }

  console.log('═'.repeat(50))
}

// Run
const specificSku = process.argv[2]
if (specificSku) {
  showProduct(specificSku)
} else {
  checkStatus()
}
