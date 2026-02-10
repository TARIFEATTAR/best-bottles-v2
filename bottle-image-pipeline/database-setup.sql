-- Best Bottles Image Enhancement Pipeline
-- Database Setup Script
-- 
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wtpcreoetjounuatzaub/sql/new

-- ===========================================
-- PRODUCT IMAGES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Information
  sku TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  bottle_shape TEXT,           -- cylinder, square, royal, tulip, boston_round, slim, apothecary, atomizer
  original_color TEXT,         -- clear, amber, cobalt, frosted, blue, green, gold
  capacity_ml INTEGER,         -- 6, 9, 10, 13, 15, 30, 50, etc.
  cap_type TEXT,               -- metal_roll, spray_black, pump_black, screw_black, glass_stopper
  original_image_url TEXT,     -- Source image URL from bestbottles.com
  variations_needed TEXT[],    -- Array of colors to generate: ['frosted', 'amber', 'cobalt']
  
  -- Output URLs (populated by processing pipeline)
  enhanced_image_url TEXT,     -- AI-enhanced version of original
  nobg_image_url TEXT,         -- Background removed (transparent PNG)
  branded_bg_url TEXT,         -- With Best Bottles branded background
  variation_urls JSONB DEFAULT '{}',  -- {"frosted": "url", "amber": "url", ...}
  
  -- Processing Status
  processing_status TEXT DEFAULT 'pending',  -- pending, processing, completed, error
  error_message TEXT,          -- Error details if processing failed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_product_images_status 
  ON product_images(processing_status);

CREATE INDEX IF NOT EXISTS idx_product_images_shape 
  ON product_images(bottle_shape);

CREATE INDEX IF NOT EXISTS idx_product_images_color 
  ON product_images(original_color);

CREATE INDEX IF NOT EXISTS idx_product_images_sku 
  ON product_images(sku);

-- ===========================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_product_images_updated_at ON product_images;
CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- HELPER VIEWS
-- ===========================================

-- View to see processing progress
CREATE OR REPLACE VIEW processing_summary AS
SELECT 
  processing_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM product_images
GROUP BY processing_status
ORDER BY 
  CASE processing_status 
    WHEN 'pending' THEN 1 
    WHEN 'processing' THEN 2 
    WHEN 'completed' THEN 3 
    WHEN 'error' THEN 4 
  END;

-- View to see products that need processing
CREATE OR REPLACE VIEW pending_products AS
SELECT sku, product_name, bottle_shape, original_color, capacity_ml
FROM product_images
WHERE processing_status = 'pending'
ORDER BY created_at;

-- View to see completed products with their output URLs
CREATE OR REPLACE VIEW completed_products AS
SELECT 
  sku, 
  product_name,
  original_image_url,
  enhanced_image_url,
  branded_bg_url,
  variation_urls
FROM product_images
WHERE processing_status = 'completed'
ORDER BY updated_at DESC;

-- ===========================================
-- VERIFICATION
-- ===========================================

-- Check that table was created
SELECT 
  'product_images table created successfully!' as status,
  (SELECT COUNT(*) FROM product_images) as current_rows;
