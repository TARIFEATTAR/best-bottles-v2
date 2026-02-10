
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listFirst100() {
    console.log('--- Listing First 100 Product Images ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('sku, product_name, processing_status')
        .limit(100);

    if (error) {
        console.error('Error:', error);
        return;
    }

    records.forEach(r => {
        console.log(`SKU: ${r.sku} | Name: ${r.product_name} | Status: ${r.processing_status}`);
    });
}

listFirst100().catch(console.error);
