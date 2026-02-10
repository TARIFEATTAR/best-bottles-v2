# Best Bottles Image Enhancement Pipeline

Automated AI-powered image enhancement and color variation generation for Best Bottles product photography.

## 🎯 What This Does

1. **Enhances product images** - Improves lighting, removes imperfections, sharpens details
2. **Generates color variations** - Creates frosted, amber, cobalt, etc. versions from clear glass originals
3. **Processes backgrounds** - Removes backgrounds and adds branded Best Bottles backgrounds
4. **Tracks progress** - Database tracks status of all 2,000+ product images

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (you already have project: `wtpcreoetjounuatzaub`)
- Google AI Studio account (for Gemini API key)
- Optional: Remove.bg API key (for background removal)

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd bottle-image-pipeline
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:

```env
SUPABASE_URL=https://wtpcreoetjounuatzaub.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Your service role key
GEMINI_API_KEY=your-gemini-api-key-here
REMOVE_BG_API_KEY=your-removebg-key-here  # Optional
```

### 3. Set Up Database

Copy this SQL and run it in Supabase SQL Editor:
https://supabase.com/dashboard/project/wtpcreoetjounuatzaub/sql/new

```sql
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
  enhanced_image_url TEXT,
  nobg_image_url TEXT,
  branded_bg_url TEXT,
  variation_urls JSONB DEFAULT '{}',
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_status ON product_images(processing_status);
```

### 4. Create Storage Bucket

In Supabase Dashboard → Storage → Create Bucket:
- Name: `bottle-images`
- Public: Yes

### 5. Import Test Products

```bash
npm run import
```

This imports 20 test products from `data/test-products.csv`

### 6. Run Test Processing

```bash
npm run process:test
```

This processes a single image to verify everything works.

### 7. Run Full Batch

```bash
npm run process
```

Processes 5 images at a time. Run multiple times to continue through the batch.

## 📊 Check Status

```bash
npm run status
```

Shows:
- How many products are pending/processing/completed/error
- Recent completions
- Any errors
- Sample output URLs

## 🎨 Process Backgrounds (Optional)

After images are enhanced, you can add branded backgrounds:

```bash
npm run backgrounds
```

## 💰 Cost Estimate

For 20 test images:
- Gemini API: ~$0.60 (enhance + 2-3 variations each)
- Remove.bg: ~$1.80 (optional, for background removal)
- **Total: ~$0.60 - $2.40**

For full 2,000 images:
- Gemini API: ~$60
- Remove.bg: ~$180 (optional)
- **Total: ~$60 - $240**

## 📁 File Structure

```
bottle-image-pipeline/
├── data/
│   └── test-products.csv    # 20 test products
├── src/
│   ├── setup-database.js    # Database table creation
│   ├── import-data.js       # CSV to Supabase import
│   ├── process-images.js    # Main AI processing
│   ├── process-backgrounds.js # Background removal
│   └── check-status.js      # Progress monitoring
├── .env                     # Your API keys (create from .env.example)
├── .env.example             # Template
├── package.json
└── README.md
```

## 🔧 Commands Reference

| Command | Description |
|---------|-------------|
| `npm run import` | Import products from CSV to database |
| `npm run process:test` | Process single image (test mode) |
| `npm run process` | Process batch of 5 images |
| `npm run backgrounds` | Add branded backgrounds |
| `npm run status` | Check processing progress |
| `npm run status GBCyl9MtlRollBlkDot` | Show details for specific SKU |

## 🛠️ Troubleshooting

**"Cannot find module" errors**
```bash
npm install
```

**Gemini API errors**
- Check your GEMINI_API_KEY is correct
- Ensure you have Gemini 2.0 Flash access
- Check rate limits (add longer delays if needed)

**Image fetch failures**
- Some Best Bottles URLs use .gif format
- Check if the original URL is accessible

**Database errors**
- Verify your Supabase credentials
- Make sure the table exists
- Check storage bucket is created and public

## 📝 CSV Format

To add more products, follow this CSV format:

```csv
sku,product_name,bottle_shape,original_color,capacity_ml,cap_type,original_image_url,variations_needed
GBCyl9MtlRollBlkDot,9ml Cylinder Roll-On,cylinder,clear,9,metal_roll,https://...,frosted;amber;cobalt
```

## 🚨 Important Notes

1. **Test first** - Always run `npm run process:test` before processing large batches
2. **Rate limits** - The script includes delays to avoid API rate limits
3. **Check quality** - Review processed images before running full batch
4. **Costs** - Monitor your API usage to avoid unexpected charges

## 📞 Support

For issues with this pipeline, check:
1. API keys are correctly set in `.env`
2. Supabase table and storage bucket exist
3. Network connectivity to Best Bottles image URLs
