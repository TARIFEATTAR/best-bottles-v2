
# Building the Blueprint Builder with Sanity & React

This guide outlines the core code structure required to connect your React frontend to the Sanity backend for the "Layered Bottle Builder" experience.

## Step 1: Define Your TypeScript Interfaces
Your React code needs to know exactly what data to expect from Sanity. These types must match the Schema fields you defined in Sanity Studio.

**File:** `src/lib/types.ts`
```typescript
// 1. Core Component Interfaces
// These match the 'glassOption', 'capOption', etc. schemas
export interface GlassOption {
  _id: string;
  name: string;
  // The full-size transparent PNG of the bottle body
  layerImageUrl: string; 
  priceModifier?: number;
}

export interface CapOption {
  _id: string;
  name: string;
  finish: 'Matte' | 'Polished' | 'Brushed';
  // The full-size transparent PNG of the cap
  layerImageUrl: string;
}

export interface RollerOption {
  _id: string;
  name: string;
  // The full-size transparent PNG of the roller ball
  layerImageUrl: string;
}

// 2. The Bottle Model Interface
// Matches the 'bottleModel' schema
export interface BottleModel {
  _id: string;
  name: string;
  baseDimensions: {
    width: number;  // e.g. 1000
    height: number; // e.g. 2000
  };
  // Lists of available options for this specific bottle
  glassOptions: GlassOption[];
  capOptions: CapOption[];
  rollerOptions: RollerOption[];
}
```

## Step 2: Write the GROQ Query
This query tells Sanity exactly what data to send to your app. We use "projections" (`{ ... }`) to get the direct Image URLs instead of just the image objects.

**File:** `src/lib/sanity.ts`
```typescript
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'your_project_id',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

// The Query
export const BOTTLE_QUERY = `
  *[_type == "bottleModel" && slug.current == $slug][0]{
    _id,
    name,
    baseDimensions,
    
    // Expand References and get URLs
    glassOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url
    },
    capOptions[]->{
      _id,
      name,
      finish,
      "layerImageUrl": layerImage.asset->url
    },
    rollerOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url
    }
  }
`;
```

## Step 3: Create the Viewer Component (The "Engine")
This is the most critical React component. It takes the selected options and "stacks" them visually. It replaces complex manual coding logic with simple **Layer Stacking**.

**File:** `src/components/BottleViewer.tsx`
```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  glass?: GlassOption;
  cap?: CapOption;
  roller?: RollerOption;
  showBlueprint?: boolean; // Toggles the measurements overlay
}

export const BottleViewer = ({ glass, cap, roller, showBlueprint }: Props) => {
  return (
    <div className="relative w-full h-[600px] bg-gray-50 rounded-xl overflow-hidden">
      
      {/* 1. Base Blueprint Layer (Always Visible as Foundation) */}
      <img src="/assets/blueprint-outlines/base-outline.svg" className="absolute inset-0 w-full h-full z-0" />

      {/* 2. Glass Layer (Fills the body) */}
      <AnimatePresence>
        {glass && (
          <motion.img 
             key={glass._id}
             src={glass.layerImageUrl} 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             className="absolute inset-0 w-full h-full object-contain z-10" 
          />
        )}
      </AnimatePresence>

      {/* 3. Roller Layer */}
      <AnimatePresence>
        {roller && (
          <motion.img 
             key={roller._id}
             src={roller.layerImageUrl} 
             className="absolute inset-0 w-full h-full object-contain z-20" 
          />
        )}
      </AnimatePresence>

      {/* 4. Cap Layer (Sits on top) */}
      <AnimatePresence>
        {cap && (
          <motion.img 
             key={cap._id}
             src={cap.layerImageUrl} 
             initial={{ y: -20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="absolute inset-0 w-full h-full object-contain z-30" 
          />
        )}
      </AnimatePresence>

      {/* 5. Technical Specifications Overlay (The "Blueprint Mode") */}
      <AnimatePresence>
        {showBlueprint && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             className="absolute inset-0 z-50 pointer-events-none"
           >
              {/* This could be an SVG or another transparent PNG layer from Sanity */}
              <img src="/assets/blueprint-overlays/measurements.svg" className="w-full h-full" />
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
```

## Summary of Workflow
1.  **Sanity**: Upload your transparent PNGs for each part.
2.  **React (Query)**: Fetch the URLs of those PNGs.
3.  **React (Viewer)**: Stack them on top of each other using `absolute` positioning.

This approach makes your builder **CMS-Driven**. To add a new "Blue Glass" option, you simply upload the Blue Glass layer in Sanity, and it instantly appears in the builder without changing a single line of code.
