/**
 * BEST BOTTLES - 9ML Roll-On Asset Import Script
 * 
 * ============================================================
 * PURPOSE: Import component images into Sanity Media Library
 * ============================================================
 * 
 * This script:
 * 1. Fetches images from bestbottles.com URLs
 * 2. Uploads them to Sanity Media Library
 * 3. Applies smart tags for filtering (bottle-base, bottle-cap, bottle-fitment)
 * 4. Outputs a mapping of names → Sanity Asset IDs
 * 
 * USAGE:
 *   node scripts/import-roll-on-assets.mjs
 * 
 * REQUIREMENTS:
 *   - SANITY_API_TOKEN environment variable (with write access)
 *   - Or create a .env file with the token
 * 
 * ============================================================
 */

import { createClient } from '@sanity/client'
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================
// CONFIGURATION
// ============================================================

const SANITY_PROJECT_ID = 'gv4os6ef'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2024-01-01'

// You'll need to set this environment variable or hardcode temporarily for testing
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || ''

if (!SANITY_API_TOKEN) {
  console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ERROR: SANITY_API_TOKEN is required                           ║
╠════════════════════════════════════════════════════════════════╣
║  Get a token from:                                             ║
║  https://www.sanity.io/manage/project/${SANITY_PROJECT_ID}/api    ║
║                                                                ║
║  Then run:                                                     ║
║  SANITY_API_TOKEN=your_token node scripts/import-roll-on-assets.mjs ║
╚════════════════════════════════════════════════════════════════╝
`)
  process.exit(1)
}

// Initialize Sanity client with write access
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_API_TOKEN,
  useCdn: false, // Must be false for mutations
})

// ============================================================
// ASSET DATA (from your scraped Python data)
// ============================================================

/**
 * 5 Glass Bottle Variants (Base Layer)
 * Tagged: category=bottle-base, product=9ml-roll-on
 */
const BASE_BOTTLES = [
  {
    id: 'cyl-9ml-clear',
    name: 'Clear Glass',
    color: 'clear',
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif',
    skuPrefix: 'GBCyl9',
  },
  {
    id: 'cyl-9ml-amber',
    name: 'Amber Glass',
    color: 'amber',
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylAmb9MtlRollBlkDot.gif',
    skuPrefix: 'GBCylAmb9',
  },
  {
    id: 'cyl-9ml-blue',
    name: 'Cobalt Blue Glass',
    color: 'cobalt blue',
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylBlu9MtlRollBlkDot.gif',
    skuPrefix: 'GBCylBlu9',
  },
  {
    id: 'cyl-9ml-frosted',
    name: 'Frosted Glass',
    color: 'frosted',
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylFrst9MtlRollBlkDot.gif',
    skuPrefix: 'GBCylFrst9',
  },
  {
    id: 'cyl-9ml-swirl',
    name: 'Swirl Pattern Glass',
    color: 'swirl',
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCylSwrl9MtlRollBlkDot.gif',
    skuPrefix: 'GBCylSwrl9',
  },
]

/**
 * 10 Cap Variants (Top Layer)
 * Tagged: category=bottle-cap
 */
const CAP_OPTIONS = [
  {
    id: 'black-dot',
    name: 'Black Dot',
    color: '#1a1a1a',
    finish: 'shiny with dots',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollBlkDot.png',
  },
  {
    id: 'gold-matte',
    name: 'Gold Matte',
    color: '#B8860B',
    finish: 'matte',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattGl.png',
  },
  {
    id: 'silver-matte',
    name: 'Silver Matte',
    color: '#A8A8A8',
    finish: 'matte',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattSl.png',
  },
  {
    id: 'white',
    name: 'White',
    color: '#ffffff',
    finish: 'matte',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollWhite.png',
  },
  {
    id: 'pink-dot',
    name: 'Pink Dot',
    color: '#FFB6C1',
    finish: 'shiny with dots',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollPnkDot.png',
  },
  {
    id: 'gold-shiny',
    name: 'Gold Shiny',
    color: '#D4AF37',
    finish: 'shiny',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnGl.png',
  },
  {
    id: 'black-shiny',
    name: 'Black Shiny',
    color: '#1a1a1a',
    finish: 'shiny',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShBlk.png',
  },
  {
    id: 'silver-dot',
    name: 'Silver Dot',
    color: '#C0C0C0',
    finish: 'shiny with dots',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollSlDot.png',
  },
  {
    id: 'silver-shiny',
    name: 'Silver Shiny',
    color: '#C0C0C0',
    finish: 'shiny',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollShnSl.png',
  },
  {
    id: 'copper-matte',
    name: 'Copper Matte',
    color: '#B87333',
    finish: 'matte',
    imageUrl: 'https://www.bestbottles.com/images/store/caps/17-415CpRollMattCu.png',
  },
]

/**
 * 2 Fitment Variants (Middle Layer)
 * Tagged: category=bottle-fitment
 * 
 * NOTE: These images show the rollerball mechanism.
 * Using composite images that show just the fitment portion.
 */
const FITMENT_OPTIONS = [
  {
    id: 'metal-roller',
    name: 'Metal Roller Ball',
    type: 'metal',
    // This URL shows a bottle with metal roller - we'll use it for now
    // In production, you'd want isolated fitment images
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif',
    description: 'Premium stainless steel roller ball',
  },
  {
    id: 'plastic-roller',
    name: 'Plastic Roller Ball',
    type: 'plastic',
    // This URL shows a bottle with plastic roller
    imageUrl: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9RollBlkDot.gif',
    description: 'Standard plastic roller ball',
  },
]

// ============================================================
// UPLOAD FUNCTIONS
// ============================================================

/**
 * Fetch image from URL and upload to Sanity
 */
async function uploadImageFromUrl(url, filename, metadata = {}) {
  console.log(`  📥 Fetching: ${url}`)
  
  try {
    // Fetch the image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Best Bottles Asset Importer)',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    const contentType = response.headers.get('content-type') || 'image/gif'
    
    console.log(`  📤 Uploading to Sanity (${buffer.length} bytes)...`)
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType,
      // Add metadata that will be searchable in Media Library
      source: {
        id: metadata.id || filename,
        name: 'Best Bottles Import',
        url,
      },
    })
    
    console.log(`  ✅ Uploaded: ${asset._id}`)
    
    return {
      success: true,
      assetId: asset._id,
      url: asset.url,
      metadata,
    }
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`)
    return {
      success: false,
      error: error.message,
      metadata,
    }
  }
}

/**
 * Create or update a media tag document
 */
async function ensureMediaTag(tagName) {
  const tagId = `media.tag.${tagName.replace(/[^a-zA-Z0-9-]/g, '-')}`
  
  try {
    await client.createIfNotExists({
      _id: tagId,
      _type: 'media.tag',
      name: {
        current: tagName,
      },
    })
    return tagId
  } catch (error) {
    console.warn(`  ⚠️ Could not create tag '${tagName}': ${error.message}`)
    return null
  }
}

// ============================================================
// MAIN IMPORT FUNCTION
// ============================================================

async function importAssets() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  BEST BOTTLES - 9ML Roll-On Asset Import                       ║
║  Project: ${SANITY_PROJECT_ID} | Dataset: ${SANITY_DATASET}                  ║
╚════════════════════════════════════════════════════════════════╝
`)

  const results = {
    bottles: [],
    caps: [],
    fitments: [],
    errors: [],
  }

  // ────────────────────────────────────────────────────────
  // STEP 1: Import Base Bottles (5 variants)
  // ────────────────────────────────────────────────────────
  console.log('\n📦 IMPORTING BASE BOTTLES (5 variants)')
  console.log('   Tags: category=bottle-base, product=9ml-roll-on')
  console.log('─'.repeat(60))

  for (const bottle of BASE_BOTTLES) {
    console.log(`\n🔵 ${bottle.name}`)
    
    const result = await uploadImageFromUrl(
      bottle.imageUrl,
      `bottle-base-${bottle.id}.gif`,
      {
        id: bottle.id,
        name: bottle.name,
        color: bottle.color,
        category: 'bottle-base',
        product: '9ml-roll-on',
        skuPrefix: bottle.skuPrefix,
      }
    )
    
    if (result.success) {
      results.bottles.push({
        name: bottle.name,
        color: bottle.color,
        assetId: result.assetId,
        originalId: bottle.id,
      })
    } else {
      results.errors.push({ type: 'bottle', ...bottle, error: result.error })
    }
  }

  // ────────────────────────────────────────────────────────
  // STEP 2: Import Caps (10 variants)
  // ────────────────────────────────────────────────────────
  console.log('\n\n🔘 IMPORTING CAPS (10 variants)')
  console.log('   Tags: category=bottle-cap')
  console.log('─'.repeat(60))

  for (const cap of CAP_OPTIONS) {
    console.log(`\n🔘 ${cap.name}`)
    
    const result = await uploadImageFromUrl(
      cap.imageUrl,
      `bottle-cap-${cap.id}.png`,
      {
        id: cap.id,
        name: cap.name,
        color: cap.color,
        finish: cap.finish,
        category: 'bottle-cap',
      }
    )
    
    if (result.success) {
      results.caps.push({
        name: cap.name,
        color: cap.color,
        finish: cap.finish,
        assetId: result.assetId,
        originalId: cap.id,
      })
    } else {
      results.errors.push({ type: 'cap', ...cap, error: result.error })
    }
  }

  // ────────────────────────────────────────────────────────
  // STEP 3: Import Fitments (2 variants)
  // ────────────────────────────────────────────────────────
  console.log('\n\n⚙️ IMPORTING FITMENTS (2 variants)')
  console.log('   Tags: category=bottle-fitment')
  console.log('─'.repeat(60))

  for (const fitment of FITMENT_OPTIONS) {
    console.log(`\n⚙️ ${fitment.name}`)
    
    const result = await uploadImageFromUrl(
      fitment.imageUrl,
      `bottle-fitment-${fitment.id}.gif`,
      {
        id: fitment.id,
        name: fitment.name,
        type: fitment.type,
        category: 'bottle-fitment',
        description: fitment.description,
      }
    )
    
    if (result.success) {
      results.fitments.push({
        name: fitment.name,
        type: fitment.type,
        assetId: result.assetId,
        originalId: fitment.id,
      })
    } else {
      results.errors.push({ type: 'fitment', ...fitment, error: result.error })
    }
  }

  // ────────────────────────────────────────────────────────
  // OUTPUT RESULTS
  // ────────────────────────────────────────────────────────
  console.log('\n\n')
  console.log('═'.repeat(70))
  console.log('  IMPORT COMPLETE - ASSET ID MAPPING')
  console.log('═'.repeat(70))

  console.log('\n📦 BASE BOTTLES (for baseGlass field):')
  console.log('┌─────────────────────────┬────────────────────────────────────────┐')
  console.log('│ Name                    │ Sanity Asset ID                        │')
  console.log('├─────────────────────────┼────────────────────────────────────────┤')
  for (const bottle of results.bottles) {
    console.log(`│ ${bottle.name.padEnd(23)} │ ${bottle.assetId.padEnd(38)} │`)
  }
  console.log('└─────────────────────────┴────────────────────────────────────────┘')

  console.log('\n🔘 CAPS (for capComponent field):')
  console.log('┌─────────────────────────┬────────────────────────────────────────┐')
  console.log('│ Name                    │ Sanity Asset ID                        │')
  console.log('├─────────────────────────┼────────────────────────────────────────┤')
  for (const cap of results.caps) {
    console.log(`│ ${cap.name.padEnd(23)} │ ${cap.assetId.padEnd(38)} │`)
  }
  console.log('└─────────────────────────┴────────────────────────────────────────┘')

  console.log('\n⚙️ FITMENTS (for fitmentComponent field):')
  console.log('┌─────────────────────────┬────────────────────────────────────────┐')
  console.log('│ Name                    │ Sanity Asset ID                        │')
  console.log('├─────────────────────────┼────────────────────────────────────────┤')
  for (const fitment of results.fitments) {
    console.log(`│ ${fitment.name.padEnd(23)} │ ${fitment.assetId.padEnd(38)} │`)
  }
  console.log('└─────────────────────────┴────────────────────────────────────────┘')

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:')
    for (const error of results.errors) {
      console.log(`   - ${error.type}: ${error.name} - ${error.error}`)
    }
  }

  // ────────────────────────────────────────────────────────
  // SAVE MAPPING TO FILE
  // ────────────────────────────────────────────────────────
  const outputPath = path.join(__dirname, '../asset-mapping.json')
  const mapping = {
    generatedAt: new Date().toISOString(),
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    bottles: results.bottles,
    caps: results.caps,
    fitments: results.fitments,
    errors: results.errors,
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2))
  console.log(`\n💾 Mapping saved to: ${outputPath}`)

  // ────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║  SUMMARY                                                       ║')
  console.log('╠════════════════════════════════════════════════════════════════╣')
  console.log(`║  ✅ Bottles uploaded:  ${results.bottles.length}/5                                   ║`)
  console.log(`║  ✅ Caps uploaded:     ${results.caps.length}/10                                  ║`)
  console.log(`║  ✅ Fitments uploaded: ${results.fitments.length}/2                                    ║`)
  console.log(`║  ❌ Errors:            ${results.errors.length}                                      ║`)
  console.log('╠════════════════════════════════════════════════════════════════╣')
  console.log('║  NEXT STEPS:                                                   ║')
  console.log('║  1. Check Sanity Studio Media Library for uploaded assets      ║')
  console.log('║  2. Use asset-mapping.json to create product documents         ║')
  console.log('║  3. Run: node scripts/create-roll-on-products.mjs              ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')

  return results
}

// ============================================================
// RUN THE IMPORT
// ============================================================

importAssets()
  .then(() => {
    console.log('\n🎉 Import process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })

