
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listTables() {
    console.log('--- Listing Tables in Supabase ---');
    // Supabase doesn't have a direct "list tables" in JS client easily without RPC or standard SQL
    // But we can try to query a few likely names or use the API
    const { data, error } = await supabase.from('item_layers').select('count');
    if (error) console.log('item_layers: Not found or error'); else console.log('item_layers: Exists');

    const { data: data2, error: error2 } = await supabase.from('component_images').select('count');
    if (error2) console.log('component_images: Not found or error'); else console.log('component_images: Exists');

    const { data: data3, error: error3 } = await supabase.from('processed_assets').select('count');
    if (error3) console.log('processed_assets: Not found or error'); else console.log('processed_assets: Exists');
}

listTables().catch(console.error);
