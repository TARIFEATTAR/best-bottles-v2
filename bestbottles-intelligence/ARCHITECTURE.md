# Best Bottles Intelligence Platform
## Repository Architecture & Structure

---

## Design Philosophy

This repository is a **platform-first intelligence engine** that transforms raw product data into structured, enriched, and queryable knowledge. It serves as the single source of truth for product intelligence, with Sanity as the canonical content contract between intelligence and consumption.

**Core Tenets:**
- Intelligence is separate from presentation
- Enrichment pipelines are independent and composable
- Sanity is the bridge between AI and human editing
- Everything is designed for multi-client, multi-frontend consumption

---

## Repository Structure

```
bestbottles-intelligence/
│
├── apps/
│   ├── studio/                    # Sanity Studio application
│   │   ├── sanity.config.ts
│   │   ├── schemas/               # Schema definitions (imported from packages)
│   │   ├── plugins/              # Studio-specific plugins
│   │   └── desk/                 # Custom desk structure
│   │
│   └── web/                       # Next.js 15 App Router (Preview + Consumer Storefront)
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   │   ├── layout.tsx    # Root layout with Visual Editing
│       │   │   ├── page.tsx     # Product list page
│       │   │   ├── products/     # Product detail pages
│       │   │   └── api/         # API routes (draft, revalidate)
│       │   └── lib/
│       │       └── sanity.ts    # Sanity client with stega
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── package.json
│
├── packages/
│   │
│   ├── schema/                    # Shared Sanity schema definitions
│   │   ├── src/
│   │   │   ├── documents/        # Document types (product, taxonomy, etc.)
│   │   │   │   └── product.ts   # Product document with viewer blocks
│   │   │   ├── objects/          # Reusable object types
│   │   │   │   └── productViewerBlock.ts # Code-based stacking config
│   │   │   ├── fields/           # Field definitions
│   │   │   └── index.ts          # Schema exports
│   │   └── package.json
│   │
│   ├── taxonomy/                  # Classification & taxonomy intelligence
│   │   ├── src/
│   │   │   ├── classifiers/      # ML/rule-based classifiers
│   │   │   ├── matchers/         # Taxonomy matching logic
│   │   │   ├── validators/        # Taxonomy validation
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── normalization/            # Product normalization & transformation
│   │   ├── src/
│   │   │   ├── transformers/     # Data transformers
│   │   │   ├── validators/       # Data validation
│   │   │   │   └── assetImage.ts # Asset validation (PNG, dimensions)
│   │   │   ├── mappers/          # Field mapping logic
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── enrichment/                # Product enrichment pipelines
│   │   ├── src/
│   │   │   ├── enrichers/        # Individual enrichment modules
│   │   │   ├── pipelines/        # Composed enrichment flows
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── knowledge/                # RAG, embeddings, vector operations
│   │   ├── src/
│   │   │   ├── embeddings/       # Embedding generation
│   │   │   ├── vectors/          # Vector operations
│   │   │   ├── rag/              # RAG pipeline components
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── client/                    # Sanity client utilities
│   │   ├── src/
│   │   │   ├── client.ts         # Configured Sanity client
│   │   │   ├── mutations.ts      # Common mutation helpers
│   │   │   └── queries.ts        # Common query helpers
│   │   └── package.json
│   │
│   └── ui/                        # Shared React UI components
│       ├── src/
│       │   ├── ProductViewer.tsx # Code-based image stacking component
│       │   ├── sanityImage.ts    # Sanity image URL helper
│       │   └── index.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── services/
│   │
│   ├── crawler/                   # Web crawling & ingestion service
│   │   ├── src/
│   │   │   ├── crawlers/         # Crawler implementations
│   │   │   ├── parsers/          # HTML/JSON parsers
│   │   │   ├── schedulers/       # Crawl scheduling
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ingestion/                # Data ingestion pipeline
│   │   ├── src/
│   │   │   ├── processors/       # Ingestion processors
│   │   │   ├── queues/          # Queue management
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── publisher/                # Publishing to Sanity
│       ├── src/
│       │   ├── writers/          # Sanity document writers
│       │   ├── sync/             # Sync logic
│       │   └── index.ts
│       └── package.json
│
├── lib/
│   │
│   ├── utils/                     # Shared utilities
│   │   ├── logging/              # Logging utilities
│   │   ├── fs/                   # File system helpers
│   │   ├── hashing/              # Hash utilities
│   │   ├── html/                 # HTML parsing utilities
│   │   └── index.ts
│   │
│   └── types/                     # Shared TypeScript types
│       ├── product.ts
│       ├── taxonomy.ts
│       └── index.ts
│
├── data/
│   ├── references/               # Reference data (taxonomies, mappings)
│   │   ├── taxonomy/             # Taxonomy definitions
│   │   ├── attributes/          # Attribute schemas
│   │   └── mappings/            # Source-to-canonical mappings
│   └── .gitignore                # Ignore large dumps, keep only references
│
├── scripts/
│   ├── setup/                    # Setup/initialization scripts
│   ├── migrations/               # Data migration scripts
│   └── maintenance/              # Maintenance utilities
│
├── docs/
│   ├── architecture/             # Architecture documentation
│   ├── pipelines/                # Pipeline documentation
│   ├── schemas/                  # Schema documentation
│   └── guides/                   # Usage guides
│
├── .github/
│   └── workflows/                # CI/CD workflows
│
├── package.json                  # Root package.json (monorepo)
├── pnpm-workspace.yaml           # Workspace configuration
├── turbo.json                    # Turborepo configuration
├── tsconfig.json                 # Root TypeScript config
└── README.md                     # Project overview

```

---

## Folder Responsibilities

### `/apps/studio`
**Purpose:** Sanity Studio application that provides the human interface to structured intelligence.

**Responsibilities:**
- Hosts the Sanity Studio UI
- Imports schemas from `packages/schema`
- Provides custom desk structure for content editors
- Configures Sanity plugins and customizations
- Enables Visual Editing for click-to-edit on frontend
- **Does NOT contain business logic** — only presentation and configuration

**Key Files:**
- `sanity.config.ts` — Studio configuration
- `schemas/` — Re-exports from `packages/schema` (or imports directly)

---

### `/apps/web`
**Purpose:** Next.js 15 App Router application — preview and consumer storefront within the monorepo.

**Responsibilities:**
- Renders products from Sanity using ProductViewer component
- Provides product list and detail pages
- Enables Visual Editing (click-to-edit) when authenticated
- Consumes Sanity content via GROQ queries
- **Does NOT contain ingestion logic** — pure presentation layer

**Key Features:**
- Visual Editing with stega encoding enabled
- Server Components by default (App Router)
- Draft mode support for preview
- Webhook revalidation for content updates

**Key Files:**
- `src/lib/sanity.ts` — Sanity client with stega enabled
- `src/app/layout.tsx` — Root layout with VisualEditing component
- `src/app/products/[slug]/page.tsx` — Product detail page
- `src/app/api/draft/route.ts` — Draft mode enablement endpoint

---

### `/packages/schema`
**Purpose:** Canonical Sanity schema definitions — the single source of truth for content structure.

**Responsibilities:**
- Defines all document types (product, category, attribute, etc.)
- Defines reusable object types
- Defines field types and validation rules
- **Product schema** with viewer blocks for code-based stacking
- Exported and consumed by Studio and all services

**Key Schema Types:**
- `product` — Product document with title, slug, SKU, Shopify integration fields, and viewer blocks
- `productViewerBlock` — Object type for code-based stacking configuration (base/fitment/cap images, aspect ratio, alignment)

**Key Principles:**
- Schema is versioned and stable
- Changes require migration planning
- Schema is the contract between intelligence and consumption
- **Minimal design** — Only fields needed for stacking, avoid overdesign

---

### `/packages/taxonomy`
**Purpose:** Classification and taxonomy intelligence — determines product categories, types, and attributes.

**Responsibilities:**
- Classifies products into taxonomy hierarchies
- Matches products to canonical categories
- Validates taxonomy assignments
- Provides taxonomy-related utilities

**Dependencies:**
- Uses `packages/schema` for taxonomy structure
- May use `packages/knowledge` for semantic matching

---

### `/packages/normalization`
**Purpose:** Transforms raw product data into canonical, structured format.

**Responsibilities:**
- Normalizes product fields (names, descriptions, prices, etc.)
- Maps source-specific fields to canonical schema
- Validates normalized data structure
- Handles data type conversions and cleaning
- **Validates asset images** for product stacking (PNG format, dimensions, aspect ratio)

**Key Utilities:**
- `validateAssetImage()` — Validates image format, dimensions, aspect ratio
- `validateProductStackingAsset()` — Convenience function for stacking assets (PNG, square)

**Dependencies:**
- Uses `packages/schema` for target structure
- Uses `sharp` for image processing and validation
- Consumed by `services/ingestion`

---

### `/packages/enrichment`
**Purpose:** Enriches normalized products with additional intelligence.

**Responsibilities:**
- Adds computed attributes (ratings, trends, etc.)
- Fills missing fields using AI/external APIs
- Generates derived data (recommendations, relationships)
- Composes enrichment pipelines

**Dependencies:**
- Uses `packages/normalization` output
- May use `packages/knowledge` for semantic enrichment

---

### `/packages/knowledge`
**Purpose:** RAG, embeddings, and vector operations for semantic intelligence.

**Responsibilities:**
- Generates embeddings for products
- Manages vector stores
- Provides RAG query capabilities
- Handles semantic search and similarity

**Dependencies:**
- Uses `packages/schema` for data structure
- May be consumed by `packages/taxonomy` and `packages/enrichment`

---

### `/packages/client`
**Purpose:** Sanity client utilities and helpers.

**Responsibilities:**
- Provides configured Sanity client instance
- Common mutation helpers (create, update, patch)
- Common query helpers (GROQ queries)
- Error handling and retry logic
- Exports client configuration (projectId, dataset, apiVersion)

**Dependencies:**
- Sanity client SDK
- Used by all services that write to Sanity
- Used by `apps/web` and `packages/ui` for client config

---

### `/packages/ui`
**Purpose:** Shared React UI component library for presentation layer.

**Responsibilities:**
- Provides reusable UI components
- **ProductViewer component** — Code-based image stacking (base/fitment/cap layers)
- Sanity image URL helpers
- Pure UI components (no data fetching)

**Key Components:**
- `ProductViewer` — Renders stacked product images with consistent aspect ratio
- Uses Next.js Image component for optimization
- Supports transparent PNG stacking without ghosting/misalignment

**Dependencies:**
- React, Next.js Image
- `@sanity/image-url` for image URL generation
- Tailwind CSS for styling
- Used by `apps/web` for product rendering

---

### `/services/crawler`
**Purpose:** Web crawling and data extraction service.

**Responsibilities:**
- Crawls product sources (websites, APIs, feeds)
- Extracts product data from HTML/JSON
- Handles rate limiting and retries
- Schedules and manages crawl jobs

**Output:**
- Raw product data (not yet normalized)

---

### `/services/ingestion`
**Purpose:** Ingests raw product data and orchestrates normalization/enrichment.

**Responsibilities:**
- Receives raw data from crawler
- Orchestrates normalization pipeline
- Orchestrates enrichment pipeline
- Manages queues and processing

**Dependencies:**
- Uses `packages/normalization`
- Uses `packages/enrichment`
- Uses `packages/taxonomy`

---

### `/services/publisher`
**Purpose:** Publishes enriched products to Sanity.

**Responsibilities:**
- Writes documents to Sanity using `packages/client`
- Handles document creation/updates
- Manages sync logic (incremental vs. full)
- Handles conflicts and errors

**Dependencies:**
- Uses `packages/client`
- Uses `packages/schema` for structure validation

---

### `/lib/utils`
**Purpose:** Shared utility functions used across packages and services.

**Responsibilities:**
- Logging utilities
- File system helpers
- Hashing functions
- HTML parsing utilities
- Common data manipulation

**Key Principle:**
- Pure, reusable functions
- No business logic

---

### `/lib/types`
**Purpose:** Shared TypeScript type definitions.

**Responsibilities:**
- Product type definitions
- Taxonomy type definitions
- Common interfaces
- Type guards and validators

---

### `/data/references`
**Purpose:** Reference data files (not large dumps).

**Responsibilities:**
- Taxonomy definitions (JSON/YAML)
- Attribute schemas
- Source-to-canonical mappings
- Configuration files

**Key Principle:**
- Small, version-controlled reference data only
- Large dumps go to external storage (S3, etc.)

---

### `/scripts`
**Purpose:** One-off and maintenance scripts.

**Responsibilities:**
- Setup and initialization
- Data migrations
- Maintenance tasks
- Development utilities

---

### `/docs`
**Purpose:** Documentation for the platform.

**Responsibilities:**
- Architecture documentation
- Pipeline flow documentation
- Schema documentation
- Usage guides and examples

---

## Intelligence Pipeline Flow

```
┌─────────────┐
│   Sources   │ (Websites, APIs, Feeds)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Crawler    │ (services/crawler)
│  Service    │
└──────┬──────┘
       │ Raw Product Data
       ▼
┌─────────────┐
│ Ingestion   │ (services/ingestion)
│  Service    │
└──────┬──────┘
       │
       ├──► Normalization (packages/normalization)
       │         │
       │         ▼
       ├──► Taxonomy (packages/taxonomy)
       │         │
       │         ▼
       ├──► Enrichment (packages/enrichment)
       │         │
       │         ▼
       └──► Knowledge (packages/knowledge)
                 │
                 ▼
       ┌─────────────┐
       │  Publisher  │ (services/publisher)
       │  Service    │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │   Sanity    │ (Canonical Content Contract)
       │   Studio    │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │   Sanity    │ (Canonical Content Contract)
       │   Studio    │
       └──────┬──────┘
              │
              ├──► apps/web (Next.js 15 - Preview + Consumer Storefront)
              │         │
              │         └──► Visual Editing (click-to-edit)
              │
              └──► External Frontends (Next.js, Shopify, etc.)
```

**Flow Details:**

1. **Crawler** extracts raw product data from sources
2. **Ingestion** receives raw data and orchestrates processing
3. **Normalization** transforms raw data into canonical structure
   - **Asset validation** ensures PNG format and correct dimensions for stacking
4. **Taxonomy** classifies products into categories
5. **Enrichment** adds computed attributes and derived data
6. **Knowledge** generates embeddings and RAG-ready data
7. **Publisher** writes structured documents to Sanity
8. **Sanity Studio** provides human editing interface
   - Editors can configure product viewer blocks (base/fitment/cap images)
   - Visual Editing enabled for click-to-edit on frontend
9. **apps/web** (Next.js 15) renders products using ProductViewer component
   - Fetches products via GROQ queries
   - Renders code-based stacking from Sanity schema
   - Supports Visual Editing when authenticated
10. **External Frontends** consume via Sanity API (Next.js, Shopify, etc.)

---

## Future API Layer

**Location:** `/apps/api` (future)

**Purpose:** REST/GraphQL APIs for consuming intelligence outside of Sanity.

**Responsibilities:**
- Product search API
- Taxonomy query API
- Embedding/similarity API
- Analytics and insights API

**Architecture Notes:**
- APIs would consume Sanity as the source of truth
- May also query vector stores directly for semantic search
- Designed for multi-client consumption
- Rate limiting and authentication built-in

**Why Not Now:**
- Initial focus is on Sanity as the primary interface
- APIs can be added incrementally as needs arise
- Keeps initial scope focused

---

## Naming Conventions

### Packages
- **Singular nouns:** `schema`, `taxonomy`, `normalization`
- **Descriptive:** `knowledge` (not `rag` or `vectors`)
- **Action-oriented for services:** `crawler`, `ingestion`, `publisher`

### Files & Folders
- **kebab-case** for folders: `taxonomy-classifier`, `product-enricher`
- **camelCase** for TypeScript files: `productTransformer.ts`
- **PascalCase** for classes: `ProductClassifier`, `TaxonomyMatcher`

### Functions & Variables
- **camelCase** for functions: `normalizeProduct()`, `classifyTaxonomy()`
- **camelCase** for variables: `productData`, `taxonomyTree`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRIES`, `DEFAULT_TIMEOUT`

### Types & Interfaces
- **PascalCase** for types: `Product`, `TaxonomyNode`, `EnrichmentResult`
- **I prefix** for interfaces (optional): `IProduct`, `ITaxonomyClassifier`

---

## Architectural Guardrails

### 1. **Sanity as Single Source of Truth**
- All intelligence flows INTO Sanity
- No parallel data stores for canonical product data
- Sanity schema is the contract — changes require migration

### 2. **Package Independence**
- Packages should be independently testable
- Dependencies flow downward (packages → services)
- Avoid circular dependencies

### 3. **Service Orchestration**
- Services orchestrate packages, don't duplicate logic
- Services handle I/O, scheduling, and error handling
- Business logic lives in packages

### 4. **Data Storage**
- Reference data only in `/data/references`
- Large dumps go to external storage (S3, database)
- Git ignores large files by default

### 5. **Type Safety**
- Shared types in `/lib/types`
- Packages export their own types
- Services use shared types for inter-service communication

### 6. **Error Handling**
- Structured logging throughout
- Errors bubble up with context
- Retry logic in services, not packages

### 7. **Testing**
- Unit tests co-located with packages/services
- Integration tests in `/tests/integration`
- E2E tests for full pipeline flows

---

## Technology Stack Assumptions

- **Monorepo:** Turborepo or pnpm workspaces
- **Language:** TypeScript throughout
- **Sanity:** v3+ (latest)
- **Package Manager:** pnpm (or npm/yarn)
- **Build Tool:** Turborepo for orchestration
- **CI/CD:** GitHub Actions

---

## Migration & Evolution Path

### Phase 1: Foundation
- Schema definitions
- Basic normalization
- Simple publisher to Sanity

### Phase 2: Intelligence
- Taxonomy classification
- Enrichment pipelines
- Knowledge/embeddings

### Phase 3: Scale
- Advanced crawling
- Queue management
- Performance optimization

### Phase 4: APIs (Future)
- REST/GraphQL APIs
- Multi-client support
- Analytics layer

---

## Questions & Decisions

**Q: Why separate packages for taxonomy, normalization, enrichment?**
A: Each has distinct responsibilities and may evolve independently. Taxonomy might use ML models, normalization might use rules, enrichment might use external APIs. Separation enables independent testing and deployment.

**Q: Why services separate from packages?**
A: Services handle orchestration, I/O, and infrastructure concerns. Packages contain pure business logic. This separation enables services to be swapped (e.g., different queue systems) without changing business logic.

**Q: Where do AI/ML models live?**
A: Models would be stored externally (S3, model registry) and loaded at runtime. Model definitions/configs can live in `/data/references` or package-specific configs.

**Q: How do we handle secrets/configuration?**
A: Environment variables for runtime config. `.env.example` files for documentation. Secrets managed via environment (not committed).

---

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Platform-first, client-agnostic design
- ✅ Sanity as canonical content contract
- ✅ Composable intelligence packages
- ✅ Scalable service layer
- ✅ Professional naming and structure
- ✅ Path for future evolution

The structure is designed to grow from a single-client intelligence platform into a multi-client product intelligence service.

