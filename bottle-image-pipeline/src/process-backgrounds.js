// src/process-backgrounds.js
// Process backgrounds: remove backgrounds and add branded Best Bottles backgrounds
// Usage: npm run backgrounds

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Best Bottles brand colors
const BRAND_COLORS = {
  beige: '#F5F0E8',
  cream: '#FAF8F5',
  navy: '#1A2B4B',
  gold: '#C4A574'
}

// ============================================
// BACKGROUND REMOVAL OPTIONS
// ============================================

// Option A: Remove.bg API (best quality, ~$0.09/image)
async function removeBackgroundRemoveBg(imageUrl) {
  if (!process.env.REMOVE_BG_API_KEY) {
    throw new Error('REMOVE_BG_API_KEY not set in .env')
  }

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: 'auto',
      format: 'png',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Remove.bg error: ${response.status} - ${error}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

// Option B: Use Gemini to describe the image and sharp for basic processing
// This is a simplified fallback - not true background removal
async function removeBackgroundBasic(imageBuffer) {
  // This is a placeholder - real background removal requires ML models
  // For production, use Remove.bg or self-hosted rembg
  console.log('   ⚠️ Using basic processing (no true background removal)')
  return imageBuffer
}

// ============================================
// BRANDED BACKGROUND GENERATOR
// ============================================

async function addBrandedBackground(transparentBuffer, options = {}) {
  const {
    bgColor = BRAND_COLORS.beige,
    padding = 80,
    outputSize = 1200, // Square output
  } = options

  // Get original image metadata
  const image = sharp(transparentBuffer)
  const metadata = await image.metadata()

  // Calculate scaling to fit in output with padding
  const availableSize = outputSize - (padding * 2)
  const scale = Math.min(
    availableSize / metadata.width,
    availableSize / metadata.height
  )

  const newWidth = Math.round(metadata.width * scale)
  const newHeight = Math.round(metadata.height * scale)

  // Resize the product image
  const resizedProduct = await image
    .resize(newWidth, newHeight, { fit: 'inside' })
    .toBuffer()

  // Create background
  const background = await sharp({
    create: {
      width: outputSize,
      height: outputSize,
      channels: 4,
      background: bgColor
    }
  }).png().toBuffer()

  // Calculate center position
  const left = Math.round((outputSize - newWidth) / 2)
  const top = Math.round((outputSize - newHeight) / 2)

  // Composite product onto background
  return sharp(background)
    .composite([{
      input: resizedProduct,
      left: left,
      top: top
    }])
    .png()
    .toBuffer()
}

async function uploadToStorage(buffer, filePath) {
  const { data, error } = await supabase.storage
    .from('bottle-images')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('bottle-images')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================
// MAIN PROCESSING
// ============================================

async function processBackgrounds(batchSize = 10) {
  console.log('\n🎨 Best Bottles Background Processing')
  console.log('═'.repeat(50))

  // Get products that need background processing
  const { data: products, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('processing_status', 'completed')
    .is('branded_bg_url', null)
    .limit(batchSize)

  if (error) {
    console.error('Database error:', error.message)
    return
  }

  if (!products.length) {
    console.log('✨ No products need background processing!')
    return
  }

  console.log(`\nProcessing ${products.length} products...\n`)

  const useRemoveBg = !!process.env.REMOVE_BG_API_KEY
  if (useRemoveBg) {
    console.log('Using Remove.bg API for background removal\n')
  } else {
    console.log('⚠️ REMOVE_BG_API_KEY not set - using basic processing\n')
    console.log('For best results, get an API key from https://www.remove.bg/api\n')
  }

  let processed = 0
  let failed = 0

  for (const product of products) {
    try {
      console.log(`📦 ${product.sku}: ${product.product_name}`)

      // Use enhanced image if available, otherwise original
      const sourceUrl = product.enhanced_image_url || product.original_image_url
      console.log(`   Source: ${sourceUrl}`)

      // Fetch the source image
      const response = await fetch(sourceUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      const imageBuffer = Buffer.from(await response.arrayBuffer())

      // Remove background
      let noBgBuffer
      if (useRemoveBg) {
        console.log('   → Removing background with Remove.bg...')
        noBgBuffer = await removeBackgroundRemoveBg(sourceUrl)
      } else {
        noBgBuffer = await removeBackgroundBasic(imageBuffer)
      }

      // Upload transparent version
      const noBgUrl = await uploadToStorage(noBgBuffer, `nobg/${product.sku}.png`)
      console.log('   ✅ Transparent version uploaded')

      // Create branded background version
      console.log('   → Creating branded background...')
      const brandedBuffer = await addBrandedBackground(noBgBuffer, {
        bgColor: BRAND_COLORS.beige,
        padding: 100,
        outputSize: 1200
      })
      const brandedUrl = await uploadToStorage(brandedBuffer, `branded/${product.sku}.png`)
      console.log('   ✅ Branded version uploaded')

      // Update database
      await supabase.from('product_images').update({
        nobg_image_url: noBgUrl,
        branded_bg_url: brandedUrl
      }).eq('id', product.id)

      processed++
      console.log(`   ✅ Complete!`)

      // Rate limit
      await delay(1000)

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`)
      failed++
    }
  }

  console.log('\n' + '═'.repeat(50))
  console.log('📊 BACKGROUND PROCESSING COMPLETE')
  console.log('═'.repeat(50))
  console.log(`   ✅ Processed: ${processed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log('═'.repeat(50))
}

// Run
const batchSize = parseInt(process.argv[2]) || 10
processBackgrounds(batchSize)
