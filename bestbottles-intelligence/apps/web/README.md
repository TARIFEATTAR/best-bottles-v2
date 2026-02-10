# Product Viewer Proof

Minimal frontend to prove code-based image stacking works end-to-end.

## Setup

### 1. Environment Variables

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=gv4os6ef
NEXT_PUBLIC_SANITY_DATASET=production
```

### 2. Install & Run

```bash
# From monorepo root
pnpm install
pnpm --filter @bestbottles/web dev
```

Or:

```bash
cd apps/web
pnpm dev
```

### 3. View Products

1. Open http://localhost:3000
2. Click a product link
3. See the stacked bottle/cap/fitment render

## What This Does

- Fetches one Product document from Sanity
- Renders ProductViewer with base/fitment/cap images stacked
- Shows debug info (which layers are present)

## What This Does NOT Do

- ❌ Cart/checkout
- ❌ SEO
- ❌ Authentication
- ❌ Production styling

This is a proof-of-concept viewer only.


