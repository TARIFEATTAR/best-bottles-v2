
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectFolder() {
    const folder = process.argv[2] || 'GBBell12BlkSht';
    console.log(`--- Listing contents of bottle-images/components/${folder} ---`);
    const { data: files, error } = await supabase.storage.from('bottle-images').list(`components/${folder}`);
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Files:', files.map(f => f.name));
}

inspectFolder().catch(console.error);
