/**
 * BEST BOTTLES - Import Local Asset Files
 * 
 * ============================================================
 * PURPOSE: Upload locally created PNG files to Sanity
 * ============================================================
 * 
 * Run this AFTER you've created the isolated component images
 * following the IMAGE_CREATION_GUIDE.md specifications.
 * 
 * USAGE:
 *   SANITY_API_TOKEN=your_token node scripts/import-local-assets.mjs
 * 
 * ============================================================
 */

import { createClient } from '@sanity/client'
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
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || ''

if (!SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN is required')
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_API_TOKEN,
  useCdn: false,
})

// Asset folder path
const ASSETS_DIR = path.join(__dirname, '../assets/components')

// ============================================================
// EXPECTED FILES
// ============================================================

const EXPECTED_BOTTLES = [
  { filename: 'bottle-clear.png', name: 'Clear Glass', color: 'clear', id: 'cyl-9ml-clear' },
  { filename: 'bottle-amber.png', name: 'Amber Glass', color: 'amber', id: 'cyl-9ml-amber' },
  { filename: 'bottle-cobalt-blue.png', name: 'Cobalt Blue Glass', color: 'cobalt blue', id: 'cyl-9ml-blue' },
  { filename: 'bottle-frosted.png', name: 'Frosted Glass', color: 'frosted', id: 'cyl-9ml-frosted' },
  { filename: 'bottle-swirl.png', name: 'Swirl Pattern Glass', color: 'swirl', id: 'cyl-9ml-swirl' },
]

const EXPECTED_CAPS = [
  { filename: 'cap-black-dot.png', name: 'Black Dot', color: '#1a1a1a', id: 'black-dot' },
  { filename: 'cap-gold-matte.png', name: 'Gold Matte', color: '#B8860B', id: 'gold-matte' },
  { filename: 'cap-silver-matte.png', name: 'Silver Matte', color: '#A8A8A8', id: 'silver-matte' },
  { filename: 'cap-white.png', name: 'White', color: '#ffffff', id: 'white' },
  { filename: 'cap-pink-dot.png', name: 'Pink Dot', color: '#FFB6C1', id: 'pink-dot' },
  { filename: 'cap-gold-shiny.png', name: 'Gold Shiny', color: '#D4AF37', id: 'gold-shiny' },
  { filename: 'cap-silver-dot.png', name: 'Silver Dot', color: '#C0C0C0', id: 'silver-dot' },
  { filename: 'cap-silver-shiny.png', name: 'Silver Shiny', color: '#C0C0C0', id: 'silver-shiny' },
]

const EXPECTED_FITMENTS = [
  { filename: 'fitment-metal-roller.png', name: 'Metal Roller Ball', type: 'metal', id: 'metal-roller' },
  { filename: 'fitment-plastic-roller.png', name: 'Plastic Roller Ball', type: 'plastic', id: 'plastic-roller' },
]

// ============================================================
// UPLOAD FUNCTION
// ============================================================

async function uploadLocalFile(filepath, metadata = {}) {
  const filename = path.basename(filepath)
  
  if (!fs.existsSync(filepath)) {
    return { success: false, error: 'File not found', filename }
  }

  console.log(`  📤 Uploading: ${filename}`)
  
  try {
    const buffer = fs.readFileSync(filepath)
    
    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: 'image/png',
      source: {
        id: metadata.id || filename,
        name: 'Best Bottles Local Import',
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
    return { success: false, error: error.message, filename }
  }
}

// ============================================================
// MAIN FUNCTION
// ============================================================

async function importLocalAssets() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  BEST BOTTLES - Import Local Component Images                  ║
╚════════════════════════════════════════════════════════════════╝

📂 Looking for files in: ${ASSETS_DIR}
`)

  const results = {
    bottles: [],
    caps: [],
    fitments: [],
    missing: [],
    errors: [],
  }

  // ────────────────────────────────────────────────────────
  // CHECK WHICH FILES EXIST
  // ────────────────────────────────────────────────────────
  console.log('🔍 Checking for component files...\n')

  const bottlesDir = path.join(ASSETS_DIR, 'bottles')
  const capsDir = path.join(ASSETS_DIR, 'caps')
  const fitmentsDir = path.join(ASSETS_DIR, 'fitments')

  let foundBottles = 0, foundCaps = 0, foundFitments = 0

  // Check bottles
  for (const bottle of EXPECTED_BOTTLES) {
    const filepath = path.join(bottlesDir, bottle.filename)
    if (fs.existsSync(filepath)) {
      foundBottles++
      console.log(`  ✅ Found: bottles/${bottle.filename}`)
    } else {
      results.missing.push(`bottles/${bottle.filename}`)
      console.log(`  ⬜ Missing: bottles/${bottle.filename}`)
    }
  }

  // Check caps
  for (const cap of EXPECTED_CAPS) {
    const filepath = path.join(capsDir, cap.filename)
    if (fs.existsSync(filepath)) {
      foundCaps++
      console.log(`  ✅ Found: caps/${cap.filename}`)
    } else {
      results.missing.push(`caps/${cap.filename}`)
      console.log(`  ⬜ Missing: caps/${cap.filename}`)
    }
  }

  // Check fitments
  for (const fitment of EXPECTED_FITMENTS) {
    const filepath = path.join(fitmentsDir, fitment.filename)
    if (fs.existsSync(filepath)) {
      foundFitments++
      console.log(`  ✅ Found: fitments/${fitment.filename}`)
    } else {
      results.missing.push(`fitments/${fitment.filename}`)
      console.log(`  ⬜ Missing: fitments/${fitment.filename}`)
    }
  }

  console.log(`
📊 Found: ${foundBottles}/5 bottles, ${foundCaps}/8 caps, ${foundFitments}/2 fitments
`)

  if (foundBottles + foundCaps + foundFitments === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  No files found to upload!                                     ║
╠════════════════════════════════════════════════════════════════╣
║  Please create the component images first.                     ║
║  See: assets/IMAGE_CREATION_GUIDE.md                           ║
║                                                                ║
║  Expected location:                                            ║
║    ${ASSETS_DIR}
╚════════════════════════════════════════════════════════════════╝
`)
    return results
  }

  // ────────────────────────────────────────────────────────
  // UPLOAD BOTTLES
  // ────────────────────────────────────────────────────────
  if (foundBottles > 0) {
    console.log('\n📦 UPLOADING BOTTLES')
    console.log('─'.repeat(50))

    for (const bottle of EXPECTED_BOTTLES) {
      const filepath = path.join(bottlesDir, bottle.filename)
      if (!fs.existsSync(filepath)) continue

      console.log(`\n🔵 ${bottle.name}`)
      const result = await uploadLocalFile(filepath, {
        id: bottle.id,
        name: bottle.name,
        color: bottle.color,
        category: 'bottle-base',
        product: '9ml-roll-on',
      })

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
  }

  // ────────────────────────────────────────────────────────
  // UPLOAD CAPS
  // ────────────────────────────────────────────────────────
  if (foundCaps > 0) {
    console.log('\n\n🔘 UPLOADING CAPS')
    console.log('─'.repeat(50))

    for (const cap of EXPECTED_CAPS) {
      const filepath = path.join(capsDir, cap.filename)
      if (!fs.existsSync(filepath)) continue

      console.log(`\n🔘 ${cap.name}`)
      const result = await uploadLocalFile(filepath, {
        id: cap.id,
        name: cap.name,
        color: cap.color,
        category: 'bottle-cap',
      })

      if (result.success) {
        results.caps.push({
          name: cap.name,
          color: cap.color,
          assetId: result.assetId,
          originalId: cap.id,
        })
      } else {
        results.errors.push({ type: 'cap', ...cap, error: result.error })
      }
    }
  }

  // ────────────────────────────────────────────────────────
  // UPLOAD FITMENTS
  // ────────────────────────────────────────────────────────
  if (foundFitments > 0) {
    console.log('\n\n⚙️ UPLOADING FITMENTS')
    console.log('─'.repeat(50))

    for (const fitment of EXPECTED_FITMENTS) {
      const filepath = path.join(fitmentsDir, fitment.filename)
      if (!fs.existsSync(filepath)) continue

      console.log(`\n⚙️ ${fitment.name}`)
      const result = await uploadLocalFile(filepath, {
        id: fitment.id,
        name: fitment.name,
        type: fitment.type,
        category: 'bottle-fitment',
      })

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
  }

  // ────────────────────────────────────────────────────────
  // SAVE MAPPING
  // ────────────────────────────────────────────────────────
  const outputPath = path.join(__dirname, '../asset-mapping-local.json')
  const mapping = {
    generatedAt: new Date().toISOString(),
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    source: 'local-files',
    bottles: results.bottles,
    caps: results.caps,
    fitments: results.fitments,
    missing: results.missing,
    errors: results.errors,
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2))
  console.log(`\n\n💾 Mapping saved to: ${outputPath}`)

  // ────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  IMPORT COMPLETE                                               ║
╠════════════════════════════════════════════════════════════════╣
║  ✅ Bottles uploaded:  ${results.bottles.length}/${EXPECTED_BOTTLES.length}                                   ║
║  ✅ Caps uploaded:     ${results.caps.length}/${EXPECTED_CAPS.length}                                   ║
║  ✅ Fitments uploaded: ${results.fitments.length}/${EXPECTED_FITMENTS.length}                                   ║
║  ⬜ Missing files:     ${results.missing.length}                                     ║
║  ❌ Errors:            ${results.errors.length}                                      ║
╚════════════════════════════════════════════════════════════════╝
`)

  if (results.missing.length > 0) {
    console.log('\n📝 Still need to create:')
    for (const file of results.missing) {
      console.log(`   - ${file}`)
    }
  }

  return results
}

// ============================================================
// RUN
// ============================================================

importLocalAssets()
  .then(() => {
    console.log('\n🎉 Import process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })

