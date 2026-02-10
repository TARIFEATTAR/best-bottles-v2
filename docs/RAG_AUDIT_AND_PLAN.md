# Best Bottles RAG System Audit & Upgrade Plan

## (A) Status Report: What Exists

### 1. **RAG Pipeline**
- **State**: Functional end-to-end pipeline (Scrape -> Normalize -> Enrich -> Embed -> Retrieve -> Chat).
- **Components**:
  - **Ingestion**: Browserless-based crawler for Products and Content (FAQ, Guides).
  - **Processing**: Normalization (`zod` schemas), Enrichment (Regex-based use-case/closure detection).
  - **Vector Store**: In-memory `VectorStore` with hybrid search (Cosine Similarity + Keyword).
  - **Embeddings**: OpenAI `text-embedding-3-small`.
  - **Chat**: GPT-4-Turbo with context injection and history.

### 2. **Data Assets**
- **Products**: 485 SKUs enriched with basic metadata (Capacity, Dimensions, Closure Type, Use Cases).
- **Content**: FAQs, Contact Info, Services, and Guides are indexed.
- **Taxonomy**: Hybrid ML/Rule-based classification system.

### 3. **Current Capabilities**
- Can answer general questions about product catalog (pricing, capacity, use cases).
- Can answer policy questions (shipping, returns).
- Basic use-case matching (e.g., "bottles for beard oil").

---

## (B) Gap Report: What is Missing

### 1. **Data Gaps (CRITICAL)**
- **Label Data**: **Missing entirely.** No structured data for labels (materials, sizes, compatibility).
- **Bottle Specs**:
  - **Neck Finish**: Present in raw text but not standardized (e.g., "18-415" vs "18/400").
  - **Label Panel**: No dimensions for the printable area of the bottle.
  - **Color/Finish**: Not structured (buried in description).
- **Compatibility**: No logic to link Bottles ↔ Caps ↔ Labels.

### 2. **Embeddings & Retrieval Gaps**
- **Structured Filtering**: Cannot filter by specific dimensions (e.g., "height < 100mm") or neck finish.
- **Label Indexing**: Labels are not indexed, making specific label recommendations impossible.

### 3. **Response Generation Gaps**
- **Label Advice**: Assistant relies on generic "we offer labeling services" FAQ rather than recommending specific label sizes/materials for a bottle.
- **Confidence**: No explicit confidence scoring in the retrieval response.

### 4. **Architecture Gaps**
- **Scalability**: In-memory vector store is fast for <1k items but lacks persistence and advanced filtering capabilities of a dedicated Vector DB (Chroma/Pinecone).
- **Compatibility Engine**: Missing a dedicated logic layer to calculate/verify matches between components.

---

## (C) Recommended RAG Blueprint

### 1. **Architecture Upgrade**
- **Vector DB**: Transition to **ChromaDB** (Local) for persistent storage and metadata filtering.
- **Embeddings**: Continue with `text-embedding-3-small` (1536d).
- **Retrieval Strategy**: "Filter-then-Search"
  1. **Extract constraints** from query (e.g., "30ml", "glass", "dropper").
  2. **Pre-filter** vector space by these metadata tags.
  3. **Semantic Search** within the filtered subset.
  4. **Re-rank** results based on "Compatibility Score" (e.g., does this bottle actually fit the user's mentioned use case?).

### 2. **Ideal Product Schema (Bottles)**
```typescript
{
  sku: string;
  name: string;
  specs: {
    capacity: { ml: number; oz: number; overflow?: number };
    dimensions: { height: number; diameter: number; width?: number };
    neck: { finish: string; type: string }; // e.g., "24-410", "GPI"
    material: string;
    color: string;
    labelPanel: { height: number; circumference: number }; // Critical for labels
  };
  compatibility: {
    closureTypes: string[]; // ["spray", "pump", "cap"]
    viscosityRating: "low" | "medium" | "high"; // inferred from use case
  };
  // ... existing fields
}
```

### 3. **Recommended Label Schema**
Since we cannot scrape this (it doesn't exist on site), we will create a **synthetic reference dataset** of standard label sizes/types for recommendation logic.
```typescript
{
  id: string;
  type: "label-stock";
  material: "BOPP" | "Paper" | "Vinyl";
  finish: "Matte" | "Gloss" | "Soft-touch";
  adhesive: "Permanent" | "Removable";
  compatibility: {
    surfaces: string[]; // ["glass", "plastic"]
    minDiameter: number; // For wrap-around
  };
  applicationNotes: string;
}
```

---

## (D) Implementation Plan

### Phase 1: Schema & Data Upgrade
1.  **Update Schemas**: Modify `src/transform/schemas.js` to include `neck`, `labelPanel`, and `color`.
2.  **Enhance Enrichment**: Update `src/knowledge/enrichProducts.js` to:
    -   Regex parse standardized neck finishes (e.g., `/\d{2}-\d{3}/`).
    -   Infer label panel dimensions (heuristic: ~60% of bottle height).
    -   Extract colors.
3.  **Create Label Knowledge**: Create `src/knowledge/labelData.js` with standard label types and application rules.

### Phase 2: Compatibility Engine
1.  **Create `src/knowledge/compatibility.js`**:
    -   Function: `calculateLabelSize(bottle)` -> returns Max Height / Max Width.
    -   Function: `checkNeckCompatibility(bottle, closure)` -> boolean.

### Phase 3: RAG Pipeline Enhancement
1.  **Update Vector Store**: Refactor `VectorStore` to support metadata filtering on `neck`, `material`, `capacity`.
2.  **Update Query Handler**:
    -   Detect intent: "Labeling question" vs "Product search".
    -   If Labeling: Invoke `compatibility.js` to calculate label size for the referenced bottle.

### Phase 4: Testing
1.  **New Test Cases**: "What size label for the 30ml Boston Round?", "Do you have a pump for a 24-410 neck?"

---

**Next Step:** Begin Phase 1 (Schema & Data Upgrade).














