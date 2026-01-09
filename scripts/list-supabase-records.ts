
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listSupabaseRecords() {
    console.log('--- Fetching product_images from Supabase ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('processing_status', 'completed')
        .limit(50);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${records.length} completed records.`);
    console.log(JSON.stringify(records, null, 2));
}

listSupabaseRecords().catch(console.error);
