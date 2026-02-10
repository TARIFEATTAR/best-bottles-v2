
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function detailSlim() {
    console.log('--- Detail for GBSlm50AnSpBlk ---');
    const { data: record, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('sku', 'GBSlm50AnSpBlk')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(record, null, 2));
}

detailSlim().catch(console.error);
