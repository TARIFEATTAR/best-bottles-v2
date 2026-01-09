
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listSupabaseBuckets() {
    console.log('--- Listing Supabase Buckets ---');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Buckets:', buckets.map(b => b.name));

    for (const bucket of buckets) {
        console.log(`\n--- Listing files in ${bucket.name} ---`);
        const { data: files, error: fileError } = await supabase.storage.from(bucket.name).list('', { limit: 20 });
        if (fileError) {
            console.error(`Error listing ${bucket.name}:`, fileError);
            continue;
        }
        console.log(`Files in ${bucket.name}:`, files.map(f => f.name));
    }
}

listSupabaseBuckets().catch(console.error);
