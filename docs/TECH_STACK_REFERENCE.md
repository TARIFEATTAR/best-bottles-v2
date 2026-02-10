# Best Bottles Website - Tech Stack Reference

## Quick Answer: What is Best Bottles Built On?

**Best Bottles** is a **React + TypeScript Single Page Application (SPA)** built with:
- **Vite** as the build tool
- **React 18.3.1** for the UI
- **TypeScript 5.8.2** for type safety
- Multiple backend integrations (Supabase, Sanity, Shopify)
- AI/Voice capabilities (Google Gemini, ElevenLabs)

---

## Detailed Tech Stack

### Frontend Framework
- **React**: 18.3.1
- **TypeScript**: 5.8.2
- **Build Tool**: Vite 6.2.0
- **UI Libraries**:
  - Framer Motion 11.0.8 (animations)
  - Lucide React (icons)

### Backend Services
- **Supabase**: Database & Authentication (`@supabase/supabase-js`)
- **Sanity CMS**: Content Management (`@sanity/client`, `@sanity/image-url`)
- **Shopify**: E-commerce (`@shopify/hydrogen-react`)

### AI & Voice
- **Google Gemini**: AI chat functionality (`@google/genai`)
- **ElevenLabs**: Voice synthesis (`@elevenlabs/react`)

### Development Tools
- **ESLint**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting
- **Vite React Plugin**: React support in Vite

---

## Project Structure

```
best-bottles-v2/
├── components/          # Main React components (30+ files)
│   ├── Header.tsx       # Site header/navigation
│   ├── Footer.tsx       # Site footer
│   ├── ModernHome.tsx   # Homepage
│   ├── ChatBot.tsx      # AI chat interface
│   ├── ProductDetail*.tsx # Product pages
│   └── ...              # Other page components
│
├── src/                 # Additional source code
│   ├── components/      # Shared components
│   ├── demos/          # Demo pages (Blueprint Builder, etc.)
│   └── lib/            # Utility libraries
│
├── sanity-studio/      # Sanity CMS Studio (separate app)
│   ├── schemaTypes/    # Content schema definitions
│   └── sanity.config.js
│
├── lib/                # Shared libraries
│   └── supabase.ts     # Supabase client configuration
│
├── scripts/            # Utility scripts
│   ├── seed-*.ts       # Data seeding scripts
│   └── test-*.js       # Testing scripts
│
├── data/               # Static JSON data
├── public/             # Static assets
│
├── App.tsx             # Main app component (routing logic)
├── index.tsx           # React DOM entry point
├── vite.config.ts      # Vite build configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

---

## Architecture Patterns

### Routing
- **Client-side routing** via state management (no React Router)
- View-based navigation (`'home' | 'detail' | 'consultation' | ...`)
- URL-based routing for demos (`/demo/bottle-blueprint`)

### Code Splitting
- **Lazy loading** for heavy components
- Manual code splitting via Vite's `manualChunks`
- Separate vendor chunks (React, Motion, AI, Supabase, Icons)

### State Management
- **React hooks** (useState, useEffect)
- Local component state
- Cart state in App.tsx
- No global state management library (Redux, Zustand, etc.)

### Styling
- **Inline styles** and **CSS-in-JS** patterns
- CSS modules (LabelGenerator.css)
- No CSS framework (Tailwind, Material-UI, etc.)

---

## Key Features

1. **E-commerce**: Product catalog, cart, checkout
2. **Product Customization**: Blueprint Builder for bottle design
3. **AI Chat**: Voice-enabled chatbot with Gemini
4. **Content Management**: Sanity CMS integration
5. **Multi-language**: English/French support
6. **Authentication**: Supabase Auth
7. **Product Visualization**: 3D/interactive product views

---

## Build & Development

### Development
```bash
npm run dev      # Start dev server on port 3000
```

### Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

### Sanity Studio
```bash
cd sanity-studio
npm run dev      # Start Sanity Studio
```

---

## Environment Variables

Required environment variables:
- `GEMINI_API_KEY` - Google Gemini API key
- Supabase credentials (configured in `lib/supabase.ts`)
- Sanity credentials (configured in `sanity-studio/sanity.config.js`)
- Shopify credentials (if using Shopify API)

---

## Dependencies Summary

### Core
- react, react-dom
- typescript
- vite, @vitejs/plugin-react

### UI/UX
- framer-motion
- lucide-react

### Backend
- @supabase/supabase-js
- @sanity/client, @sanity/image-url
- @shopify/hydrogen-react

### AI/Voice
- @google/genai
- @elevenlabs/react

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductDetail.tsx`)
- **Utilities**: camelCase (e.g., `supabase.ts`)
- **Config files**: kebab-case (e.g., `vite.config.ts`)
- **Data files**: kebab-case (e.g., `roll-on-9ml-cylinder.json`)

---

## Entry Points

1. **Main App**: `index.tsx` → `App.tsx`
2. **Sanity Studio**: `sanity-studio/sanity.config.js`
3. **Vite Config**: `vite.config.ts`

---

## Notes for Monorepo Integration

- This is currently a **standalone project** (not a monorepo)
- Has a **nested Sanity Studio** (`sanity-studio/` directory)
- Uses **npm** as package manager
- **No workspace configuration** currently
- Ready to be integrated into a monorepo structure


