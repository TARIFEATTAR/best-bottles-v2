# Best Bottles - Exploded View Image Creation Guide

## Canvas Specifications

All component images must use the **same canvas size** for proper stacking:

```
┌────────────────────────────────────────┐
│         Canvas: 1024 × 1024 px         │
│         Resolution: 72 DPI             │
│         Format: PNG-24 (transparent)   │
│         Color Mode: RGB                │
└────────────────────────────────────────┘
```

### Why 1024 × 1024?
- ✅ High enough resolution for sharp display on all devices
- ✅ Square format works well for product imagery
- ✅ Matches your existing Gemini-generated images
- ✅ Can be scaled down for web without quality loss
- ✅ Not too large (keeps file sizes reasonable)

---

## Layer Zones (1024 × 1024 px canvas)

```
┌────────────────────────────────────────────────┐  ← Y: 0px
│                                                │
│                                                │
│        ┌──────────────────────────┐            │  ← CAP ZONE
│        │     Cap sits here        │            │     Y: 50-180px
│        │     (~200px wide)        │            │
│        └──────────────────────────┘            │
│                                                │
│               ┌────────┐                       │  ← FITMENT ZONE
│               │  (●)   │                       │     Y: 200-320px
│               └────────┘                       │     (roller ball)
│                                                │
│           ┌────────────────┐                   │
│           │                │                   │
│           │                │                   │
│           │     GLASS      │                   │  ← GLASS ZONE
│           │     BODY       │                   │     Y: 280-950px
│           │                │                   │
│           │                │                   │
│           │                │                   │
│           └────────────────┘                   │
│                                                │
└────────────────────────────────────────────────┘  ← Y: 1024px
```

---

## Component Specifications

### 🔵 Glass Body (Layer 1 - Z-Index 1)

| Property | Value |
|----------|-------|
| Canvas | 1024 × 1024 px |
| Position | Bottom-aligned, centered horizontally |
| Content | Glass bottle body ONLY (no cap, no fitment) |
| Background | Transparent |
| Export | PNG-24 |

**Photoshop Steps:**
1. Open source bottle image
2. Select cap and roller ball area
3. Delete (make transparent)
4. Ensure canvas is 360 × 480
5. File → Export → Export As → PNG

**Files to Create:**
- `bottle-clear.png`
- `bottle-amber.png`
- `bottle-cobalt-blue.png`
- `bottle-frosted.png`
- `bottle-swirl.png`

---

### ⚙️ Fitment / Roller Ball (Layer 2 - Z-Index 2)

| Property | Value |
|----------|-------|
| Canvas | 1024 × 1024 px |
| Position | Centered at neck area (~Y: 200-320px) |
| Content | Roller ball mechanism ONLY |
| Background | Transparent |
| Export | PNG-24 |

**Photoshop Steps:**
1. Open source bottle image
2. Zoom into neck area
3. Carefully select ONLY the roller ball
4. Copy to new 360×480 canvas
5. Position where it would sit on the bottle neck
6. Export as PNG

**Files to Create:**
- `fitment-metal-roller.png`
- `fitment-plastic-roller.png`

---

### 🔘 Cap (Layer 3 - Z-Index 3)

| Property | Value |
|----------|-------|
| Canvas | 1024 × 1024 px |
| Position | Top-aligned (~Y: 50-180px), centered horizontally |
| Content | Cap ONLY |
| Size | ~200px wide × ~120px tall |
| Background | Transparent |
| Export | PNG-24 |

**Illustrator Steps (Recreate for better resolution):**
1. New document: 1024 × 1024 px
2. Draw cap shape using reference images
3. Apply correct colors/finishes:
   - Black Dot: #1a1a1a with dot pattern
   - Gold Matte: #B8860B matte finish
   - Silver Matte: #A8A8A8 matte finish
   - White: #FFFFFF
   - Pink Dot: #FFB6C1 with dot pattern
   - Gold Shiny: #D4AF37 with shine
   - Silver Dot: #C0C0C0 with dot pattern
   - Silver Shiny: #C0C0C0 with shine
4. Position cap at TOP of canvas
5. File → Export → Export As → PNG

**Files to Create:**
- `cap-black-dot.png`
- `cap-gold-matte.png`
- `cap-silver-matte.png`
- `cap-white.png`
- `cap-pink-dot.png`
- `cap-gold-shiny.png`
- `cap-silver-dot.png`
- `cap-silver-shiny.png`

---

## Quality Checklist

Before uploading to Sanity, verify each image:

- [ ] Canvas is exactly 1024 × 1024 px
- [ ] Background is fully transparent (checkerboard in Photoshop)
- [ ] Component is centered horizontally
- [ ] Component is in correct vertical zone
- [ ] No stray pixels or artifacts
- [ ] File is PNG-24 format
- [ ] File size is reasonable (< 500KB per image)

---

## Testing Stack Alignment

After creating all images:

1. Open all 3 layers in Photoshop (glass, fitment, cap)
2. Stack them in one document
3. Set blend mode to Normal
4. Verify they align to form a complete bottle
5. If aligned correctly, they'll work in Sanity!

```
┌─────────────────────────────────────┐
│         Expected Result:            │
│                                     │
│           ┌───────┐                 │
│           │  CAP  │ ← Layer 3       │
│           ├───────┤                 │
│           │  (●)  │ ← Layer 2       │
│           ├───────┤                 │
│           │       │                 │
│           │ GLASS │ ← Layer 1       │
│           │       │                 │
│           └───────┘                 │
│                                     │
│    All aligned = Ready for Sanity!  │
└─────────────────────────────────────┘
```

---

## Folder Structure

Save completed files here:

```
best-bottles-next/
└── assets/
    └── components/
        ├── bottles/
        │   ├── bottle-clear.png
        │   ├── bottle-amber.png
        │   ├── bottle-cobalt-blue.png
        │   ├── bottle-frosted.png
        │   └── bottle-swirl.png
        ├── caps/
        │   ├── cap-black-dot.png
        │   ├── cap-gold-matte.png
        │   ├── cap-silver-matte.png
        │   ├── cap-white.png
        │   ├── cap-pink-dot.png
        │   ├── cap-gold-shiny.png
        │   ├── cap-silver-dot.png
        │   └── cap-silver-shiny.png
        └── fitments/
            ├── fitment-metal-roller.png
            └── fitment-plastic-roller.png
```

---

## Re-Import to Sanity

Once all images are created, run:

```bash
cd best-bottles-next
SANITY_API_TOKEN=your_token node scripts/import-local-assets.mjs
```

(We'll create this script to import from local files instead of URLs)

