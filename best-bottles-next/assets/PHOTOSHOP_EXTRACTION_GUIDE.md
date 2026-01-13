# Photoshop Extraction Guide - 9ML Roll-On Bottles

## Overview

You need to extract **3 separate layers** from each composite bottle image:

```
ORIGINAL IMAGE          →    3 SEPARATE FILES
┌─────────────┐              ┌─────────────┐
│   ┌───┐     │              │   ┌───┐     │  cap-[color].png
│   │CAP│     │              │   └───┘     │  (Layer 3)
│   ├───┤     │              └─────────────┘
│   │(●)│     │              
│   ├───┤     │              ┌─────────────┐
│   │   │     │              │     (●)     │  fitment-[type].png
│   │   │     │              │             │  (Layer 2)
│   │   │     │              └─────────────┘
│   └───┘     │              
└─────────────┘              ┌─────────────┐
                             │   ┌───┐     │  bottle-[color].png
                             │   │   │     │  (Layer 1)
                             │   │   │     │  FLAT TOP - no cap/fitment
                             │   │   │     │
                             │   └───┘     │
                             └─────────────┘
```

---

## Canvas Setup

**For ALL extracted files:**
- Canvas Size: **1024 × 1024 px**
- Resolution: 72 DPI
- Color Mode: RGB
- Background: Transparent

---

## STEP 1: Prepare the Source File

1. **Open** the original bottle image from bestbottles.com
2. **File → New** - Create new document: 1024 × 1024 px, transparent background
3. **Copy** the bottle image into the new document
4. **Scale** to fit (bottle should be ~60-70% of canvas width, centered)
5. **Save As** → `[color]-source.psd` (keep as working file)

---

## STEP 2: Extract the CAP (Layer 3 - Top)

### Selection Process:
1. **Zoom in** to the cap area (top of bottle)
2. **Select** → **Object Selection Tool** (W) or **Pen Tool** (P)
3. Carefully select **ONLY the cap** - the top cylindrical piece
4. Include the entire cap but **stop at the bottom edge** where it meets the fitment

### Cut Points:
```
     ┌─────────┐  ← Include this
     │   CAP   │  ← Include this
     └─────────┘  ← Include bottom edge of cap
     ──────────── ← CUT LINE (don't include fitment below)
         (●)      ← DON'T include this
```

### Export:
1. **Ctrl/Cmd + J** - Copy selection to new layer
2. **Hide** all other layers
3. **Image → Trim** → Transparent pixels (optional, to see bounds)
4. **Position** cap at TOP of 1024×1024 canvas (centered horizontally)
5. **File → Export → Export As** → `cap-[color].png` (PNG-24, transparency)

---

## STEP 3: Extract the FITMENT/ROLLER (Layer 2 - Middle)

### Selection Process:
1. **Go back** to source layer
2. **Zoom in** to the neck area where the roller ball sits
3. **Select** the roller ball mechanism:
   - The metallic/plastic ball
   - The collar/housing around it
   - The neck insert piece

### Cut Points:
```
     └─────────┘  ← DON'T include cap
     ──────────── ← CUT LINE (cap removed)
     ┌─────────┐
     │   (●)   │  ← Include roller ball
     │ COLLAR  │  ← Include housing/collar
     └─────────┘  
     ──────────── ← CUT LINE (don't include glass body below)
         │ │      ← DON'T include bottle neck
```

### Export:
1. **Ctrl/Cmd + J** - Copy selection to new layer
2. **Hide** all other layers
3. **Position** fitment in the UPPER-MIDDLE of 1024×1024 canvas
   - Should sit where it would naturally connect to the bottle neck
   - Approximately Y: 200-350px from top
4. **File → Export → Export As** → `fitment-metal-roller.png` or `fitment-plastic-roller.png`

---

## STEP 4: Extract the GLASS BODY (Layer 1 - Bottom)

### This is the CRITICAL part - creating a FLAT TOP on the bottle

### Selection Process:
1. **Go back** to source layer
2. **Select** → **All** (or use Object Selection on the glass)
3. Now you need to **REMOVE** the cap and fitment area

### Creating the Flat Top:

**Method A: Marquee Selection**
1. Use **Rectangular Marquee Tool** (M)
2. Select from the TOP of the image down to just BELOW the fitment collar
3. **Delete** this selection
4. You now have a bottle with a flat open top

**Method B: Pen Tool (More Precise)**
1. Use **Pen Tool** (P)
2. Draw a path that:
   - Follows the OUTER edge of the bottle
   - Cuts straight across at the neck opening (where fitment would insert)
3. Convert path to selection
4. **Inverse** selection and delete

### The Result Should Look Like:
```
     ┌─────────┐  ← OPEN NECK (flat cut)
     │         │  ← Glass neck walls visible
     │         │
     │  GLASS  │  ← Main body
     │  BODY   │
     │         │
     └─────────┘  ← Bottom of bottle
```

### Key Points for Glass Body:
- ✅ The neck should be **OPEN** (no cap, no fitment)
- ✅ You should see **INTO** the bottle opening
- ✅ The cut line should be **CLEAN and STRAIGHT**
- ✅ Glass walls of the neck should be visible
- ❌ NO cap
- ❌ NO roller ball
- ❌ NO collar/fitment

### Export:
1. **Hide** all other layers
2. **Position** bottle at BOTTOM of 1024×1024 canvas (centered horizontally)
   - Leave room at top for where cap/fitment will stack
3. **File → Export → Export As** → `bottle-[color].png`

---

## STEP 5: Verify the Stack

Before finalizing, test that your 3 layers stack correctly:

1. **Create new document**: 1024 × 1024 px
2. **Place** `bottle-[color].png` as bottom layer
3. **Place** `fitment-[type].png` above it
4. **Place** `cap-[color].png` on top
5. **Check alignment**:
   - Does the fitment sit naturally in the bottle neck?
   - Does the cap sit on top of the fitment?
   - Are there any gaps or overlaps?

```
CORRECT STACK:              INCORRECT:
┌─────────────┐             ┌─────────────┐
│   ┌───┐     │             │   ┌───┐     │
│   │CAP│     │             │   │CAP│     │
│   ├───┤     │             │   └───┘     │ ← Gap!
│   │(●)│     │             │             │
│   ├───┤     │             │     (●)     │ ← Floating!
│   │   │     │             │   ┌───┐     │
│   │   │     │             │   │   │     │
│   └───┘     │             │   └───┘     │
└─────────────┘             └─────────────┘
```

---

## File Naming Convention

### Bottles (5 files):
- `bottle-clear.png`
- `bottle-amber.png`
- `bottle-cobalt-blue.png`
- `bottle-frosted.png`
- `bottle-swirl.png`

### Fitments (2 files):
- `fitment-metal-roller.png`
- `fitment-plastic-roller.png`

### Caps (10 files):
- `cap-black-dot.png`
- `cap-gold-matte.png`
- `cap-silver-matte.png`
- `cap-white.png`
- `cap-pink-dot.png`
- `cap-gold-shiny.png`
- `cap-black-shiny.png` ← Generate with AI
- `cap-silver-dot.png`
- `cap-silver-shiny.png`
- `cap-copper-matte.png` ← Generate with AI

---

## Checklist Per Bottle Color

### For each of the 5 bottle colors, extract:

**Clear Glass:**
- [ ] `bottle-clear.png` - Glass body with flat open top
- [ ] Cap extracted (use for reference)
- [ ] Fitment extracted (metal or plastic)

**Amber Glass:**
- [ ] `bottle-amber.png` - Glass body with flat open top
- [ ] Cap extracted
- [ ] Fitment extracted

**Cobalt Blue Glass:**
- [ ] `bottle-cobalt-blue.png` - Glass body with flat open top
- [ ] Cap extracted
- [ ] Fitment extracted

**Frosted Glass:**
- [ ] `bottle-frosted.png` - Glass body with flat open top
- [ ] Cap extracted
- [ ] Fitment extracted

**Swirl Pattern Glass:**
- [ ] `bottle-swirl.png` - Glass body with flat open top
- [ ] Cap extracted
- [ ] Fitment extracted

---

## Tips for Clean Extractions

### For Glass Bodies:
- Use **Refine Edge** (Select → Select and Mask) for glass edges
- Glass has subtle edges - zoom to 200%+ when selecting
- Keep some of the subtle reflection/refraction at edges

### For Fitments:
- The metal roller ball is very reflective - include the highlights
- The collar/housing is usually white or clear plastic
- Make sure to get the full mechanism, not just the ball

### For Caps:
- Caps usually have clean, defined edges
- Include any texture (dots, brushed finish)
- The bottom edge where it meets the fitment should be clean

### General:
- **Feather** selections by 0.5-1px for anti-aliasing
- Check for **stray pixels** at edges
- Ensure **100% transparent** background (no white artifacts)

---

## Save Locations

Save all extracted files to:

```
best-bottles-next/assets/components/
├── bottles/
│   ├── bottle-clear.png
│   ├── bottle-amber.png
│   ├── bottle-cobalt-blue.png
│   ├── bottle-frosted.png
│   └── bottle-swirl.png
├── caps/
│   └── [all 10 cap files]
└── fitments/
    ├── fitment-metal-roller.png
    └── fitment-plastic-roller.png
```

