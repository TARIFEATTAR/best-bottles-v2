
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listAllProductImageSKUs() {
    console.log('--- Listing Product Image SKUs ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('sku, processing_status, product_name')
        .order('sku');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${records.length} records.`);
    records.forEach(r => {
        console.log(`SKU: ${r.sku} | Status: ${r.processing_status} | Name: ${r.product_name}`);
    });
}

listAllProductImageSKUs().catch(console.error);
