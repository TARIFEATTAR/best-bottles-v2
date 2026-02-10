# Best Bottles Sanity Studio

Sanity Studio application for managing product intelligence content.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in this directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Sanity project credentials:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id-here
SANITY_STUDIO_DATASET=production
```

**Where to find your Project ID:**
1. Go to https://www.sanity.io/manage
2. Select your project (or create a new one)
3. Copy the Project ID from the project settings

### 3. Run Studio Locally

```bash
pnpm dev
```

The Studio will be available at `http://localhost:3333`

### 4. Deploy Studio (Optional)

To deploy the Studio to Sanity's hosting:

```bash
pnpm deploy
```

This will make your Studio available at:
`https://your-project-id.sanity.studio`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | Yes | Your Sanity project ID |
| `SANITY_STUDIO_DATASET` | Yes | Dataset name (usually 'production') |

## Authentication

When you first open the Studio, you'll be prompted to log in with your Sanity account. Make sure you have access to the project.

## Troubleshooting

**"Project ID not found"**
- Verify your `.env.local` file exists and has the correct `SANITY_STUDIO_PROJECT_ID`
- Check that the project ID matches your Sanity project

**"Cannot connect to Sanity"**
- Check your internet connection
- Verify the project ID is correct
- Ensure you're logged into Sanity CLI: `sanity login`

**Schema errors**
- Make sure `@bestbottles/schema` package is built: `pnpm build --filter @bestbottles/schema`
- Check that schema types are properly exported in `packages/schema/src/index.ts`


