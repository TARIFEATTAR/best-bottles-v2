
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findEmpireByImageUrl() {
    console.log('--- Searching for Empire by Image URL in Supabase ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('*')
        .ilike('original_image_url', '%Emp%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${records.length} records matching "Emp" in URL.`);
    console.log(JSON.stringify(records, null, 2));
}

findEmpireByImageUrl().catch(console.error);
