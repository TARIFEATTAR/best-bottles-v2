# Monorepo Integration Guide

## Current Best Bottles Website Structure

### Tech Stack Overview

**Main Website (`best-bottles-v2/`):**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **UI Libraries**:
  - Framer Motion 11.0.8 (animations)
  - Lucide React (icons)
- **Backend Services**:
  - Supabase (@supabase/supabase-js) - Database & Auth
  - Sanity CMS (@sanity/client) - Content Management
  - Shopify (@shopify/hydrogen-react) - E-commerce
- **AI/Voice**:
  - Google Gemini (@google/genai) - AI chat
  - ElevenLabs (@elevenlabs/react) - Voice synthesis
- **Language**: TypeScript 5.8.2
- **Package Manager**: npm

**Sanity Studio (`sanity-studio/`):**
- **Framework**: Sanity v5.1.0
- **React**: 19.1
- **Styling**: styled-components
- **Language**: TypeScript

### Current File Structure

```
best-bottles-v2/
├── components/          # Main React components (pages, UI)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ModernHome.tsx
│   ├── ChatBot.tsx
│   ├── ProductDetail*.tsx
│   └── ... (30+ components)
├── src/                 # Additional source files
│   ├── components/      # Shared components
│   ├── demos/          # Demo pages (Blueprint, etc.)
│   └── lib/            # Utility libraries
├── sanity-studio/      # Sanity CMS Studio (separate app)
│   ├── schemaTypes/    # Sanity schema definitions
│   ├── sanity.config.js
│   └── package.json
├── scripts/            # Utility scripts (data seeding, etc.)
├── lib/                # Shared libraries (Supabase client, etc.)
├── data/               # Static JSON data files
├── public/             # Static assets
├── App.tsx             # Main app entry point
├── index.tsx           # React DOM root
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Main dependencies
```

### Key Features

1. **Single Page Application (SPA)** with client-side routing
2. **Lazy-loaded components** for code splitting
3. **Multi-language support** (English/French)
4. **E-commerce integration** (Shopify)
5. **AI Chat Bot** with voice capabilities
6. **Product customization** (Blueprint Builder)
7. **Cart & Checkout** functionality
8. **Sanity CMS** for content management

---

## Monorepo Integration Strategy

### Step 1: Understand the New Monorepo Structure

Before merging, you need to understand:
1. **What packages/apps are in the new monorepo?**
   - Is it using a monorepo tool (Turborepo, Nx, pnpm workspaces, etc.)?
   - What's the root structure?
   - Are there shared packages/libraries?

2. **What changed in the new monorepo?**
   - New features added?
   - Refactored code?
   - New dependencies?
   - Configuration changes?

### Step 2: Choose Integration Approach

#### Option A: Merge into Current Structure (Recommended if minimal changes)

If the monorepo work is mostly additions/improvements:

1. **Backup current project**
   ```bash
   cd /Users/jordanrichter/Projects/Clients/Best\ Bottles/
   cp -r best-bottles-v2 best-bottles-v2-backup
   ```

2. **Compare file structures**
   - Identify new files/folders in monorepo
   - Identify modified files
   - Check for conflicts

3. **Merge incrementally**
   - Start with configuration files (package.json, tsconfig.json, etc.)
   - Then merge source code
   - Finally merge dependencies

#### Option B: Adopt Full Monorepo Structure (Recommended if major restructuring)

If the new monorepo has a proper monorepo setup (workspaces, etc.):

1. **Identify monorepo tool**
   - Check for `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, etc.
   - Understand the workspace structure

2. **Migrate to monorepo root**
   - Move current `best-bottles-v2` to a workspace (e.g., `apps/website`)
   - Move `sanity-studio` to another workspace (e.g., `apps/studio`)
   - Set up shared packages if needed

### Step 3: Dependency Management

**Current dependencies to preserve:**
- React 18.3.1 (main app) vs React 19.1 (Sanity Studio) - note the version difference
- All current integrations (Supabase, Sanity, Shopify, etc.)

**Steps:**
1. Compare `package.json` files
2. Merge dependencies (watch for version conflicts)
3. Run `npm install` and resolve conflicts
4. Test that all integrations still work

### Step 4: Configuration Files

**Files to merge carefully:**
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript settings
- `eslint.config.js` - Linting rules
- `.env` files - Environment variables
- `sanity-studio/sanity.config.js` - Sanity configuration

### Step 5: Code Integration

**Priority order:**
1. **Shared utilities** (`lib/`, `src/lib/`)
2. **Components** (`components/`, `src/components/`)
3. **Pages/Views** (check for routing changes)
4. **Scripts** (`scripts/`)
5. **Data files** (`data/`)

**Watch for:**
- Import path changes
- Component API changes
- Routing changes
- State management changes

### Step 6: Testing & Validation

After integration:

1. **Build test**
   ```bash
   npm run build
   ```

2. **Dev server test**
   ```bash
   npm run dev
   ```

3. **Sanity Studio test**
   ```bash
   cd sanity-studio && npm run dev
   ```

4. **Check integrations:**
   - Supabase connection
   - Sanity CMS connection
   - Shopify API
   - AI services (Gemini, ElevenLabs)

---

## Quick Reference: Current Setup

### Main App Commands
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Sanity Studio Commands
```bash
cd sanity-studio
npm run dev      # Start Sanity Studio
npm run build    # Build Sanity Studio
npm run deploy   # Deploy to Sanity hosting
```

### Key Entry Points
- **Main App**: `App.tsx` → `index.tsx`
- **Sanity Studio**: `sanity-studio/sanity.config.js`
- **Vite Config**: `vite.config.ts`
- **TypeScript Config**: `tsconfig.json`

### Environment Variables Needed
- `GEMINI_API_KEY` - Google Gemini API
- Supabase credentials (in `lib/supabase.ts`)
- Sanity credentials (in `sanity-studio/sanity.config.js`)
- Shopify credentials (if used)

---

## Questions to Answer Before Merging

1. **What monorepo tool is being used?** (Turborepo, Nx, pnpm workspaces, etc.)
2. **What's the root structure of the new monorepo?**
3. **Are there shared packages?** (What are they?)
4. **What major changes were made?** (New features, refactoring, etc.)
5. **Are there breaking changes?** (API changes, dependency updates, etc.)
6. **What's the git history?** (Should we preserve it or start fresh?)

---

## Recommended Next Steps

1. **Share the monorepo structure** - Provide the file tree or key files
2. **Identify the monorepo tool** - Check for workspace configuration
3. **List major changes** - What was added/modified
4. **Choose integration approach** - Option A (merge) or Option B (adopt structure)

Once you provide this information, I can help you:
- Create a detailed merge plan
- Set up the monorepo structure properly
- Resolve conflicts
- Update configurations
- Test the integration


