
# PRESENTATION DECK: ASALA.AI × BEST BOTTLES
**Date:** January 2026
**Confidentiality:** ASALA.AI | CONFIDENTIAL

---

## SLIDE 1 - PARTNERSHIP PROPOSAL
**Header:** PARTNERSHIP PROPOSAL • JANUARY 2026

**Title:** Best Bottles: A Digital Transformation
**Subtitle:** Elevating the digital experience to match the physical quality & beauty of the product.

**Footer:** ASALA.AI × BEST BOTTLES | CONFIDENTIAL

---

## SLIDE 2 - AGENDA
**Header:** AGENDA

**Title:** Tonight's Roadmap

**01 - The Brand Brain for Grace**
Zero hallucinations. 2,000+ products. 5-day data collection sprint.

**02 - The Paper Doll Image Pipeline**
PSD → Supabase → Sanity. Automated component assembly.

**03 - Sanity as Your Remote Control**
Seasonal campaigns, banners, content — no code required.

**04 - Headless: Freedom, Not Limitation**
Templates vs. custom: what you gain, what you keep.

**05 - Shopify Plus Integration**
Inventory sync, checkout, and the backend you know.

**06 - B2B Logic & Shipping**
Customer accounts, business licenses, and weight-based shipping.

---

## SLIDE 3 - GRACE AI INTRO
**Header:** SECTION 01 • THE FOUNDATION

**Title:** Meet Grace AI: Your 24/7 Product Expert
**Subtitle:** Solving the human bottleneck of memorizing 1,300+ product specifications. Grace doesn't guess — she knows.

**Stats:**
- **1,300+** Products
- **9,555** Technical Specs
- **0** Hallucinations
- **24/7** Availability

---

## SLIDE 4 - BRAND BRAIN
**Header:** THE BRAND BRAIN

**Title:** Building Grace's Knowledge Foundation
**Context:** Before Grace can assist customers, we need to build her "brain" — a comprehensive data collection sprint working directly with your team.

**Action Plan:**
- **DAY 1-2: Product Catalog:** Complete SKU data, specifications, compatibility charts, fitment guides.
- **DAY 3: Policies & FAQ:** Shipping rules, return policies, bulk pricing tiers, lead times.
- **DAY 4: Brand Voice:** Tone guidelines, common objections, upsell strategies, conversation flows.
- **DAY 5: Testing & Tuning:** Live testing with real scenarios, edge case handling, refinement.

**What We Collect:**
- Complete product database (1,300+ SKUs)
- Technical specifications & PDFs
- Thread/fitment compatibility charts
- Pricing tiers & bulk discounts
- Customer service scripts

**The Result:**
- Grace cites your proprietary data.
- Never invents specifications.
- Answers technical questions instantly.
- Saves support staff hours daily.
- Consistent brand voice 24/7.

**Execution Slide Summary: Gap Logic**
- **Inventory Accuracy:** Grace requires precise, real-time stock counts to prevent overselling and intelligent backorder management.
- **Structured Material:** Explicit "Glass vs. Plastic" data is needed to enable accurate search filtering rather than relying on text guessing.
- **Color Precision:** Structured data must separate "Bottle Color" from "Cap Color" to prevent Grace from visualizing the wrong product combinations.
- **Weight & Freight:** Accurate unit and case weights are non-negotiable for calculating shipping costs and pallet configurations.
- **Neck Compatibility:** Strictly standardized "Neck Finish" data (e.g., 18-415) is required to ensure Grace never recommends a cap that doesn't fit.
- **Case Configuration:** B2B pack sizes (e.g., 144/case) must be explicitly defined to handle bulk pricing and case-vs-unit logic correctly.

**The Data Reality Check:**
- **Current State:** We have **9,555** technical data points (1,365 Products × 7 Dimensions).
- **Required State:** Grace needs **~27,300** data points to function autonomously (1,365 Products × 20 Dimensions).
- **The Gap:** We are missing **~65%** of the foundational data needed for AI reliability.
- **Timeline:** 14 days

---

## SLIDE 5 - PIPELINE INTRO
**Header:** SECTION 02 • THE IMAGE PIPELINE

**Title:** The Paper Doll Builder
**Subtitle:** From PSD to Dynamic Configurator
**Description:** A complete automated workflow that transforms static Photoshop files into interactive, CMS-managed product components.

**Flow:**
PSD → Export → Supabase → AI Upscale → Sanity → Live

---

## SLIDE 6 - PIPELINE DETAIL
**Header:** AUTOMATED ASSET PIPELINE

**Title:** The Complete Data Journey

**STEP 1: PSD Files**
Layered files with bottle, cap-black, cap-white separated.

**STEP 2: Layer Export**
Node.js script extracts each layer as transparent PNG.

**STEP 3: Supabase**
Cloud storage with public URLs, organized by SKU.

**STEP 4: AI Upscale**
2x enhancement for retina displays.

**STEP 5: Sanity CMS**
Components linked with references.

**Naming Convention:**
- Files named by SKU: `RO9ML-CLR-001.psd`
- Output: `RO9ML-CLR-001_Bottle.png`

**The "Paper Doll" Effect:**
Frontend stacks layers using `layerImage` + `assemblyOffsetY` for perfect positioning.

**Restoration, Not Generation:**
We don't create fake bottles. AI upscaling enhances your existing photography for modern displays.

---

## SLIDE 7 - SANITY CMS
**Header:** SECTION 03 • CMS

**Title:** Sanity: Your Website's Remote Control
*[Visual: Mock of Sanity Studio interface with hero banner editor]*

**Real-Time Agility:**
Launch a campaign in 3 clicks. Total control over the marketing layer without touching code.

**Scheduled Publishing:**
Set your seasonal drops to go live automatically. Plan Black Friday a month in advance.

**No New Tools for Your Team:**
Sanity Studio is browser-based. Simpler than Shopify's backend for content updates.

**Division of Labor:**
- **What You Can Control:** Banners, hero images, featured products, blog posts, announcements, promotional text.
- **Shopify handles:** Inventory, orders, checkout, payments.
- **Sanity handles:** Content, marketing, experience.

---

## SLIDE 8 - HEADLESS ARCHITECTURE
**Header:** SECTION 04 • ARCHITECTURE

**Title:** The Harmony of Headless

**1. THE SHOWROOM (Custom Frontend)**
Speed, Customization, Brand Story.

**2. THE VAULT (Shopify Plus Backend)**
Security, Inventory, Transactions.

**Shopify is the Vault:**
All the heavy lifting: inventory, orders, checkout, payments, security. The backend you already know.

**The Site is the Showroom:**
Custom frontend built with React/Hydrogen. Beautiful, fast, completely unique to Best Bottles.

**They Talk via API:**
Update a product in Shopify → It appears on the site instantly. No manual syncing. No double entry.

**Traffic Handling:**
The frontend doesn't bear traffic weight — it's hosted on Vercel's global edge network. 10,000 visitors? Traffic is distributed globally.

*Massive brands like Allbirds, Staples, and Gymshark use this exact architecture.*

---

## SLIDE 9 - COMPARISON
**Header:** THE COMPARISON

**Title:** Templates vs. Custom: What You Actually Get

**Shopify Template Theme:**
- Limited to template layouts and sections
- Product configurator? Requires expensive apps
- AI assistant? Third-party integration headaches
- Same look as 10,000 other stores
- Complex B2B logic? Custom Liquid coding
- Page speed limited by theme bloat

**Custom Headless (Ours):**
- **Complete design freedom** — any layout, any interaction
- **Native Paper Doll configurator** built in
- **Grace AI integrated seamlessly**
- **Unique brand experience** — nobody looks like you
- **B2B logic**, license verification, tiered pricing native
- **90+ Lighthouse score**, sub-second load times

**What You Keep (Shopify Backend):**
- Product & inventory management
- Order processing & fulfillment
- Shopify's world-class checkout
- Payment processing & security
- Shopify Plus Launchpad for sales
- All your existing apps & integrations

*You get the best of both worlds: custom experience + familiar backend operations.*

---

## SLIDE 10 - B2B PORTAL
**Header:** SECTION 05 • B2B LOGIC

**Title:** Customer Portal & Business License Verification
*[Visual: Mock of customer account dashboard showing verified business status]*

**Example Account: ABC Fragrances LLC**
- ✓ Verified Business
- 47 Total Orders
- $12.4K YTD Spend
- Tier 3 Pricing Level

**Feature Highlights:**
- **Business License Upload:** Customers upload their license. You verify offline. Once approved, they're tax-exempt for the license validity period.
- **One-Time Verification:** No repeated requests. Verified businesses stay verified until license expiration with automatic reminders.
- **Consumer Fallback:** No business license? Standard address-based sales tax via Shopify's existing tax logic.
- **Order History & Tracking:** Past orders, reorder functionality, shipment tracking — all in one dashboard.

---

## SLIDE 11 - SHIPPING
**Header:** SECTION 06 • LOGISTICS

**Title:** Weight-Based Shipping Calculation
**Formula:** `Σ Product Weights + Est. Packaging = Total Ship Weight → FedEx API`

**Large Order Example: 95 LBS TOTAL**
`Box 1 (40 lbs)` + `Box 2 (40 lbs)` + `Box 3 (15 lbs)`

- **Orders over 40 lbs** automatically split into multiple packages for optimal FedEx rates.
- **Database-Driven Weights:** Each SKU has a weight stored in the product database. Accurate to the ounce.
- **Packaging Estimate:** Standard packaging material weight added automatically based on order size.
- **Real-Time FedEx Rates:** Multi-package shipments sent to FedEx API for accurate, live pricing at checkout.
- **Shopify + Headless Compatibility:** Calculation runs on checkout via Shopify's carrier-calculated shipping — works natively with headless setup.

*Same shipping logic you have today — just integrated with the new frontend.*

---

## SLIDE 12 - LONGEVITY
**Header:** ADDRESSING YOUR CONCERNS

**Title:** No Black Boxes — You Own Everything
*What happens if Jordan moves on? Here's the answer:*

**Source Code Repository:**
Complete codebase, version controlled. Full Git repository with entire project history. Any React developer can pick this up.

**System Manual:**
Complete documentation package. Architecture docs, component guides, deployment procedures, API references.

**Built on Industry-Standard Technology:**
`React` `TypeScript` `Vercel` `Sanity` `Hydrogen` `Supabase`

**Handover Package Includes:**
- Admin training videos
- Environment setup guides
- Deployment runbooks
- Ongoing support options

*This isn't a proprietary system you're locked into — it's your asset, built on technology that will be supported for decades.*

---

## SLIDE 13 - OPERATIONS
**Header:** DAY-TO-DAY OPERATIONS

**Title:** Simple for Your Team, Powerful for Your Business

**Shopify Admin (Same as Always):**
*What your team does in Shopify:*
- Add/edit products & inventory
- Process & fulfill orders
- Manage customer accounts
- Set up discounts & promotions
- View reports & analytics
- **No retraining required — same admin you know**

**Sanity CMS (Content Updates):**
*New tool, but designed for ease:*
- Update homepage banners
- Edit promotional messaging
- Schedule content in advance
- Drag-and-drop image uploads
- Live preview before publishing
- **Training video library provided**

**The Magic: Auto-Sync**
Changes flow automatically:
- **Shopify:** Price update on SKU-1234 → Instantly reflects on website
- **Sanity:** New banner uploaded → Live in seconds, no deploy
- **Grace:** New product added → Learns it overnight

*Two tools, clear responsibilities, automatic synchronization. Your team stays productive.*

---

## SLIDE 14 - TIMELINE
**Header:** THE ROADMAP

**Title:** Implementation Timeline

**Phase 1 - Weeks 1-2: Foundation**
- Shopify Plus migration
- Sanity CMS setup
- Grace data collection

**Phase 2 - Weeks 3-5: Core Build**
- Homepage & navigation
- Product pages
- Paper Doll configurator

**Phase 3 - Weeks 6-7: B2B Features**
- Customer Account portal (Business license tracker)
- Tiered pricing logic
- Shipping calculator

**Phase 4 - Week 8-9: Launch Prep**
- QA & testing
- Team training
- Soft launch

**Key Metrics:**
- **10 Weeks** to Launch
- Weekly Progress Check-ins
- Parallel Grace Training
- 30 Days Post-Launch Support

---

## SLIDE 15 - NEXT STEPS (PART 1)
**Header:** THE FOUNDATION & THE "FAST TRACK"

**Goal:** Establish the immediate priority (Data) and explain the smart shortcut for inventory.

**Title:** Ready to Transform Best Bottles? (Phase 1)
**Subtitle:** Immediate Next Steps: Data Acquisition

**[Left Column: The Strategic Goal]**
**Stage 1: Data Acquisition (The "Unlock")**
- **Action:** Work with Abbas and Kevin to collect and validate data for Grace’s training.
- **Key Deliverable:** A signed-off "Master Data Set" for all product details.
- **Success Criteria:** Every weight, dimension, and stock count is confirmed accurate.

**[Right Column: The "Fast Track" Methodology]**
*(Distinctive Box/Border)*
**The "Fast Track" Inventory Logic**
- **The Problem:** Manually counting 1,365 SKUs is slow, inefficient, and error-prone.
- **The Shortcut:** Your product, bottle, fitment, and cap schemas ALL already contain Shopify ID fields.
- **The Action:** We will script a connection that automates the process:
    1. Pull the live `inventory_quantity` directly from Shopify.
    2. Map it instantly to the Sanity `inStock` and `minOrderQuantity` fields.

---

## SLIDE 16 - NEXT STEPS (PART 2)
**Header:** THE BUILD & THE PAYOFF

**Title:** Ready to Transform Best Bottles? (Phase 2 & 3)
**Subtitle:** Systemization, AI Integration & Outcomes

**[Top Row: The Roadmap]**

**Stage 2: Systemization (The "Backbone")**
- **Action:** Define cross-reference logic & validate "Paper Doll" architecture.
- **Visuals:** Execute manual component image work.
- **CMS:** Programmatically inject clean data into Sanity Studio.
- **Key Deliverable:** A fully populated Sanity backend and functioning visualizer architecture.

**Stage 3: AI Integration (The "Brain")**
- **Action:** The final programming of Grace once the clean data foundation is laid.
- **Key Deliverable:** Grace cites your proprietary data, never invents specifications, and answers technical questions instantly.

**[Bottom Row: The ROI (The "Why")]**
- ✓ **AI Product Expert** working 24/7
- ✓ **Visual Configurator** (The "Paper Doll" advantage)
- ✓ **B2B Features** built specifically for your workflow
- ✓ **Shopify Plus Power + Sanity.io Freedom**

*Retain the checkout you trust, but gain the unrestricted speed to design, edit, and scale without limits.*

---

## SLIDE 17 - FUTURE HORIZON: INTERNATIONALIZATION
**Header:** GLOBAL SCALING

**Title:** Frictionless Global Scaling
**Subtitle:** One Backend. Infinite Markets.

**The Strategy:**
- **Sanity.io Internationalization:** Unlike standard Shopify themes that require cloning stores for different regions, Sanity allows us to manage France, Spain, Morocco, and beyond from a single "Master Data" source.
- **Field-Level Localization:** We don't just translate buttons. We can tailor product descriptions, currencies, and cultural nuances for specific markets (e.g., specific bottle uses popular in Morocco vs. France) without technical debt.

**The Value:**
- Launch new regions in days, not months.
- **0% increase** in infrastructure complexity as you scale.

---

## SLIDE 18 - GRACE PHASE 2
**Header:** THE CONCIERGE

**Concept:** Moving Grace from a "Chatbot" to an "Internal Agent" (Action-based AI).

**Title:** The Evolution of Grace: From Assistant to Agent
**Subtitle:** "The Website That Drives Itself"

**The Vision:**
- **Conversational Navigation:** Instead of forcing a user to filter menu --> glass --> amber --> 2oz, the user simply tells Grace what they need.
- **The "Zero-Click" Experience:**
    - *Customer:* "I need a 2oz amber bottle for essential oils."
    - *Grace:* "I found the perfect Boston Round match. Taking you there now." (Grace automatically redirects the user's browser to the specific Product Detail Page).
- **Cross-Sell Logic:** Grace can intelligently suggest matching caps/fitments and move the user to the accessory page instantly.

**The Value:**
- **Reduced Bounce Rate:** Customers never get lost in the navigation.
- **Higher AOV (Average Order Value):** Grace acts as a proactive sales rep, not a passive search bar.

---

## SLIDE 19 - MADISON STUDIO (CONTENT ENGINE)
**Header:** THE CREATIVE ENGINE

**Title:** Stage 4: Madison Studio (The "Voice")
**Subtitle:** Infinite Content Scaling

**The Problem:**
Manual copywriting bottlesneck. You can't write unique, SEO-rich descriptions for 1,300 SKUs by hand without hiring an army.

**The Solution:**
Madison mimics your brand's voice (modeled on legendary copywriters) and fuses it with the clean Master Data from Stages 1-2.

**Action:**
Train your team to use Madison to auto-generate:
- Product Descriptions (Technical yet persuasive)
- Blog Posts (Educational content for SEO)
- Ad Copy (High-converting social hooks)

**Key Deliverable:**
An internal marketing team empowered to produce **infinite, technically accurate, on-brand marketing assets at scale.**

---

## SLIDE 20 - THE "HIDDEN" MULTIPLIERS
**Header:** BEYOND THE BUILD

**Title:** Two Strategic Multipliers

**1. Programmatic SEO Dominance**
- **The Insight:** Your current data has manual SEO fields.
- **The Upgrade:** With Grace + Sanity, we don't write SEO tags manually. Grace analyzes the technical specs (height, neck finish, material) and auto-generates thousands of unique, high-ranking landing pages for long-tail keywords (e.g., "20-400 neck finish amber glass wholesale").
- **Result:** Dominate search results for technical queries without lifting a finger.

**2. Predictive B2B Reordering**
- **The Insight:** Wholesale buyers follow patterns.
- **The Upgrade:** We can implement a "Smart Dashboard" for repeat clients. Grace analyzes their past order cadence and creates a "One-Click Reorder" cart ready for them before they even run out of stock.
- **Result:** You become the easiest vendor to buy from, locking in customer loyalty.

---

## SLIDE 21 - CLOSING
**Header:** CONCLUSION

**Final Closing Statement:**
"We aren't just building a new website. We are building an intelligent engine that scales your data, speaks every language, and actively sells your product."

**Subtitle:** "From catalog to premium digital experience"

**Footer:**
**Asala.ai + Best Bottles Partnership**
Jordan Richter • jordan@asala.ai
