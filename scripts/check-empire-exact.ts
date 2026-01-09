
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wtpcreoetjounuatzaub.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findEmpireExact() {
    const sku = 'GBEmp50AnSpBlk';
    console.log(`--- Checking for exact folder: bottle-images/components/${sku} ---`);
    const { data: files, error } = await supabase.storage.from('bottle-images').list(`components/${sku}`);
    if (error) {
        console.warn('Error or Folder not found:', error);
    } else if (files && files.length > 0) {
        console.log(`✅ Found folder ${sku} with files:`, files.map(f => f.name));
    } else {
        console.log(`❌ Folder ${sku} not found or empty.`);
    }
}

findEmpireExact().catch(console.error);
