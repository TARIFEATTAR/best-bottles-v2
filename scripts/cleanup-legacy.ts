
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN || process.env.VITE_SANITY_API_TOKEN,
    // NOTE: You need a write token for this. If VITE_SANITY_API_TOKEN is not set or read-only, this will fail.
    useCdn: false,
})

async function cleanupLegacyData() {
    console.log('🔍 Scanning for legacy "Roller" glass options...')

    // Find all glassOptions with "Roller" in the name (Legacy combo pattern)
    const legacyDocs = await client.fetch(`
    *[_type == "glassOption" && name match "*Roller*"]{
      _id,
      name
    }
  `)

    console.log(`Found ${legacyDocs.length} legacy documents:`)
    legacyDocs.forEach((doc: any) => console.log(` - ${doc.name} (${doc._id})`))

    if (legacyDocs.length === 0) {
        console.log('✅ No legacy data found.')
        return
    }

    // To enable actual deletion, uncomment the lines below
    /*
    console.log('\n🗑️  Deleting documents...')
    const transaction = client.transaction()
    legacyDocs.forEach((doc: any) => {
      transaction.delete(doc._id)
      transaction.delete(`drafts.${doc._id}`) // Ensure draft is gone too
    })
    
    await transaction.commit()
    console.log('✨ Cleanup complete!')
    */
    console.log('\n⚠️  Run this script with the deletion code uncommented to actually delete them.')
}

cleanupLegacyData().catch(console.error)
