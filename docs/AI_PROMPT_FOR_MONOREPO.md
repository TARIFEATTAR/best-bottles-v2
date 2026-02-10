# Prompt for Other AI: Monorepo Integration Analysis

**Copy and paste this entire prompt to the AI in your monorepo environment:**

---

## Context: Best Bottles Monorepo Integration

I need your help analyzing our monorepo structure so we can integrate it with the existing Best Bottles website. The Best Bottles website is currently in a separate environment and we need to merge the monorepo work we've done here.

### What is Best Bottles Built On?

**Best Bottles** is a **React + TypeScript Single Page Application (SPA)** built with:
- **Vite** as the build tool
- **React 18.3.1** for the UI
- **TypeScript 5.8.2** for type safety
- **Backend Services**: Supabase (database/auth), Sanity CMS (content), Shopify (e-commerce)
- **AI/Voice**: Google Gemini (AI chat), ElevenLabs (voice synthesis)

**Current Structure:**
- Main React app in root directory
- Sanity Studio in `sanity-studio/` subdirectory
- Uses npm (not a monorepo yet)
- 30+ React components
- Client-side routing (no React Router)
- Lazy-loaded components for code splitting

### What I Need From You

Please analyze the monorepo structure in this environment and provide the following information:

#### 1. Monorepo Tool & Structure
- **What monorepo tool is being used?** (Turborepo, Nx, pnpm workspaces, npm workspaces, etc.)
- **What is the root directory structure?** (Please show the file tree or list key directories)
- **Are there workspace configuration files?** (e.g., `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, root `package.json` with workspaces)

#### 2. Packages/Apps in Monorepo
- **What packages or apps are defined?** (List all workspaces/apps)
- **What is each package/app responsible for?**
- **Are there shared packages?** (What are they and what do they contain?)
- **What is the Best Bottles website package called?** (e.g., `apps/website`, `packages/best-bottles`, etc.)

#### 3. File Structure Analysis
- **Show the complete file structure** of the Best Bottles website package/app
- **What files were added or modified?** (Compared to a basic setup)
- **Are there new directories or organizational changes?**

#### 4. Dependencies & Configuration
- **What dependencies were added?** (Check `package.json` files)
- **Are there version conflicts?** (Especially React - main app uses 18.3.1, Sanity Studio uses 19.1)
- **What configuration files exist?** (vite.config.ts, tsconfig.json, eslint.config.js, etc.)
- **Are there shared TypeScript configs?** (tsconfig.base.json, etc.)

#### 5. Code Changes
- **What major features or refactoring was done?**
- **Are there breaking changes?** (API changes, import path changes, etc.)
- **Were any components refactored or reorganized?**
- **Are there new shared utilities or libraries?**

#### 6. Build & Scripts
- **What build scripts are configured?** (Check root and package-level package.json)
- **Are there monorepo-specific scripts?** (e.g., `turbo build`, `nx build`, etc.)
- **How do you run the Best Bottles website?** (What command?)

#### 7. Integration Considerations
- **Are there environment variable changes?**
- **Are there new required setup steps?**
- **What would break if we just copied files over?** (Import paths, shared dependencies, etc.)

### Deliverables I Need

Please provide:

1. **Complete file tree** of the monorepo root and the Best Bottles package
2. **Key configuration files** (package.json files, workspace configs, tsconfig files)
3. **List of all changes** (new files, modified files, deleted files)
4. **Dependency comparison** (what's new, what changed versions)
5. **Integration checklist** (what needs to be done to merge this back)
6. **Potential conflicts or issues** to watch out for

### Reference Documents

I have two reference documents that explain the current Best Bottles setup:
- **MONOREPO_INTEGRATION_GUIDE.md** - Detailed integration strategy
- **TECH_STACK_REFERENCE.md** - Complete tech stack and structure overview

You can reference these to understand what we're integrating with, but please focus on analyzing YOUR monorepo structure and providing the information above.

### Questions to Answer

1. **What monorepo tool is being used?**
2. **What's the root structure?**
3. **What packages/apps exist?**
4. **What changed in the Best Bottles website?**
5. **Are there breaking changes?**
6. **What's the integration strategy?** (Should we merge into current structure or adopt full monorepo?)

---

**Please analyze the monorepo and provide a comprehensive report with all the information above. This will help us create a detailed integration plan.**


