# Quick Prompt for Other AI (Copy-Paste Ready)

---

**Copy everything below this line to the other AI:**

---

I need help analyzing our monorepo structure to integrate it with the existing Best Bottles website. 

**Context:** Best Bottles is a React 18.3.1 + TypeScript + Vite SPA with Supabase, Sanity CMS, Shopify, and AI integrations. Currently standalone (not a monorepo), but we've set up a monorepo in this environment and need to merge it back.

**What I need you to analyze:**

1. **Monorepo tool?** (Turborepo, Nx, pnpm workspaces, npm workspaces, etc.)
2. **Root structure?** (Show file tree and workspace configs)
3. **What packages/apps exist?** (List all workspaces and their purposes)
4. **Best Bottles package structure?** (Show complete file tree of the website package)
5. **What changed?** (New files, modified files, refactoring, new features)
6. **Dependencies?** (What's new, version changes, conflicts - especially React 18.3.1 vs 19.1)
7. **Configuration files?** (vite.config, tsconfig, package.json files)
8. **Breaking changes?** (Import paths, API changes, etc.)
9. **Build scripts?** (How to run the website in this monorepo)
10. **Integration risks?** (What would break if we just copy files over?)

**Please provide:**
- Complete file trees (monorepo root + Best Bottles package)
- Key config files (package.json, workspace configs, tsconfig)
- List of all changes
- Dependency comparison
- Integration checklist
- Potential conflicts/issues

**Reference:** The current Best Bottles setup uses npm, has a nested `sanity-studio/` directory, uses client-side routing (no React Router), and has 30+ components with lazy loading.

---


