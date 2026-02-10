# Best Bottles Intelligence Platform - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Next.js App (apps/web)

```bash
cd apps/web
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Note:** The app structure is already created. You may need to adjust if conflicts occur.

### 3. Create Workspace Packages

The following packages are already scaffolded:
- `packages/ui` - React UI components
- `packages/schema` - Sanity schema definitions
- `packages/normalization` - Data validation utilities

### 4. Environment Variables

Create `.env.local` files in `apps/web` and `apps/studio`:

**apps/web/.env.local:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
SANITY_API_READ_TOKEN=your-read-token
SANITY_REVALIDATE_SECRET=your-secret-token
```

**apps/studio/.env.local:**
```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

### 5. Install Additional Dependencies

```bash
# Sharp for image processing (packages/normalization)
pnpm add sharp --filter @bestbottles/normalization

# Sanity dependencies
pnpm add next-sanity @sanity/image-url --filter @bestbottles/web
pnpm add @sanity/image-url --filter @bestbottles/ui
```

### 6. Build and Run

```bash
# Build all packages
pnpm build

# Run Sanity Studio
pnpm --filter @bestbottles/studio dev

# Run Next.js app
pnpm --filter @bestbottles/web dev
```

## Terminal Commands Summary

### Create apps/web (Next.js 15)

```bash
# Navigate to apps directory
cd apps

# Create Next.js app
pnpm create next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Install additional dependencies
cd web
pnpm add next-sanity @sanity/image-url
pnpm add -D @types/node
```

### Create packages/ui

```bash
# Already created, but if needed:
mkdir -p packages/ui/src
cd packages/ui

# Initialize package.json (already created)
# Install dependencies
pnpm add react react-dom next @sanity/image-url
pnpm add -D @types/react @types/react-dom typescript tailwindcss autoprefixer postcss
```

## Project Structure

```
bestbottles-intelligence/
├── apps/
│   ├── studio/          # Sanity Studio
│   └── web/             # Next.js 15 App Router
├── packages/
│   ├── schema/          # Sanity schemas
│   ├── ui/              # React UI components
│   ├── normalization/   # Data validation
│   └── ...              # Other packages
├── services/
│   ├── crawler/
│   ├── ingestion/
│   └── publisher/
└── pnpm-workspace.yaml
```

## Next Steps

1. Configure Sanity project in `apps/studio/sanity.config.ts`
2. Import schemas from `@bestbottles/schema`
3. Set up Visual Editing in Sanity Studio
4. Test ProductViewer component with sample data
5. Configure asset validation in ingestion pipeline


