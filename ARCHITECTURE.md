# Best Bottles — Hydrogen Platform Architecture

> **Hydrogen Rebuild v1.0** | January 2026  
> Premium B2B Packaging E-commerce for Fragrance, Beauty & Wellness Brands

---

## Stack Overview

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Frontend Framework** | Shopify Hydrogen (Remix) | SSR React app, routing, Shopify integration |
| **E-commerce** | Shopify Plus (Storefront API) | Products, variants, cart, checkout, orders, customers |
| **Real-Time Backend** | Convex | Grace AI conversations, Paper Doll configs, B2B customer data, sessions |
| **CMS** | Sanity.io | Editorial content, guides, FAQs, brand assets, product enrichment |
| **AI Chat** | Google Gemini | Grace AI chatbot reasoning and responses |
| **Voice** | ElevenLabs | Grace voice synthesis for conversational AI |
| **Language** | TypeScript | End-to-end type safety |
| **Hosting** | Oxygen (Shopify) | Edge-deployed Hydrogen app |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SHOPIFY PLUS                                   │
│  Products • Variants • Inventory • Cart • Checkout • Orders • Customers     │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ Storefront API (GraphQL)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HYDROGEN STOREFRONT                                 │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Grace AI Chat │  │  Paper Doll     │  │  Product Catalog & Cart     │  │
│  │   (Gemini +     │  │  Configurator   │  │  (Shopify Storefront API)   │  │
│  │   ElevenLabs)   │  │                 │  │                             │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────────┘  │
│           │                    │                                             │
│           ▼                    ▼                                             │
│  ┌─────────────────────────────────────────┐  ┌───────────────────────────┐ │
│  │              CONVEX                      │  │         SANITY.io         │ │
│  │  • Grace conversations & memory          │  │  • Product descriptions   │ │
│  │  • Paper Doll saved configurations       │  │  • Editorial/Journal      │ │
│  │  • B2B customer tiers & tax exempt       │  │  • FAQs & Help content    │ │
│  │  • Session state & real-time sync        │  │  • Brand assets           │ │
│  │  • AI context retrieval                  │  │  • Layer image assets     │ │
│  └─────────────────────────────────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What Lives Where

| System | Data Responsibility |
|--------|---------------------|
| **Shopify** | Source of truth for: products, variants, SKUs, pricing, inventory, cart state, checkout flow, order history, customer accounts |
| **Convex** | Real-time data: Grace AI chat history & context, Paper Doll configuration state, B2B customer tier metadata, tax-exempt status, saved quotes, session persistence |
| **Sanity** | Editorial content: product rich descriptions, application guides, Journal/blog posts, FAQs, brand assets (logos, lifestyle photography), Paper Doll layer images (glass, caps, fitments) |

---

## Directory Structure

```
best-bottles-hydrogen/
├── app/
│   ├── root.tsx                    # Hydrogen root layout
│   ├── entry.client.tsx            # Client entry
│   ├── entry.server.tsx            # Server entry
│   │
│   ├── routes/
│   │   ├── _index.tsx              # Homepage
│   │   ├── collections._index.tsx  # Collections listing
│   │   ├── collections.$handle.tsx # Collection detail
│   │   ├── products.$handle.tsx    # Product detail
│   │   ├── cart.tsx                # Cart page
│   │   ├── account.tsx             # Customer account
│   │   ├── account.login.tsx       # Login
│   │   ├── account.register.tsx    # Registration (B2B application)
│   │   │
│   │   ├── configurator/
│   │   │   └── $productSlug.tsx    # Paper Doll configurator
│   │   │
│   │   ├── consultation.tsx        # Grace AI consultation page
│   │   ├── journal/
│   │   │   ├── _index.tsx          # Journal listing
│   │   │   └── $slug.tsx           # Journal article
│   │   │
│   │   ├── help-center.tsx         # Help/FAQ
│   │   ├── contact.tsx             # Contact page
│   │   ├── custom.tsx              # Custom packaging inquiry
│   │   └── api/
│   │       ├── grace-chat.tsx      # Grace AI endpoint
│   │       └── convex-webhook.tsx  # Convex webhook handler
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductOptions.tsx
│   │   │   ├── PricingTiers.tsx
│   │   │   └── AddToCartButton.tsx
│   │   │
│   │   ├── configurator/
│   │   │   ├── PaperDollCanvas.tsx      # Main layered canvas (600×1063)
│   │   │   ├── GlassSelector.tsx
│   │   │   ├── FitmentSelector.tsx
│   │   │   ├── CapSelector.tsx
│   │   │   ├── LayerStack.tsx           # Z-index management
│   │   │   ├── ConfigurationSummary.tsx
│   │   │   └── SavedConfigurations.tsx
│   │   │
│   │   ├── grace/
│   │   │   ├── GraceChat.tsx            # Chat interface
│   │   │   ├── GraceVoice.tsx           # ElevenLabs integration
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── ProductRecommendation.tsx
│   │   │
│   │   ├── b2b/
│   │   │   ├── TierBadge.tsx
│   │   │   ├── WholesalePricing.tsx
│   │   │   ├── TaxExemptBanner.tsx
│   │   │   └── QuoteBuilder.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── Loader.tsx
│   │
│   ├── lib/
│   │   ├── shopify/
│   │   │   ├── queries.ts           # Storefront API GraphQL queries
│   │   │   ├── mutations.ts         # Cart/checkout mutations
│   │   │   └── types.ts             # Shopify type definitions
│   │   │
│   │   ├── convex/
│   │   │   ├── client.ts            # Convex client setup
│   │   │   ├── queries.ts           # Convex query hooks
│   │   │   └── mutations.ts         # Convex mutations
│   │   │
│   │   ├── sanity/
│   │   │   ├── client.ts            # Sanity client
│   │   │   ├── queries.ts           # GROQ queries
│   │   │   └── types.ts             # Sanity type definitions
│   │   │
│   │   ├── grace/
│   │   │   ├── gemini.ts            # Gemini API integration
│   │   │   ├── elevenlabs.ts        # Voice synthesis
│   │   │   ├── prompts.ts           # System prompts
│   │   │   └── rag.ts               # Retrieval augmented generation
│   │   │
│   │   └── utils/
│   │       ├── formatters.ts        # Price, date formatters
│   │       ├── validators.ts        # Form validation
│   │       ├── pricing.ts           # Tier pricing calculations
│   │       └── sku.ts               # SKU generation logic
│   │
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useCustomer.ts
│   │   ├── useGrace.ts
│   │   ├── usePaperDoll.ts
│   │   └── usePricing.ts
│   │
│   └── styles/
│       ├── app.css                  # Global styles
│       ├── design-tokens.css        # CSS variables
│       └── components/
│
├── convex/
│   ├── schema.ts                    # Convex schema definitions
│   ├── conversations.ts             # Grace chat mutations/queries
│   ├── configurations.ts            # Paper Doll configs
│   ├── customers.ts                 # B2B customer data
│   └── sessions.ts                  # Session management
│
├── sanity/
│   ├── schemas/
│   │   ├── product.ts               # Product enrichment
│   │   ├── glassOption.ts           # Glass layer assets
│   │   ├── capOption.ts             # Cap layer assets
│   │   ├── fitmentVariant.ts        # Fitment (roller, spray, dropper)
│   │   ├── journal.ts               # Blog/editorial
│   │   ├── faq.ts                   # Help content
│   │   └── homepage.ts              # Homepage config
│   │
│   ├── sanity.config.ts
│   └── sanity.cli.ts
│
├── public/
│   ├── fonts/
│   │   ├── EBGaramond/
│   │   └── Inter/
│   └── images/
│
├── .env                             # Environment variables
├── hydrogen.config.ts               # Hydrogen configuration
├── remix.config.js                  # Remix configuration
├── tailwind.config.ts               # Optional: Tailwind setup
├── tsconfig.json
└── package.json
```

---

## Key Architectural Decisions

### Why Hydrogen over Standard React/Vite

| Consideration | Decision |
|--------------|----------|
| **Shopify Native** | First-party integration with Storefront API, optimized cart/checkout flows |
| **Edge Rendering** | SSR at edge via Oxygen for fast TTFB globally |
| **SEO** | Server-rendered product pages for search crawlers |
| **Remix Foundation** | Modern React patterns, nested routing, data loading |
| **Future-proof** | Shopify's continued investment in Hydrogen ecosystem |

### Why Convex over Supabase

| Aspect | Supabase (Legacy) | Convex (New) |
|--------|-------------------|--------------|
| **Real-time** | Requires manual subscriptions | Built-in reactive queries |
| **Type Safety** | Manual type definitions | End-to-end TypeScript inference |
| **Serverless Functions** | Edge Functions (Deno) | Integrated mutations/actions |
| **Developer Experience** | Good | Excellent (local dev, hot reload) |
| **AI Integration** | Manual | Native support for AI workflows |
| **Complexity** | Higher (RLS, triggers, etc.) | Simpler mental model |

### Headless Commerce Patterns

1. **Product Data** — Shopify is source of truth; Sanity enriches with editorial content
2. **Cart** — Use Hydrogen's built-in cart utilities (cartCreate, cartLinesAdd)
3. **Checkout** — Redirect to Shopify-hosted checkout (PCI compliance)
4. **Customer Accounts** — Shopify Customer Account API + Convex for B2B metadata
5. **Search** — Shopify Predictive Search API + custom Grace AI recommendations

### Real-Time Requirements

| Feature | Real-time Need | Solution |
|---------|---------------|----------|
| Grace AI Chat | Streaming responses | Convex subscriptions |
| Paper Doll | Instant layer updates | Local state + Convex persistence |
| Cart | Cross-tab sync | Shopify cart ID in session |
| B2B Pricing | Tier changes | Convex reactive queries |

---

## Migration Notes

### Legacy Repository Reference
```
/Users/jordanrichter/Projects/Clients/Best Bottles/
```

### Portable Code (Copy with Minimal Changes)

| File/Directory | Description | Migration Notes |
|---------------|-------------|-----------------|
| `types.ts` | Product, ConfigurableProduct, Selection interfaces | Update for Hydrogen patterns |
| `constants.ts` | NAV_ITEMS, FEATURES, FAQ_DATA | Keep as-is |
| `data/*.json` | Product configuration data (roll-on, spray, atomizer) | Consider migrating to Sanity |
| `sanity-studio/schemaTypes/*.ts` | Sanity schema definitions | Copy directly |
| `docs/GRACE_SYSTEM_PROMPT.md` | Grace AI personality/instructions | Use in Gemini prompts |
| `docs/BEST_BOTTLES_BRAND_BOOK.md` | Brand guidelines | Reference for design system |

### Needs Translation (Supabase → Convex)

| Legacy Pattern | Convex Equivalent |
|---------------|-------------------|
| `supabase.from('table').select()` | `useQuery(api.table.list)` |
| `supabase.channel().subscribe()` | Automatic with `useQuery` |
| Supabase Edge Functions | Convex Actions |
| Row Level Security | Convex auth rules |
| `supabase.storage` | Shopify CDN or Sanity assets |

### Rebuild Fresh

| Component | Reason |
|-----------|--------|
| Routing | Hydrogen uses Remix file-based routing |
| Data fetching | Remix loaders/actions replace useEffect patterns |
| Cart integration | Use Hydrogen's CartProvider |
| Authentication | Shopify Customer Account API |
| Checkout flow | Shopify-hosted checkout |

---

## Design System

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Obsidian** | `#1D1D1F` | Primary text, headers (replaces Charcoal #2E3133) |
| **Bone** | `#F5F3EF` | Backgrounds (warmer than legacy Paper White #F9F8F4) |
| **Muted Gold** | `#C5A065` | Primary accent, CTAs (replaces Sage Glass) |
| **Slate** | `#637588` | Secondary text, metadata |
| **Champagne** | `#D4C5A9` | Subtle accents, hover states |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| **H1** | EB Garamond | Medium (500) | 48px |
| **H2** | EB Garamond | Regular (400) | 32px |
| **H3** | EB Garamond | Regular (400) | 24px |
| **Body** | Inter | Regular (400) | 16px |
| **Specs/Meta** | Inter | Medium (500) | 14px |
| **Buttons** | Inter | SemiBold (600) | 14px, uppercase |

### Philosophy: "Muted Luxury"

- **No harsh whites** — Use Bone (#F5F3EF) for backgrounds
- **No gaudy accents** — Muted Gold is understated, not flashy
- **Serif for elegance** — EB Garamond conveys expertise and heritage
- **Generous whitespace** — Let products breathe
- **Subtle animations** — Elegant, not playful

---

## Critical Patterns

### Paper Doll Layer Stacking

The Paper Doll configurator uses PNG layer stacking to visualize bottle configurations.

```
Canvas Size: 600 × 1063 pixels

Layer Order (bottom to top):
┌─────────────────────────────────────┐
│  5. Lighting Overlay (optional)     │  z-index: 50
├─────────────────────────────────────┤
│  4. Cap Layer                       │  z-index: 40
├─────────────────────────────────────┤
│  3. Fitment Layer (roller/dropper)  │  z-index: 30
├─────────────────────────────────────┤
│  2. Glass Layer                     │  z-index: 20
├─────────────────────────────────────┤
│  1. Shadow/Base Layer               │  z-index: 10
└─────────────────────────────────────┘
        Position: (0, 0)
```

**Key Rules:**
1. All layer images MUST be exactly 600×1063 pixels
2. Stack all layers at position (0, 0) — alignment is baked into the images
3. Use `position: absolute` with `z-index` for stacking
4. Layers are stored in Sanity with `image_url` field pointing to Supabase storage (migrate to Sanity assets)
5. Cap offset values exist in schema but prefer pre-aligned images

### Grace AI Integration

**Persona:**
- Warm, knowledgeable concierge (not a salesperson)
- Professional yet approachable
- Uses British spellings (colour, favour)
- Patient and understanding

**Rules:**
- **Never quote specific prices** — Always direct to configurator
- **Always suggest complementary products** — Increase basket size naturally
- **Retrieval priority:**
  1. Exact product match from inventory
  2. Brand-aligned alternatives
  3. Educational content (guides, FAQs)

**Integration Pattern:**
```typescript
// Gemini for reasoning
const response = await gemini.generateContent({
  systemPrompt: GRACE_SYSTEM_PROMPT,
  context: await retrieveContext(userMessage),
  userMessage
});

// ElevenLabs for voice (optional)
const audio = await elevenlabs.textToSpeech(response.text);
```

---

## B2B Portal Architecture

### Customer Tiers

| Tier | Minimum Order | Discount |
|------|--------------|----------|
| **Retail** | $0 | 0% |
| **Maker** | $500 | 10% |
| **Professional** | $2,500 | 15% |
| **Wholesale** | $10,000 | 20% |
| **Enterprise** | Custom | Negotiated |

### Tax Exemption Flow
1. Customer submits tax-exempt certificate during registration
2. Staff reviews in Shopify Admin
3. Approved customers flagged in Convex
4. Checkout automatically excludes tax

---

## Environment Variables Required

```bash
# Shopify
SHOPIFY_STORE_DOMAIN=bestbottles.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=xxxxxxxxxxxxx
SHOPIFY_ADMIN_API_TOKEN=xxxxxxxxxxxxx        # For metafields sync
SHOPIFY_STOREFRONT_API_VERSION=2024-10

# Convex
CONVEX_DEPLOYMENT=your-deployment
CONVEX_URL=https://your-deployment.convex.cloud

# Sanity
SANITY_PROJECT_ID=gv4os6ef
SANITY_DATASET=production
SANITY_API_TOKEN=xxxxxxxxxxxxx               # For mutations

# Google Gemini (Grace AI)
GOOGLE_GEMINI_API_KEY=xxxxxxxxxxxxx

# ElevenLabs (Voice)
ELEVENLABS_API_KEY=xxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=xxxxxxxxxxxxx

# Session
SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Getting Started

### 1. Create Hydrogen Project
```bash
npx @shopify/create-hydrogen@latest best-bottles-hydrogen
cd best-bottles-hydrogen
```

### 2. Set Up Convex
```bash
npm install convex
npx convex init
npx convex dev
```

### 3. Copy Sanity Studio
```bash
cp -r ../Best\ Bottles/sanity-studio ./sanity
cd sanity && npm install
```

### 4. Configure Environment
```bash
cp .env.example .env
# Fill in all required values
```

### 5. Run Development
```bash
# Terminal 1: Hydrogen
npm run dev

# Terminal 2: Convex
npx convex dev

# Terminal 3: Sanity Studio
cd sanity && npm run dev
```

---

## API Reference

### Shopify Storefront API
- **Products**: `products(first: 50, query: "collection:roll-on")`
- **Collections**: `collections(first: 20)`
- **Cart**: `cartCreate`, `cartLinesAdd`, `cartLinesRemove`
- **Customer**: `customer(accessToken: $token)`

### Convex Functions
- `api.conversations.create` — Start Grace chat
- `api.conversations.addMessage` — Add message to chat
- `api.configurations.save` — Save Paper Doll state
- `api.customers.getTier` — Get B2B pricing tier

### Sanity GROQ
- `*[_type == "product" && slug.current == $slug]` — Product detail
- `*[_type == "glassOption"]` — Glass options for configurator
- `*[_type == "journal"] | order(publishedAt desc)` — Journal posts

---

## Performance Targets

| Metric | Target |
|--------|--------|
| **Lighthouse Performance** | > 90 |
| **LCP** | < 2.5s |
| **FID** | < 100ms |
| **CLS** | < 0.1 |
| **Time to Interactive** | < 3s |

---

## Security Considerations

1. **Never expose admin API tokens** in client-side code
2. **Use Shopify checkout** for PCI compliance
3. **Validate customer tier** server-side in Convex
4. **Rate limit** Grace AI endpoints
5. **Sanitize** all user input before Sanity mutations

---

*Architecture Document v1.0 — Best Bottles Hydrogen Rebuild*
