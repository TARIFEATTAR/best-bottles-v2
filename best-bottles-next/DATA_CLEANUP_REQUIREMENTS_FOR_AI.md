# Data Cleanup Requirements for AI Integration
## Executive Summary for Best Bottles Founders

**Date:** January 11, 2026  
**Prepared By:** Technical Development Team  
**Subject:** Critical Data Preparation Needed Before AI Agent ("Grace") Can Operate Effectively

---

## The Bottom Line

Your product data is currently stored across **19 separate spreadsheets** with **inconsistent formats**. Before Grace (the AI sales agent) can accurately answer customer questions about your 2,000+ products, this data must be **cleaned, standardized, and consolidated** into a single source of truth.

**Without this cleanup, Grace will:**
- Give incorrect product information to customers
- Fail to find products that exist in your catalog
- Confuse product attributes (e.g., saying a blue bottle is red)
- **Break the "Paper Doll" Product Visualizer** (Dynamic canvas sizing relies on accurate height data)
- Damage customer trust and your brand reputation


---

## Executive Slide Summary: Gap Logic
*Ideal for a single presentation slide to stakeholders.*

**Critical Missing Dimensions (One-Line Descriptions):**
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

---

## Current State of Your Data (The Problem)

### What We Found

| Issue | Description | Impact on AI |
|-------|-------------|--------------|
| **19 Separate Files** | Product data is scattered across 19 different spreadsheets | AI cannot efficiently search or cross-reference |
| **No Consistent Headers** | Some files use "SKU", others use "Item Code", others use "Inventory ID" | AI cannot reliably identify products |
| **Mixed Data in Columns** | Some "Color" columns contain full product descriptions instead of just "Blue" or "Red" | AI extracts garbage data |
| **Missing Header Rows** | Some files have 3-20 rows of "notes" before the actual data starts | AI reads notes as products |
| **Inconsistent Capacities** | Same product might be listed as "5 ml", "5ml", "5ML", or just "5" | AI treats these as different products |
| **Duplicate Entries** | Same product appears in multiple files with slight variations | AI may show conflicting information |

### Visual Example of the Problem

**File A (Roll-Ons):**
| Inventory ID | Color | Capacity |
|--------------|-------|----------|
| GB5mlClrRoll | Clear | 5ml |

**File B (Sprayers):**
| Item Code | Glass Color | Size (ML) |
|-----------|-------------|-----------|
| GB5mlClrSpray | Clr | 5 |

**File C (Atomizers):**  
*(First 5 rows are notes about "Column Complete" status, not actual data)*

These three files describe similar products but use completely different column names, abbreviations, and structures. An AI cannot reconcile these without human intervention.

---

## What Needs to Happen (The Solution)

### Phase 1: Data Audit & Mapping (Estimated: 2-4 hours)
A human must review each of the 19 files and identify:
- Which row contains the actual headers
- What each column maps to in a standard schema
- Which files can be safely merged

### Phase 2: Create a Master Schema (Estimated: 1 hour)
Define ONE standard format that all products must follow:

| Field Name | Type | Required | Example |
|------------|------|----------|---------|
| SKU | Text | Yes | GB5mlClrRollBlk |
| Product_Name | Text | Yes | 5ml Clear Roll-On with Black Cap |
| Category | Text | Yes | Roll-On Bottles |
| Material | Text | Yes | Glass |
| Color | Text | Yes | Clear |
| Capacity_ML | Number | Yes | 5 |
| Cap_Color | Text | No | Black |
| Cap_Type | Text | No | Screw Cap |
| Applicator | Text | No | Plastic Roller Ball |
| Price_1pc | Currency | No | $0.85 |
| Price_Bulk | Currency | No | $0.45 |
| Product_URL | URL | No | bestbottles.com/product/... |
| Image_URL | URL | No | bestbottles.com/images/... |

### Phase 3: Data Migration & Cleanup (Estimated: 4-8 hours)
- Manually or semi-automatically convert all 19 files into the master schema
- Resolve duplicates and conflicts
- Verify data accuracy through spot-checks

### Phase 4: Quality Assurance (Estimated: 2 hours)
- Run automated checks for missing required fields
- Validate that all SKUs are unique
- Confirm URLs are valid and images exist


### Phase 5: Visual Architecture Calibration (Paper Doll Testing)
**CRITICAL NEW REQUIREMENT:**
The new "Paper Doll" Product Visualizer does **not** use a universal canvas size. Instead, the canvas dynamically resizes based on the bottle's physical height to ensure the user experience is realistic (e.g., a 100ml bottle looks significantly larger than a 5ml bottle).

**Data Prerequisite:**
- Every Bottle SKU must have an accurate `Height_Total` and `Width` value.
- Without these values, the visualizer canvas cannot calculate the correct aspect ratio, leading to distorted or "floating" products.
- **Testing Requirement:** We must test a range of canvas sizes against the cleaned data to ensure the dynamic resizing logic handles all bottle extremes (from tiny vials to large jars).

---

## Realistic Timeline: The 2-Week Foundation Sprint

Given that **65% of the data is missing** (specifically physical weights and dimensions), this is no longer just a "cleanup" task—it is a **data creation** task. We cannot write utilizing data that does not exist.

### **Phase 1: Physical Master Calibration (Days 1-3)**
*   **The Task:** We do not need to weigh 1,365 bottles. We need to identify and weigh the **~150 unique molds** (e.g., "5ml Blue Roll-on" weighs the same as "5ml Clear Roll-on").
*   **Action:**
    *   Pull 1 physical sample of every unique bottle shape and cap type.
    *   Measure: Weight, Height, Width, Neck Finish.
    *   Record into a temporary "Master Specs" sheet.
*   **Time:** ~12-16 Hours (Manual effort).

### **Phase 2: Digital Propagation (Days 4-7)**
*   **The Task:** Map the ~150 Master Specs to the 1,365 SKUs using a script.
*   **Action:**
    *   Run script: "If SKU contains '5ml' and 'Roll-on', apply Weight = 8g".
    *   Fill in gaps: Manually fix the 10-20% of products that don't fit the rules.
*   **Time:** ~20 Hours (Engineering & Data Entry).

### **Phase 3: The "Brand Brain" Tuning (Days 8-10)**
*   **The Task:** Teach Grace the soft skills (Policies, Voice, Tone) alongside the hard data.
*   **Action:**
    *   Ingest the new "Clean Master CSV".
    *   Train on `BRAND_GUIDELINES.md` and `Grace_KB_FAQ.md`.
    *   Run 50+ test questions to verify she doesn't hallucinate.
*   **Time:** ~8-12 Hours.

### **Total Estimated Project Duration:** 
*   **Aggressive Sprint:** 1 Week (Requires dedicated full-time staff).
*   **Realistic Pace:** 2 Weeks (Allows for normal business operations).

---

---

## What We've Already Done

1. ✅ **Ingested all 19 files** and analyzed their structures
2. ✅ **Created a prototype Master CSV** with 1,257 product records
3. ✅ **Built the FAQ Knowledge Base** (`Grace_KB_FAQ.md`) covering policies, shipping, and product guidance
4. ⚠️ **Identified data quality issues** that prevent full accuracy

---

## Proposed Workflow: The 3-Stage Integration

We have refined the plan into three distinct stages to ensure maximum accuracy and efficiency.

### **Stage 1: Data Acquisition (The "Unlock")**
*   **Action:** Work with **Abbas and Kevin** to collect and validate data for Grace’s training.
*   **Key Deliverable:** A signed-off "Master Data Set" where every weight, dimension, and stock count is confirmed accurate.

### **Stage 2: Systemization (The "Backbone")**
*   **Action:**
    *   Define the creation of cross-reference logic and validate the "Paper Doll" architecture.
    *   **Visuals:** Execute the manual work required for the component images.
    *   **CMS:** Programmatically set up all products at scale and inject clean data into **Sanity Studio**.
    *   **Fast-Track:** Sync live inventory counts directly from **Shopify** (using `shopifyProductId` and `shopifyVariantId`) to bypass manual counting for existing SKUs.
*   **Key Deliverable:** A fully populated Sanity backend and a functioning visualizer architecture.

### **Stage 3: AI Integration (The "Brain")**
*   **Action:** The final step of programming Grace once the clean data foundation is laid.
*   **Key Deliverable:** Grace cites your proprietary data, never invents specifications, and answers technical questions instantly.

### **Stage 4: Madison Studio (The "Voice")**
*   **Action:** Train your internal team on **Madison** to scale content creation. Madison simulates your 8 legendary copywriters using the new "Master Data" to generate accurate product descriptions, blogs, and ad copy instantly.
*   **Key Deliverable:** An internal team empowered to produce infinite, technically accurate, on-brand marketing assets at scale.

---

---

## Questions?

We're happy to walk through any of this in more detail. The goal is simple: **clean data in, accurate AI out**. Without the cleanup, Grace will be unreliable—and an unreliable AI is worse than no AI at all.

---

*"AI is only as good as the data it learns from."*
