# Migration Guide: Legacy → Hydrogen

> **From:** Vite + React SPA with Supabase  
> **To:** Shopify Hydrogen with Convex  
> **Last Updated:** January 2026

---

## Migration Overview

This document catalogs portable code, patterns requiring translation, and components that need fresh implementation for the Best Bottles Hydrogen rebuild.

### Legacy Stack
- **Framework:** Vite + React 18 SPA
- **Backend:** Supabase (DB, Auth, Storage, Edge Functions)
- **CMS:** Sanity.io
- **E-commerce:** Shopify (via @shopify/hydrogen-react)
- **AI:** Google Gemini + ElevenLabs

### New Stack
- **Framework:** Shopify Hydrogen (Remix-based SSR)
- **Backend:** Convex (real-time, serverless)
- **CMS:** Sanity.io (unchanged)
- **E-commerce:** Shopify Plus (native Hydrogen integration)
- **AI:** Google Gemini + ElevenLabs (unchanged)

---

## Directly Portable

These files can be copied with minimal or no changes:

### TypeScript Interfaces

| File | Description | Copy To |
|------|-------------|---------|
| `types.ts` | Core product and configuration types | `app/lib/types/product.ts` |

**Portable Types:**
- [x] `Product` — Base product interface
- [x] `BaseBottle` — Bottle variant data
- [x] `RollerOption` — Fitment options (metal/plastic)
- [x] `CapOption` — Cap variant data
- [x] `SharedSpecs` — Capacity, neck size, dimensions
- [x] `PricingTier` — Quantity-based pricing
- [x] `SkuMatrixEntry` — SKU lookup table
- [x] `ConfigurableProductCategory` — Full configurable product structure
- [x] `ProductSelection` — Current user selection state
- [x] `NavItem`, `Feature` — UI data types

### Constants & Static Data

| File | Description | Migration Notes |
|------|-------------|-----------------|
| `constants.ts` | Navigation, features, FAQ data | Copy to `app/lib/constants.ts` |
| `translations.ts` | i18n strings | Adapt for Hydrogen's i18n |

**Portable Constants:**
- [x] `NAV_ITEMS` — Navigation menu items
- [x] `FEATURES` — Homepage feature cards
- [x] `FINDER_CATEGORIES` — Product finder categories
- [x] `JOURNAL_POSTS` — Sample journal data (migrate to Sanity)
- [x] `FAQ_DATA` — Help center content (migrate to Sanity)

### Product Configuration Data

| File | Description | Recommendation |
|------|-------------|----------------|
| `data/roll-on-9ml-cylinder.json` | 9ml roll-on configuration | **Migrate to Sanity** or keep as JSON |
| `data/elegant-60ml-spray.json` | 60ml spray configuration | **Migrate to Sanity** or keep as JSON |
| `data/travel-atomizer-10ml.json` | 10ml atomizer configuration | **Migrate to Sanity** or keep as JSON |

**Structure includes:**
- `categoryId`, `categoryName`, `categoryDescription`
- `sharedSpecs` — Capacity, neck thread, dimensions
- `baseBottles[]` — Glass variants with image URLs
- `rollerOptions[]` / `capOptions[]` — Fitment and cap variants
- `pricingMatrix` — Tier-based pricing
- `skuMatrix[]` — Full SKU lookup
- `labelSpecs` — Label dimensions for printing
- `labelPartners[]` — Print vendor links

### Sanity Schema Definitions

Copy entire directory: `sanity-studio/schemaTypes/` → `sanity/schemas/`

| Schema | Description | Notes |
|--------|-------------|-------|
| `product.ts` | Product (Bottle Model) | Add Shopify sync fields |
| `glassOption.ts` | Glass layer variants | Uses Supabase URLs → migrate assets |
| `capOption.ts` | Cap layer variants | Includes offset positions |
| `fitmentVariant.ts` | Fitment types (roller, dropper, spray) | Full compatibility data |
| `category.ts` | Product categories | Keep as-is |
| `homepage.ts` | Homepage configuration | Keep as-is |
| `productViewerBlock.ts` | Paper Doll canvas settings | Contains layer order |
| `index.ts` | Schema registry | Update imports |

### Documentation & Prompts

| File | Purpose | Copy To |
|------|---------|---------|
| `docs/GRACE_SYSTEM_PROMPT.md` | Grace AI personality | `app/lib/grace/prompts.ts` |
| `docs/BEST_BOTTLES_BRAND_BOOK.md` | Brand guidelines | Reference for design system |
| `docs/Grace_KB_FAQ.md` | Grace knowledge base | Load into Gemini context |
| `docs/ELEVENLABS_PRODUCT_KNOWLEDGE.md` | Product knowledge (767KB) | RAG document store |

### Pure Utility Functions

Extract from existing components:

```typescript
// From ProductDetailConfigurable.tsx
// Pricing calculation logic (lines 86-99)
function calculateTierPrice(basePrice: number, quantity: number, tiers: PricingTier[]): number

// SKU generation logic
function generateSku(bottle: string, roller: string, cap: string, matrix: SkuMatrixEntry[]): string

// From VisualizeModal.tsx
// Label specs calculation
function getLabelDimensions(productType: string): LabelSpecs
```

---

## Needs Translation (Supabase → Convex)

### Database Queries

| Supabase Pattern | Convex Equivalent |
|------------------|-------------------|
| `supabase.from('products').select()` | `useQuery(api.products.list)` |
| `supabase.from('products').select().eq('sku', sku)` | `useQuery(api.products.getBySku, { sku })` |
| `supabase.from('products').insert(data)` | `useMutation(api.products.create)` |
| `supabase.from('products').update(data).eq('id', id)` | `useMutation(api.products.update)` |

### Real-time Subscriptions

| Supabase Pattern | Convex Equivalent |
|------------------|-------------------|
| `supabase.channel('changes').on('postgres_changes', ...).subscribe()` | Automatic with `useQuery` |
| Manual subscription cleanup | Not needed (handled by React) |

**Supabase (Legacy):**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('product-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, 
      (payload) => setProducts(prev => [...prev, payload.new]))
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
}, []);
```

**Convex (New):**
```typescript
const products = useQuery(api.products.list);
// Automatically reactive - no subscription management needed
```

### Authentication

| Supabase Pattern | Convex Equivalent |
|------------------|-------------------|
| `supabase.auth.signInWithPassword()` | Convex Auth (or Shopify Customer Account) |
| `supabase.auth.getUser()` | `useConvexAuth()` |
| Row Level Security (RLS) | Convex auth rules in schema |

**Recommendation:** Use Shopify Customer Account API for customer auth, Convex for session/preference storage.

### Edge Functions → Convex Actions

| Supabase Edge Function | Convex Equivalent |
|------------------------|-------------------|
| Event-triggered functions | Convex scheduled functions |
| HTTP endpoints | Convex HTTP actions |
| Background jobs | Convex actions |

**Example Migration:**

```typescript
// Supabase Edge Function (Deno)
Deno.serve(async (req) => {
  const { productId } = await req.json();
  const { data } = await supabaseClient.from('products').select().eq('id', productId);
  return new Response(JSON.stringify(data));
});

// Convex Action
export const getProduct = action({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    return await ctx.runQuery(api.products.get, { id: productId });
  },
});
```

### Storage

| Supabase Pattern | New Approach |
|------------------|--------------|
| `supabase.storage.from('bucket').getPublicUrl()` | Sanity CDN or Shopify Files API |
| `supabase.storage.from('bucket').upload()` | Sanity asset upload |

**Current asset locations:**
- Layer images: Supabase storage URLs in Sanity `image_url` fields
- **Migration:** Upload to Sanity directly, replace URL fields with `image` type

---

## File-by-File Translation Guide

### `components/AIChat.tsx` → `app/components/grace/GraceChat.tsx`

| Legacy | Hydrogen | Changes Needed |
|--------|----------|----------------|
| `@elevenlabs/react` hook | Same | None |
| Local state for messages | Convex for persistence | Add `useMutation(api.conversations.addMessage)` |
| Demo mode fallback | Keep for dev | None |

### `components/ProductDetailConfigurable.tsx` → `app/routes/configurator.$productSlug.tsx`

| Legacy | Hydrogen | Changes Needed |
|--------|----------|----------------|
| JSON imports for product data | Sanity fetch in loader | Use `loader` function |
| Local state for selection | Convex for save/share | Add persistence layer |
| Manual "Add to Cart" | Hydrogen CartProvider | Use `cartLinesAdd` mutation |

### `src/lib/sanity.ts` → `app/lib/sanity/client.ts`

| Legacy | Hydrogen | Changes Needed |
|--------|----------|----------------|
| `import.meta.env.VITE_*` | `process.env.*` | Update env var access |
| client-side only | Server + client | Add server client |

### `src/lib/sanityDemo.ts` → `app/lib/sanity/queries.ts`

| Legacy | Hydrogen | Changes Needed |
|--------|----------|----------------|
| GROQ queries | Same | None |
| `demoClient.fetch()` | Use in loader | Wrap in Remix loader |
| Type definitions | Same | Copy to new types file |

---

## Rebuild Fresh

These components require complete reimplementation due to framework differences:

### Routing

| Legacy | Hydrogen |
|--------|----------|
| State-based (`currentView`) | File-based routes |
| Manual URL parsing | Remix `useParams`, `useSearchParams` |
| History manipulation | Remix `<Link>`, `useNavigate` |

**Example:**
```typescript
// Legacy (App.tsx)
const [currentView, setCurrentView] = useState<'home' | 'detail' | 'cart'>('home');
if (currentView === 'detail') return <ProductDetail productId={selectedProduct} />;

// Hydrogen (app/routes/products.$handle.tsx)
export async function loader({ params }: LoaderArgs) {
  const product = await getProduct(params.handle);
  return json({ product });
}
```

### Data Fetching

| Legacy | Hydrogen |
|--------|----------|
| `useEffect` + fetch | `loader` functions |
| Client-side only | Server-first, client hydration |
| Loading states | Remix `defer`, `Await` |

### Cart Integration

| Legacy | Hydrogen |
|--------|----------|
| Custom cart state | `CartProvider`, `useCart` |
| Manual cart API calls | `cartLinesAdd`, `cartLinesRemove` |
| Custom cart drawer | Build on Hydrogen primitives |

### Checkout Flow

| Legacy | Hydrogen |
|--------|----------|
| Custom checkout page | Redirect to Shopify checkout |
| Payment form | Shopify-hosted (PCI compliant) |

### Customer Authentication

| Legacy | Hydrogen |
|--------|----------|
| Supabase Auth | Shopify Customer Account API |
| Custom login forms | Shopify login redirect |
| Session management | Hydrogen session + Convex |

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Initialize Hydrogen project
- [ ] Set up Convex backend
- [ ] Copy Sanity schemas
- [ ] Configure environment variables
- [ ] Set up design tokens (colors, typography)

### Phase 2: Core E-commerce
- [ ] Product listing pages
- [ ] Product detail pages
- [ ] Collection pages
- [ ] Cart functionality
- [ ] Checkout redirect

### Phase 3: Paper Doll Configurator
- [ ] Canvas component (600×1063)
- [ ] Layer stacking logic
- [ ] Glass/Cap/Fitment selectors
- [ ] SKU generation
- [ ] Add configured product to cart
- [ ] Save configuration (Convex)

### Phase 4: Grace AI
- [ ] Chat interface
- [ ] Gemini integration
- [ ] ElevenLabs voice
- [ ] Conversation persistence (Convex)
- [ ] Product recommendation flow

### Phase 5: B2B Features
- [ ] Customer tier system
- [ ] Wholesale pricing display
- [ ] Tax exemption flow
- [ ] Quote builder

### Phase 6: Content
- [ ] Homepage
- [ ] Journal/blog
- [ ] FAQ/Help center
- [ ] Contact page
- [ ] Custom packaging inquiry

---

## Asset Migration

### Layer Images (Critical for Paper Doll)

Current location: Supabase Storage
Target: Sanity Assets or Shopify Files

**Current Sanity schema pattern:**
```typescript
defineField({
  name: 'image_url',
  title: 'Image URL',
  type: 'url',
  description: 'Direct URL to the image stored in Supabase',
})
```

**New pattern:**
```typescript
defineField({
  name: 'layerImage',
  title: 'Layer Image',
  type: 'image',
  options: { hotspot: false },
  description: 'PNG layer image (600×1063px)',
})
```

**Migration script needed:** Download from Supabase, upload to Sanity, update references.

### Product Images

- Keep using Shopify CDN for product photography
- Paper Doll generated images: Consider Shopify Files API

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase URL references break | High | Medium | Run asset migration before launch |
| Grace AI response latency | Medium | High | Implement streaming responses |
| Paper Doll performance | Low | High | Optimize image loading, use `<img loading="lazy">` |
| B2B pricing sync | Medium | High | Validate tier logic thoroughly |

---

## Questions to Clarify

1. **Inventory data format:** Is `inventory.json` (320KB) the authoritative product list, or should we pull from Shopify?
2. **Paper Doll layer assets:** Migrate to Sanity Assets or keep in Shopify Files?
3. **B2B approval workflow:** Manual in Shopify Admin or automated with Convex?
4. **Search implementation:** Shopify Predictive Search alone or Algolia integration?
5. **Multi-language:** Full i18n or English-only for v1?

---

*Migration Guide v1.0 — Best Bottles Hydrogen Rebuild*
