
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function listRecent() {
    console.log('--- Listing 20 Most Recent Files ---');
    const { data, error } = await supabase.storage.from('bottle-images').list('', {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(f => console.log(f.name));
}

listRecent();
