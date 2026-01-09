
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listAllSupabase() {
    console.log('--- Fetching ALL product_images from Supabase ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('sku, processing_status')
        .limit(1000);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${records.length} records.`);
    const matching = records.filter(r => r.sku.toLowerCase().includes('emp'));
    console.log('Matching "Emp":', matching);
}

listAllSupabase().catch(console.error);
