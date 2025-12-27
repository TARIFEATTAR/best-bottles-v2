
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

async function auditTypes() {
    console.log('🔍 Auditing Document Types...')

    // Count documents by type
    const counts = await client.fetch(`
    count(*[_type == "bottleModel"])
  `)

    // Get a list of ALL types in use
    const allTypes = await client.fetch(`
    *[_id in path("drafts.**") == false]._type
  `)

    const typeCounts: Record<string, number> = {}
    allTypes.forEach((t: string) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1
    })

    console.log('\n📊 Database Inventory:')
    console.table(typeCounts)

    // Specific check for the legacy types we know about
    const legacyChecks = ['bottleModel', 'rollerOption'] // Add any other suspected legacy types

    console.log('\n👻 Legacy Ghost Check:')
    for (const type of legacyChecks) {
        console.log(` - ${type}: ${typeCounts[type] || 0} documents found`)
    }
}

auditTypes().catch(console.error)
