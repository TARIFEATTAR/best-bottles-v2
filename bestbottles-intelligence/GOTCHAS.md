# Gotchas & Important Notes

## Next.js Image vs Transparent PNG Stacking

### Issue
Next.js Image component with `fill` and `object-contain` can cause alignment issues when stacking transparent PNGs if:
- Images have different intrinsic dimensions
- Container aspect ratio doesn't match image aspect ratios
- Images are not properly sized before upload

### Solutions Implemented
1. **Fixed Aspect Ratio Container**: Using Tailwind's `aspect-square` (or similar) ensures consistent container size
2. **object-contain**: Prevents image distortion while maintaining aspect ratio
3. **Consistent Image Sizing**: All images should be the same dimensions (e.g., 2000x2000px)
4. **Absolute Positioning**: Each layer uses `absolute inset-0` to fill container exactly
5. **Z-index Layering**: Clear z-index order (base: z-10, fitment: z-20, cap: z-30)

### Best Practices
- **Pre-process images**: Ensure all PNGs are the same dimensions before upload
- **Use asset validation**: The `validateProductStackingAsset` function enforces square aspect ratio
- **Test with real assets**: Ghosting/misalignment is most visible with actual product images
- **Consider image optimization**: Sanity CDN handles optimization, but ensure source images are high quality

## Sanity Asset Pipeline Considerations

### Image Upload
- Sanity accepts PNG, JPG, WebP, GIF
- For stacking, **PNG with transparency is required**
- Sanity automatically optimizes images via CDN
- Image URLs are generated via `@sanity/image-url`

### Asset References in Schema
- Use `type: 'image'` in schema
- Access asset via `image.asset->` in GROQ queries
- Asset object contains `_id`, `url`, `metadata` (dimensions, format, etc.)

### Visual Editing Requirements
- **Stega encoding**: Must be enabled in `next-sanity` client config
- **Studio URL**: Required for Visual Editing to work
- **Draft mode**: Enabled via `/api/draft` route when clicking in Studio
- **Token**: Read token needed for draft content access

### Gotchas
1. **Asset URLs**: Always use `urlFor()` helper, don't access `url` directly
2. **Draft vs Published**: Use `perspective: 'drafts'` for preview client
3. **CDN**: Production uses CDN, development should use `useCdn: false` for fresh data
4. **Image Dimensions**: Sanity stores dimensions in metadata, use for validation

## Visual Editing Setup

### Required Components
1. **VisualEditing component**: Imported from `next-sanity` in root layout
2. **Draft mode route**: `/api/draft` endpoint to enable draft mode
3. **Stega config**: Enabled in Sanity client with `stega: { enabled: true }`
4. **Studio URL**: Must match your Studio deployment URL

### Environment Variables
```env
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333  # or production URL
SANITY_API_READ_TOKEN=your-token                     # for draft access
SANITY_REVALIDATE_SECRET=your-secret                 # for webhook security
```

### How It Works
1. User clicks "Edit" in Sanity Studio
2. Studio redirects to Next.js app with draft mode enabled
3. Next.js fetches draft content (with stega encoding)
4. VisualEditing component enables click-to-edit
5. Changes sync back to Sanity Studio

### Common Issues
- **Click-to-edit not working**: Check stega is enabled and Studio URL is correct
- **Draft content not showing**: Verify token has read access to drafts
- **Changes not saving**: Ensure Studio is configured for Visual Editing
- **CORS errors**: Add Next.js URL to Sanity CORS settings

## Code-Based Stacking Architecture

### Schema Design
- **Minimal fields**: Only what's needed for stacking (base, fitment, cap images + aspect ratio)
- **Optional alignment**: Fine-tuning via xOffset, yOffset, scale (kept minimal)
- **Multiple viewers**: Support for array of viewer blocks (different angles)

### Component Design
- **Pure UI**: ProductViewer has no data fetching logic
- **Reusable**: Can be used anywhere in the app
- **Type-safe**: Full TypeScript support with Sanity types
- **Responsive**: Uses Next.js Image with proper sizing

### Stacking Logic
- **Layering order**: Base (bottom) → Fitment (middle) → Cap (top)
- **Positioning**: All layers use `absolute inset-0` for perfect alignment
- **Aspect ratio**: Container enforces consistent aspect ratio
- **Image sizing**: All images use `object-contain` to prevent distortion

### Validation
- **Pre-upload**: Validate PNG format and dimensions before publishing to Sanity
- **Aspect ratio**: Enforce square (1:1) for consistent stacking
- **Dimensions**: Recommend exact dimensions (e.g., 2000x2000px)
- **Error handling**: Reject invalid assets early in ingestion pipeline

## Monorepo Considerations

### Workspace Dependencies
- Use `workspace:*` for internal packages
- Install dependencies at root level when possible
- Use `--filter` flag to install in specific packages

### TypeScript Configuration
- Root `tsconfig.json` provides base config
- Each package/app extends root config
- Path aliases configured per package

### Build Order
- Schema package must build before Studio
- UI package must build before Web app
- Normalization can build independently

### Shared Code
- Types: Use `@bestbottles/types` package (if exists)
- Utils: Use `@bestbottles/utils` package (if exists)
- Client: Use `@bestbottles/sanity-client` for Sanity config

## Performance Considerations

### Image Optimization
- Sanity CDN handles optimization automatically
- Use appropriate `sizes` prop for responsive images
- Consider `priority` for above-the-fold images

### Next.js App Router
- Server Components by default (better performance)
- Use `fetch` with proper caching
- Revalidate on demand via webhooks

### Visual Editing
- Stega encoding adds small overhead
- Only enabled when Studio URL is present
- Draft mode fetches from Sanity API (not CDN)

## Security Notes

### Environment Variables
- Never commit `.env.local` files
- Use different tokens for dev/prod
- Rotate secrets regularly

### API Routes
- `/api/draft`: Verify secret token
- `/api/revalidate`: Verify secret token
- Use HTTPS in production

### Sanity Tokens
- Read token: For draft content access
- Write token: Only for server-side mutations (not exposed to client)
- Viewer token: For public read access (if needed)


