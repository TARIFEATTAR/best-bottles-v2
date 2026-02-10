
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_API_TOKEN,
    useCdn: false,
})

async function auditIds() {
    console.log('🔍 Auditing Document IDs...')

    // Fetch ALL IDs and Types
    const docs = await client.fetch(`
    *[_type in ["product", "glassOption", "capOption", "fitmentVariant"]] {
      _id,
      _type,
      title,
      name
    }
  `)

    console.log(`Found ${docs.length} documents. Checking IDs...`)

    let hasIssue = false
    for (const doc of docs) {
        const id = doc._id
        if (id === 'drafts' || id === 'published' || id.includes(' ')) {
            console.error(`❌ BAD ID FOUND: "${id}" (Type: ${doc._type})`)
            hasIssue = true
        }
        if (!id.startsWith('drafts.') && id.includes('.')) {
            // Sanity IDs usually don't have dots unless they are drafts or paths
            console.warn(`⚠️ Unusual ID: "${id}" (Type: ${doc._type})`)
        }
    }

    if (!hasIssue) {
        console.log('✅ No obviously malformed "keyword" IDs found.')
    }
}

auditIds().catch(console.error)
