import { defineQuery } from 'next-sanity'

/**
 * GROQ QUERIES FOR BEST BOTTLES
 * 
 * These queries fetch the layered images for the "Exploded View" component stack.
 */

// ============ IMAGE FRAGMENT ============
// Reusable fragment for image fields
const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { 
      lqip, 
      dimensions { width, height, aspectRatio }
    }
  },
  hotspot,
  crop
`

// ============ COMPONENT QUERIES ============

// Get all bottles (for selector UI)
export const BOTTLES_QUERY = defineQuery(/* groq */ `
  *[_type == "bottle"] | order(name asc) {
    _id,
    name,
    sku,
    color,
    capacity,
    price,
    layerImage { ${imageFragment} },
    previewSwatch { ${imageFragment} }
  }
`)

// Get all fitments (for selector UI)
export const FITMENTS_QUERY = defineQuery(/* groq */ `
  *[_type == "fitment"] | order(name asc) {
    _id,
    name,
    sku,
    type,
    material,
    assemblyOffsetY,
    price,
    layerImage { ${imageFragment} },
    previewSwatch { ${imageFragment} }
  }
`)

// Get all caps (for selector UI)
export const CAPS_QUERY = defineQuery(/* groq */ `
  *[_type == "cap"] | order(name asc) {
    _id,
    name,
    sku,
    color,
    style,
    assemblyOffsetY,
    price,
    layerImage { ${imageFragment} },
    previewSwatch { ${imageFragment} }
  }
`)

// Get all backgrounds (for selector UI)
export const BACKGROUNDS_QUERY = defineQuery(/* groq */ `
  *[_type == "background"] | order(name asc) {
    _id,
    name,
    style,
    showMeasurements,
    backgroundImage { ${imageFragment} }
  }
`)

// ============ PRODUCT QUERIES ============

// Get all products (listing page)
export const PRODUCTS_QUERY = defineQuery(/* groq */ `
  *[_type == "product"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    category,
    price,
    inStock,
    assembledImage { ${imageFragment} },
    visualStack {
      baseLayer->{ name, layerImage { ${imageFragment} } },
      capLayer->{ name, layerImage { ${imageFragment} } }
    }
  }
`)

// Get single product by slug (with FULL visual stack for exploded view)
export const PRODUCT_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    category,
    price,
    inStock,
    minOrderQuantity,
    shopifyProductId,
    seoTitle,
    seoDescription,
    assembledImage { ${imageFragment} },
    
    // THE VISUAL STACK - All 4 Layers Expanded
    visualStack {
      // Layer 1: Background (Z-Index 0)
      backgroundLayer->{
        _id,
        name,
        style,
        showMeasurements,
        backgroundImage { ${imageFragment} }
      },
      
      // Layer 2: Bottle/Glass Body (Z-Index 1)
      baseLayer->{
        _id,
        name,
        sku,
        color,
        capacity,
        price,
        shopifyVariantId,
        layerImage { ${imageFragment} },
        previewSwatch { ${imageFragment} }
      },
      
      // Layer 3: Fitment/Mechanism (Z-Index 2)
      fitmentLayer->{
        _id,
        name,
        sku,
        type,
        material,
        assemblyOffsetY,
        price,
        shopifyVariantId,
        layerImage { ${imageFragment} },
        previewSwatch { ${imageFragment} }
      },
      
      // Layer 4: Cap (Z-Index 3)
      capLayer->{
        _id,
        name,
        sku,
        color,
        style,
        assemblyOffsetY,
        price,
        shopifyVariantId,
        layerImage { ${imageFragment} },
        previewSwatch { ${imageFragment} }
      }
    }
  }
`)

// Count queries for pagination
export const PRODUCTS_COUNT_QUERY = defineQuery(/* groq */ `
  count(*[_type == "product"])
`)

export const BOTTLES_COUNT_QUERY = defineQuery(/* groq */ `
  count(*[_type == "bottle"])
`)

export const CAPS_COUNT_QUERY = defineQuery(/* groq */ `
  count(*[_type == "cap"])
`)

export const FITMENTS_COUNT_QUERY = defineQuery(/* groq */ `
  count(*[_type == "fitment"])
`)

