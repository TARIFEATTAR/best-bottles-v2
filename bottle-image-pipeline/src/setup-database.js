// src/setup-database.js
// Run this script to create the product_images table in Supabase
// Usage: npm run setup-db

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const setupSQL = `
-- Create the main product images table for image enhancement pipeline
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  bottle_shape TEXT,
  original_color TEXT,
  capacity_ml INTEGER,
  cap_type TEXT,
  original_image_url TEXT,
  variations_needed TEXT[],
  
  -- Output URLs
  enhanced_image_url TEXT,
  nobg_image_url TEXT,
  branded_bg_url TEXT,
  variation_urls JSONB DEFAULT '{}',
  
  -- Status tracking
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_status ON product_images(processing_status);
CREATE INDEX IF NOT EXISTS idx_product_images_shape ON product_images(bottle_shape);
CREATE INDEX IF NOT EXISTS idx_product_images_color ON product_images(original_color);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`

async function setupDatabase() {
  console.log('🔧 Setting up database...\n')

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: setupSQL })
    
    if (error) {
      // If RPC doesn't exist, provide manual instructions
      console.log('⚠️  Could not run SQL automatically.')
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n')
      console.log('=' . repeat(60))
      console.log(setupSQL)
      console.log('=' . repeat(60))
      console.log('\n👉 Go to: https://supabase.com/dashboard/project/wtpcreoetjounuatzaub/sql/new')
      return
    }

    console.log('✅ Database tables created successfully!')
    
  } catch (err) {
    console.log('⚠️  Could not run SQL automatically.')
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n')
    console.log('─'.repeat(60))
    console.log(setupSQL)
    console.log('─'.repeat(60))
    console.log('\n👉 Go to: https://supabase.com/dashboard/project/wtpcreoetjounuatzaub/sql/new')
  }
}

// Also export the SQL for reference
export { setupSQL }

setupDatabase()
