
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findEmpireFolders() {
    console.log('--- Searching for Empire folders in bottle-images/components ---');
    const { data: files, error } = await supabase.storage.from('bottle-images').list('components', { limit: 1000 });
    if (error) {
        console.error('Error:', error);
        return;
    }
    const filtered = files.filter(f => f.name.toLowerCase().includes('emp'));
    console.log('Folders matching "Emp":', filtered.map(f => f.name));

    if (filtered.length > 0) {
        const folder = filtered[0].name;
        console.log(`\n--- Listing contents of ${folder} ---`);
        const { data: subFiles, error: subError } = await supabase.storage.from('bottle-images').list(`components/${folder}`);
        if (subError) {
            console.error('Error:', subError);
        } else {
            console.log('Files:', subFiles.map(f => f.name));
        }
    }
}

findEmpireFolders().catch(console.error);
