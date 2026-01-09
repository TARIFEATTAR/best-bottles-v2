
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findEmpireDeep() {
    console.log('--- Deep Search for Empire in bottle-images/components ---');
    let allFiles = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const { data: files, error } = await supabase.storage.from('bottle-images').list('components', { limit, offset });
        if (error) {
            console.error('Error:', error);
            break;
        }
        if (files.length === 0) break;

        const filtered = files.filter(f => f.name.toLowerCase().includes('emp'));
        if (filtered.length > 0) {
            console.log('Found matching folders:', filtered.map(f => f.name));
            allFiles.push(...filtered);
        }

        offset += limit;
        if (offset > 2000) break; // Safety
    }

    console.log(`Finished search. Total matching folders found: ${allFiles.length}`);
}

findEmpireDeep().catch(console.error);
