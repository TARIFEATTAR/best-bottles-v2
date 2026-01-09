
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const inventoryPath = path.resolve('./inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

async function addMissingToSupabase() {
    console.log('--- Adding Missing Products to Supabase Processing Queue ---');

    // We'll target "Empire design" products first as requested
    const targetSkus = [
        'GBEmp100RdcrBlkLthr',
        'GBEmp50RdcrBlkLthr',
        'GBEmp50DrpCu',
        'GBEmp100AnSpBlk',
        'GBEmp100AnSpTslBlk',
        'GBEmp100SpryCu',
        'GBEmp50AnSpBlk',
        'GBEmp50AnSpTslBlk',
        'GBEmp50SpryCu',
        'LBEmp100LtnClOvrCap',
        'LBEmp50LtnClOvrCap'
    ];

    for (const sku of targetSkus) {
        const item = inventory.find((i: any) => i.sku === sku);
        if (!item) {
            console.warn(`  ⚠️ SKU ${sku} not found in inventory.json`);
            continue;
        }

        console.log(`Checking SKU: ${sku}...`);
        const { data: existing } = await supabase
            .from('product_images')
            .select('sku')
            .eq('sku', sku)
            .single();

        if (existing) {
            console.log(`  ✅ ${sku} already in Supabase.`);
            continue;
        }

        console.log(`  ➕ Adding ${sku} to queue...`);
        const { error } = await supabase
            .from('product_images')
            .insert({
                sku: item.sku,
                product_name: item.name,
                original_image_url: item.imageUrl,
                processing_status: 'pending',
                capacity_ml: parseInt(item.capacity) || 0,
                original_color: item.color || 'clear'
            });

        if (error) {
            console.error(`  ❌ Error adding ${sku}:`, error.message);
        } else {
            console.log(`  🎉 Added ${sku} successfully.`);
        }
    }
}

addMissingToSupabase().catch(console.error);
