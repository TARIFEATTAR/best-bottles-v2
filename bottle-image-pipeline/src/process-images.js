// src/process-images.js
// Main image processing pipeline using Google Gemini
// Usage: npm run process (full batch) or npm run process:test (single image test)

import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ============================================
// PROMPT BUILDERS - These create context-aware prompts
// ============================================

function buildEnhancementPrompt(product) {
  if (product.bottle_shape === 'component') {
    return `Act as a high-fidelity macro photographer. Your goal is to upscale this individual bottle component (cap or roller) to 4K resolution.

COMPONENT: ${product.product_name}
MATERIAL: ${product.original_color}

STRICT INSTRUCTIONS:
1. MACRO DETAIL: Sharpen the textures of the ${product.original_color} material (e.g., brushed metal, shiny plastic, or dotted finish).
2. REMOVE BACKGROUND: Ensure the component is on a PERFECT PURE WHITE.
3. PRESERVE SHAPE: Do not alter the proportions or perspective.
4. PIXEL RECONSTRUCTION: Remove all compression artifacts from the source PNG/GIF.

Output: A pixel-perfect, high-resolution macro shot of the component.`
  }

  const is9mlMatrix = product.sku.startsWith('GBCyl') && product.sku.includes('Roll');

  let capInstruction = '';
  if (is9mlMatrix) {
    const parts = product.cap_type.split('_with_');
    const rollerType = parts[0]?.replace('_roll', '') || 'metal';
    const capFinish = parts[1]?.replace('_cap', '')?.replace(/_/g, ' ') || 'black dot';

    capInstruction = `
[9ml MATRIX COMPONENT SWAP]
- SOURCE IMAGE: Contains a ${product.original_color} bottle with a "black dot" cap.
- TARGET CAP: You MUST replace the "black dot" cap with a ${capFinish} finish.
- TARGET ROLLER: Ensure the fitment reflects a ${rollerType} ball.
- NECK ALIGNMENT: The cap MUST be perfectly seated on the glass neck. No gaps, no overlapping transparency. It should look like a precision industrial fit.`;
  }

  return `Act as a precision industrial rendering engine. Your task is to UPSCALE the provided product image with 100% fidelity to the original bottle body.

PRODUCT: ${product.capacity_ml}ml ${product.bottle_shape} bottle
GLASS COLOR: ${product.original_color}
CLOSURE TARGET: ${product.cap_type.replace(/_/g, ' ')}
${capInstruction}

STRICT FIDELITY CONSTRAINTS:
1. THE "FIDELITY LOCK": You are NOT allowed to be creative. If the original glass has a certain transparency or tint, MATCH IT EXACTLY. Do not make it "prettier" or "more vibrant" than the original.
2. COLOR CALIBRATION: Match the RGB values and lighting highlights of the original GIF 1:1. Any hallucination in coloring will be considered a failure.
3. EDGE SHARPNESS: Reconstruct clean, crisp vector-like edges for the silhouette, but keep the internal glass textures identical to the source.
4. ALIGNMENT: Maintain the exact center-of-gravity and vertical alignment of the bottle from the original frame.
5. NO HALLUCINATION: No new shadows, no new light sources, no artistic bokeh.

Output: A photorealistic, high-resolution PNG on a pure white background.`
}

function buildVariationPrompt(product, targetColor) {
  const colorDescriptions = {
    'frosted': 'frosted/matte finish glass (translucent, soft light diffusion, satiny texture)',
    'amber': 'deep translucent amber glass (rich golden-brown UV-protective tones)',
    'cobalt blue': 'vivid cobalt blue glass (deep, high-saturation blue)',
    'green': 'emerald green glass',
    'clear': 'crystal clear colorless transparent glass',
    'blue': 'soft ocean blue tinted glass',
    'swirl': 'clear glass with an internal 3D swirled marble pattern'
  }

  const material = colorDescriptions[targetColor] || targetColor;

  return `Act as a professional product colorist. Change ONLY the glass material of the provided bottle while keeping all other components identical.

TARGET GLASS: ${material}
RETAIN EXACTLY:
- The ${product.cap_type.replace(/_/g, ' ')} - exactly as it appears in the enhanced version.
- The lighting, shadows, and reflections on the glass.
- The position, scale, and 4K resolution.

CONSTRAINTS:
1. No color bleed onto the cap or background.
2. Maintain glass translucency - if it's amber or blue, light should still pass through.
3. No new artifacts or hallucinations.

Output: A photorealistic version with the updated ${targetColor} glass.`
}

// ============================================
// IMAGE PROCESSING UTILITIES
// ============================================

async function fetchImageAsBase64(url) {
  console.log(`   📷 Fetching: ${url}`)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    let imageBuffer = Buffer.from(arrayBuffer)

    // Convert GIF to PNG for Gemini compatibility
    if (url.toLowerCase().endsWith('.gif')) {
      console.log(`   🔄 Converting GIF to PNG...`)
      imageBuffer = await sharp(imageBuffer).png().toBuffer()
    }

    const base64 = imageBuffer.toString('base64')
    console.log(`   ✓ Image ready (${Math.round(imageBuffer.byteLength / 1024)}KB)`)
    return base64
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`)
  }
}

async function uploadToStorage(base64Data, filePath) {
  const buffer = Buffer.from(base64Data, 'base64')

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

// Helper for rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Extract image from Gemini response
function extractImageFromResponse(result) {
  // Gemini 2.0 Flash returns images in the response
  // The exact structure depends on the API version

  for (const part of result.response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data // Base64 encoded image
    }
  }

  throw new Error('No image found in Gemini response')
}

// ============================================
// MAIN PROCESSING FUNCTION
// ============================================

async function processProduct(product) {
  console.log(`\n📦 Processing: ${product.sku}`)
  console.log(`   ${product.product_name}`)
  console.log(`   Shape: ${product.bottle_shape} | Color: ${product.original_color} | ${product.capacity_ml}ml`)

  try {
    // Update status to processing
    await supabase
      .from('product_images')
      .update({
        processing_status: 'processing',
        error_message: null
      })
      .eq('id', product.id)

    // Fetch original image
    const base64Image = await fetchImageAsBase64(product.original_image_url)

    // Initialize Gemini model with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    })

    // ---- STEP 1: Enhance Original Image ----
    console.log('   🔧 Step 1: Enhancing original image...')

    const enhanceResult = await model.generateContent([
      buildEnhancementPrompt(product),
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image
        }
      }
    ])

    let enhancedUrl = null
    try {
      const enhancedBase64 = extractImageFromResponse(enhanceResult)
      enhancedUrl = await uploadToStorage(
        enhancedBase64,
        `enhanced/${product.sku}.png`
      )
      console.log('   ✅ Enhanced image uploaded')
    } catch (e) {
      console.log(`   ⚠️ Enhancement skipped: ${e.message}`)
      // Continue with original image for variations
    }

    // ---- STEP 2: Generate Color Variations ----
    const variationUrls = {}

    if (product.variations_needed?.length > 0) {
      console.log(`   🎨 Step 2: Generating ${product.variations_needed.length} color variations...`)

      for (const targetColor of product.variations_needed) {
        console.log(`      → Creating ${targetColor} variation...`)

        await delay(2000) // Rate limit between API calls

        try {
          const varResult = await model.generateContent([
            buildVariationPrompt(product, targetColor),
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            }
          ])

          const varBase64 = extractImageFromResponse(varResult)
          const varUrl = await uploadToStorage(
            varBase64,
            `variations/${product.sku}-${targetColor}.png`
          )
          variationUrls[targetColor] = varUrl
          console.log(`      ✅ ${targetColor} variation uploaded`)

        } catch (e) {
          console.log(`      ⚠️ ${targetColor} variation failed: ${e.message}`)
          variationUrls[targetColor] = `error: ${e.message}`
        }
      }
    }

    // ---- STEP 3: Update Database ----
    await supabase.from('product_images').update({
      enhanced_image_url: enhancedUrl,
      variation_urls: variationUrls,
      processing_status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', product.id)

    console.log(`✅ Completed: ${product.sku}`)
    return { success: true }

  } catch (error) {
    console.error(`❌ Error: ${product.sku} - ${error.message}`)

    await supabase.from('product_images').update({
      processing_status: 'error',
      error_message: error.message,
      updated_at: new Date().toISOString()
    }).eq('id', product.id)

    return { success: false, error: error.message }
  }
}

// ============================================
// BATCH PROCESSING
// ============================================

async function processBatch(batchSize = 5, testMode = false) {
  console.log('🚀 Best Bottles Image Enhancement Pipeline')
  console.log('='.repeat(50))

  if (testMode) {
    console.log('📝 TEST MODE: Processing single image only\n')
    batchSize = 1
  }

  // Check for required environment variables
  if (!process.env.SUPABASE_URL || !process.env.GEMINI_API_KEY) {
    console.error('\n❌ Missing required environment variables!')
    console.log('Please create a .env file with:')
    console.log('  SUPABASE_URL=your-supabase-url')
    console.log('  SUPABASE_SERVICE_KEY=your-service-key')
    console.log('  GEMINI_API_KEY=your-gemini-key')
    process.exit(1)
  }

  console.log(`\nFetching up to ${batchSize} pending products...\n`)

  const { data: products, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('processing_status', 'pending')
    .limit(batchSize)

  if (error) {
    console.error('Database error:', error.message)
    process.exit(1)
  }

  if (!products.length) {
    console.log('✨ No pending products to process!')
    console.log('\nTo reset products for reprocessing:')
    console.log("UPDATE product_images SET processing_status = 'pending' WHERE processing_status = 'completed';")
    return
  }

  console.log(`Found ${products.length} products to process\n`)
  console.log('─'.repeat(50))

  let completed = 0
  let failed = 0

  for (const product of products) {
    const result = await processProduct(product)

    if (result.success) {
      completed++
    } else {
      failed++
    }

    // Rate limit between products (3 seconds)
    if (products.indexOf(product) < products.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next product...')
      await delay(3000)
    }
  }

  console.log('\n' + '═'.repeat(50))
  console.log('📊 BATCH PROCESSING COMPLETE')
  console.log('═'.repeat(50))
  console.log(`   ✅ Completed: ${completed}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📁 Total: ${products.length}`)
  console.log('═'.repeat(50))
}

// ============================================
// RUN
// ============================================

const isTestMode = process.argv.includes('--test')
const batchSize = isTestMode ? 1 : 100

processBatch(batchSize, isTestMode)
