
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listAllUrls() {
    console.log('--- Listing all Original Image URLs in Supabase ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('original_image_url, sku')
        .limit(1000);

    if (error) {
        console.error('Error:', error);
        return;
    }

    records.forEach(r => {
        console.log(`SKU: ${r.sku} | URL: ${r.original_image_url}`);
    });
}

listAllUrls().catch(console.error);
