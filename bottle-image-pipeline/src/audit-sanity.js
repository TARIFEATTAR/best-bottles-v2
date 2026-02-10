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

async function auditSanity() {
    console.log(`🔍 Auditing Sanity Dataset: ${process.env.SANITY_DATASET}...`);

    // Count our new documents by ID prefix
    const counts = await client.fetch(`{
        "totalGlass": count(*[_type == "glassOption" && _id match "glass-*"]),
        "totalCaps": count(*[_type == "capOption" && _id match "cap-*"]),
        "totalFitments": count(*[_type == "fitmentVariant" && _id match "fitment-*"]),
        "sampleIDs": *[_id match "cap-*"][0...10]._id
    }`);

    console.log(`\n📊 New Documents Found:`);
    console.log(`   - Glass Options:    ${counts.totalGlass}`);
    console.log(`   - Cap Options:      ${counts.totalCaps}`);
    console.log(`   - Fitment Variants: ${counts.totalFitments}`);

    console.log(`\n🆔 Sample IDs in Sanity:`);
    counts.sampleIDs.forEach(id => console.log(`   - ${id}`));

    if (counts.totalCaps === 0) {
        console.log(`\n❌ ERROR: Your new documents are missing!`);
        console.log(`   Check if your .env PROJECT_ID and DATASET match your Studio.`);
    } else if (counts.totalCaps < 27) {
        console.log(`\n⚠️ WARNING: Only ${counts.totalCaps}/27 SKUs found. Sync may have been partial.`);
    } else {
        console.log(`\n✅ ALL 27 SKUs ARE THERE! (Total Docs: ${counts.totalGlass + counts.totalCaps + counts.totalFitments})`);
    }
}

auditSanity();
