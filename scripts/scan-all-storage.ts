
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function scanAllStorage() {
    console.log('--- Scanning all folders in bottle-images/components ---');
    let offset = 0;
    const limit = 1000;
    let total = 0;

    while (true) {
        const { data: files, error } = await supabase.storage.from('bottle-images').list('components', { limit, offset });
        if (error) {
            console.error('Error:', error);
            break;
        }
        if (!files || files.length === 0) break;

        console.log(`Scanning batch at offset ${offset}... (found ${files.length} items)`);
        for (const f of files) {
            if (f.name.toLowerCase().includes('emp')) {
                console.log(`✅ MATCH: ${f.name}`);
            }
        }

        total += files.length;
        offset += limit;
        if (files.length < limit) break;
    }

    console.log(`Scan complete. Found ${total} items total.`);
}

scanAllStorage().catch(console.error);
