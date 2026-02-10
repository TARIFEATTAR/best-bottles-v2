// Document types
import { product } from './documents/product'

// Object types
import { productViewerBlock } from './objects/productViewerBlock'
import { glassOption } from './objects/glassOption'
import { capOption } from './objects/capOption'
import { fitmentVariant } from './objects/fitmentVariant'

// Export all schema types for Sanity config
export const schemaTypes = [
  // Documents
  product,
  // Objects
  productViewerBlock,
  glassOption,
  capOption,
  fitmentVariant,
]

// Named exports for direct imports
export { product } from './documents/product'
export { productViewerBlock } from './objects/productViewerBlock'
export { glassOption } from './objects/glassOption'
export { capOption } from './objects/capOption'
export { fitmentVariant } from './objects/fitmentVariant'
