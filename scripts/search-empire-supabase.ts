
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findEmpireInSupabase() {
    console.log('--- Searching for Empire in Supabase ---');
    const { data: records, error } = await supabase
        .from('product_images')
        .select('*')
        .ilike('sku', '%Emp%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${records.length} records matching "Emp".`);
    console.log(JSON.stringify(records, null, 2));
}

findEmpireInSupabase().catch(console.error);
