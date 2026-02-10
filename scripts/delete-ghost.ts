
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const client = createClient({
    projectId: 'gv4os6ef',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_API_TOKEN, // Ensure this is a WRITE token
    useCdn: false,
})

const GHOST_ID = '62669398-411c-4d71-b0fb-920d9563917e'

async function deleteGhost() {
    console.log(`🗑️  Attempting to delete ghost document: ${GHOST_ID}...`)

    try {
        const transaction = client.transaction()
        transaction.delete(GHOST_ID)
        transaction.delete(`drafts.${GHOST_ID}`) // Also delete draft if exists

        await transaction.commit()
        console.log('✨ SUCCESS: Ghost document deleted.')
    } catch (err) {
        console.error('❌ Failed to delete:', err)
    }
}

deleteGhost()
