
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countEnhanced() {
    console.log('--- Counting files in bottle-images/enhanced ---');
    let offset = 0;
    const limit = 1000;
    let total = 0;

    while (true) {
        const { data: files, error } = await supabase.storage.from('bottle-images').list('enhanced', { limit, offset });
        if (error) {
            console.error('Error:', error);
            break;
        }
        if (!files || files.length === 0) break;
        total += files.length;
        offset += limit;
        if (files.length < limit) break;
    }

    console.log(`Total enhanced files: ${total}`);
}

countEnhanced().catch(console.error);
