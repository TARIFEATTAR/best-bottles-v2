# Sanity Studio Setup Guide

## Quick Start

### 1. Create Sanity Project (if you don't have one)

1. Go to https://www.sanity.io/manage
2. Click "Create new project"
3. Name it "Best Bottles Intelligence" (or your preferred name)
4. Copy the **Project ID** (you'll need this)



### 2. Set Up Environment Variables

Create `.env.local` in `apps/studio/`:

```bash
cd apps/studio
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
SANITY_STUDIO_PROJECT_ID=gv4os6ef
SANITY_STUDIO_DATASET=production
```

### 3. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

### 4. Build Schema Package

Make sure the schema package is built:

```bash
pnpm build --filter @bestbottles/schema
```

### 5. Run Studio

```bash
pnpm --filter @bestbottles/studio dev
```

Or from the studio directory:

```bash
cd apps/studio
pnpm dev
```

Studio will be available at: **http://localhost:3333**

### 6. Authenticate

When you first open the Studio:
1. Click "Log in"
2. Sign in with your Sanity account
3. Make sure you have access to the project

## Deploy Studio (Optional)

To deploy the Studio to Sanity's hosting:

```bash
cd apps/studio
pnpm deploy
```

This makes your Studio available at:
`https://your-project-id.sanity.studio`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | ✅ Yes | - | Your Sanity project ID from https://www.sanity.io/manage |
| `SANITY_STUDIO_DATASET` | ✅ Yes | `production` | Dataset name (usually 'production' or 'development') |

## API Tokens (Not Required for Studio)

**Note:** You don't need API tokens to run the Studio locally. The Studio uses your authenticated session.

However, if you want to:
- Use the Studio with the Next.js app (Visual Editing)
- Access Sanity from server-side code
- Use webhooks

You'll need to create API tokens:

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to "API" → "Tokens"
4. Create a token with appropriate permissions:
   - **Read token**: For fetching content (used in Next.js app)
   - **Write token**: For creating/updating content (used in ingestion services)

Then add to `apps/web/.env.local`:

```env
SANITY_API_READ_TOKEN=your-read-token-here
```

## Troubleshooting

### "Project ID not found"
- ✅ Check `.env.local` exists in `apps/studio/`
- ✅ Verify `SANITY_STUDIO_PROJECT_ID` matches your project
- ✅ Restart the dev server after changing env vars

### "Cannot connect to Sanity"
- ✅ Check internet connection
- ✅ Verify project ID is correct
- ✅ Run `sanity login` to authenticate

### "Schema not found" or import errors
- ✅ Build schema package: `pnpm build --filter @bestbottles/schema`
- ✅ Check `packages/schema/src/index.ts` exports `schemaTypes`
- ✅ Verify workspace dependencies: `pnpm install`

### Port 3333 already in use
- ✅ Change port: `SANITY_STUDIO_PORT=3334 pnpm dev`
- ✅ Or kill the process using port 3333

## Next Steps

Once Studio is running:
1. Create your first product document
2. Upload base/fitment/cap images (PNG format recommended)
3. Configure the product viewer block
4. Test Visual Editing in the Next.js app


