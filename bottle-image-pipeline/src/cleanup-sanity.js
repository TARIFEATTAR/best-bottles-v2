import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01'
});

async function nukeEverything() {
    console.log(`🔥🔥🔥 NUCLEAR WIPE INITIATED 🔥🔥🔥`);
    console.log(`This will delete EVERYTHING except system documents.`);

    // Types to PRESERVE (critical config)
    const preserveTypes = [
        'sanity.imageAsset',  // Keep uploaded images
        'sanity.fileAsset',
        'homepageConfig'      // Keep homepage settings (optional)
    ];

    // Fetch ALL documents except preserved types and system docs (IDs starting with _)
    const query = `*[!(_type in $preserve) && !(_id match "drafts.*") && !(string::startsWith(_id, "_"))]._id`;
    let idsToDelete = await client.fetch(query, { preserve: preserveTypes });

    // Also get drafts (except preserved types)
    const draftQuery = `*[_id match "drafts.*" && !(_type in $preserve)]._id`;
    const draftIds = await client.fetch(draftQuery, { preserve: preserveTypes });

    idsToDelete = [...idsToDelete, ...draftIds];

    if (idsToDelete.length === 0) {
        console.log("✅ Dataset is already pristine!");
        return;
    }

    console.log(`🗑️ Found ${idsToDelete.length} documents to obliterate.`);
    console.log(`   (Preserving: ${preserveTypes.join(', ')})`);

    // Batch delete
    const batchSize = 50;
    let totalDeleted = 0;

    for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        const transaction = client.transaction();
        batch.forEach(id => transaction.delete(id));

        try {
            await transaction.commit();
            totalDeleted += batch.length;
            console.log(`   ...obliterated ${totalDeleted}/${idsToDelete.length}`);
        } catch (e) {
            console.error(`   ⚠️ Batch failed (likely references): ${e.message.substring(0, 100)}...`);
            // Try deleting one by one for this batch
            for (const id of batch) {
                try {
                    await client.delete(id);
                    totalDeleted++;
                } catch (e2) {
                    console.error(`   ❌ Could not delete ${id}`);
                }
            }
        }
    }

    console.log(`\n🔥 NUCLEAR WIPE COMPLETE. Deleted ${totalDeleted} documents.`);
    console.log(`   Your Sanity dataset is now a blank canvas.`);
}

nukeEverything();
