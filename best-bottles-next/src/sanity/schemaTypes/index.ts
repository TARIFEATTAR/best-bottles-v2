/**
 * BEST BOTTLES SCHEMA TYPES
 * 
 * ============================================================
 * ARCHITECTURE: "EXPLODED VIEW" COMPONENT SYSTEM
 * ============================================================
 * 
 * MVP (Proof of Concept):
 * - productRollOn: The 9ML Roll-On bottle with 3-layer composition
 * 
 * Full System (for scaling to 2,000+ SKUs):
 * - bottle: Reusable glass body components
 * - fitment: Reusable mechanism components (roller, sprayer, dropper)
 * - cap: Reusable cap components
 * - background: Optional backdrop layers
 * - product: Assembled products using references
 * 
 * ============================================================
 */

// MVP Schema (Proof of Concept)
import { productRollOn } from './documents/productRollOn'

// Full Component System (for future scaling)
import { bottle } from './documents/bottle'
import { fitment } from './documents/fitment'
import { cap } from './documents/cap'
import { background } from './documents/background'
import { product } from './documents/product'

export const schemaTypes = [
  // ════════════════════════════════════════════════════════════
  // MVP: 9ML Roll-On (Proof of Concept)
  // ════════════════════════════════════════════════════════════
  productRollOn,
  
  // ════════════════════════════════════════════════════════════
  // Full Component System (for 2,000+ SKU scaling)
  // ════════════════════════════════════════════════════════════
  bottle,
  fitment,
  cap,
  background,
  product,
]

