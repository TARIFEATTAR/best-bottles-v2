
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

const GHOST_ID = '62669398-411c-4d71-b0fb-920d9563917e'

async function inspectGhost() {
    console.log(`👻 Hunting for ghost document: ${GHOST_ID}...`)

    // Try to fetch it directly
    const doc = await client.getDocument(GHOST_ID)

    if (doc) {
        console.log('✅ FOUND IT!')
        console.log('Type:', doc._type)
        console.log('Title:', (doc as any).title || (doc as any).name || 'No title')
        console.log('Full Document:', doc)
    } else {
        // Check if it's a draft
        const draftDoc = await client.getDocument(`drafts.${GHOST_ID}`)
        if (draftDoc) {
            console.log('✅ FOUND IT (It is a DRAFT)!')
            console.log('Type:', draftDoc._type)
            console.log('Title:', (draftDoc as any).title || (draftDoc as any).name)
        } else {
            console.log('❌ Could not find document with that ID.')
        }
    }
}

inspectGhost()
