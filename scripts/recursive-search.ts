
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function recursiveSearch(path = '') {
    const { data: items, error } = await supabase.storage.from('bottle-images').list(path, { limit: 100 });
    if (error) {
        console.error(`Error listing ${path}:`, error);
        return;
    }

    for (const item of items) {
        const fullPath = path ? `${path}/${item.name}` : item.name;
        if (item.id === undefined) {
            // It's a folder
            await recursiveSearch(fullPath);
        } else {
            // It's a file
            if (item.name.toLowerCase().includes('emp')) {
                console.log(`✅ FOUND: ${fullPath}`);
            }
        }
    }
}

async function main() {
    console.log('--- Recursive Global Search for "Emp" in bottle-images ---');
    await recursiveSearch();
    console.log('--- Search Complete ---');
}

main().catch(console.error);
