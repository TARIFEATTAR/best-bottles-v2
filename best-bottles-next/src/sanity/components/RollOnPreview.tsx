/**
 * ROLL-ON EXPLODED VIEW PREVIEW
 * 
 * ============================================================
 * PURPOSE: Visual Editing Component for Sanity Studio
 * ============================================================
 * 
 * This component renders the three image layers in a stacked
 * configuration so you can verify the "Exploded View" alignment
 * directly in the Studio dashboard.
 * 
 * LAYER STACK:
 *   ┌─────────────────────────────────────┐
 *   │  [ Z-Index 3 ] ── Cap (Top)         │
 *   │  [ Z-Index 2 ] ── Fitment (Middle)  │
 *   │  [ Z-Index 1 ] ── Glass (Bottom)    │
 *   └─────────────────────────────────────┘
 * 
 * USAGE: This is used as a custom preview in the Studio structure.
 * 
 * ============================================================
 */

import React from 'react'
import { useClient } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'

// Types for the composition object
interface ImageWithOffset {
  asset?: {
    _ref: string
  }
  alt?: string
  offsetY?: number
  hotspot?: {
    x: number
    y: number
  }
}

interface Composition {
  baseGlass?: ImageWithOffset
  fitmentComponent?: ImageWithOffset
  capComponent?: ImageWithOffset
}

interface RollOnPreviewProps {
  document: {
    displayed: {
      title?: string
      composition?: Composition
    }
  }
}

export function RollOnPreview(props: RollOnPreviewProps) {
  const { document } = props
  const { title, composition } = document.displayed || {}
  
  // Get Sanity client for image URL building
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)
  
  // Helper to build image URLs
  const urlFor = (source: ImageWithOffset | undefined) => {
    if (!source?.asset?._ref) return null
    return builder.image(source).width(300).url()
  }
  
  // Extract layer data
  const baseGlassUrl = urlFor(composition?.baseGlass)
  const fitmentUrl = urlFor(composition?.fitmentComponent)
  const capUrl = urlFor(composition?.capComponent)
  
  // Get offsets (default to 0)
  const fitmentOffsetY = composition?.fitmentComponent?.offsetY || 0
  const capOffsetY = composition?.capComponent?.offsetY || 0

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{title || 'Untitled Roll-On'}</h2>
        <p style={styles.subtitle}>Exploded View Preview</p>
      </div>
      
      {/* The Visual Stack Container */}
      <div style={styles.stackContainer}>
        <div style={styles.stack}>
          
          {/* Layer 1: Base Glass (Z-Index 1) */}
          {baseGlassUrl ? (
            <div style={{ ...styles.layer, zIndex: 1, bottom: 0 }}>
              <img 
                src={baseGlassUrl} 
                alt={composition?.baseGlass?.alt || 'Glass bottle'} 
                style={styles.layerImage}
              />
              <span style={styles.layerLabel}>🔵 Glass (Z:1)</span>
            </div>
          ) : (
            <div style={{ ...styles.placeholder, bottom: 0 }}>
              <span>🔵 Upload Base Glass</span>
            </div>
          )}
          
          {/* Layer 2: Fitment (Z-Index 2) */}
          {fitmentUrl ? (
            <div style={{ 
              ...styles.layer, 
              zIndex: 2, 
              top: '35%',
              transform: `translateY(${fitmentOffsetY}px)`
            }}>
              <img 
                src={fitmentUrl} 
                alt={composition?.fitmentComponent?.alt || 'Fitment'} 
                style={{ ...styles.layerImage, maxHeight: '80px' }}
              />
              <span style={styles.layerLabel}>⚙️ Fitment (Z:2)</span>
            </div>
          ) : (
            <div style={{ ...styles.placeholder, top: '35%' }}>
              <span>⚙️ Upload Fitment</span>
            </div>
          )}
          
          {/* Layer 3: Cap (Z-Index 3) */}
          {capUrl ? (
            <div style={{ 
              ...styles.layer, 
              zIndex: 3, 
              top: '10%',
              transform: `translateY(${capOffsetY}px)`
            }}>
              <img 
                src={capUrl} 
                alt={composition?.capComponent?.alt || 'Cap'} 
                style={{ ...styles.layerImage, maxHeight: '60px' }}
              />
              <span style={styles.layerLabel}>🔘 Cap (Z:3)</span>
            </div>
          ) : (
            <div style={{ ...styles.placeholder, top: '10%' }}>
              <span>🔘 Upload Cap</span>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Layer Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
          <span>Base Glass (Bottom)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
          <span>Fitment (Middle)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />
          <span>Cap (Top)</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div style={styles.instructions}>
        <p>📌 <strong>How to test:</strong></p>
        <ol style={styles.instructionsList}>
          <li>Upload your 3 test images (Blue Glass, Metal Ball, Silver Cap)</li>
          <li>Images should be transparent PNGs</li>
          <li>Use the offset fields to fine-tune positioning</li>
          <li>The layers should stack: Glass → Fitment → Cap</li>
        </ol>
      </div>
    </div>
  )
}

// ============================================================
// STYLES
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#1a1a2e',
    minHeight: '100%',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
  stackContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  stack: {
    position: 'relative',
    width: '300px',
    height: '400px',
    backgroundColor: '#0f0f1a',
    borderRadius: '12px',
    border: '2px dashed #333',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  layerImage: {
    maxWidth: '200px',
    objectFit: 'contain',
  },
  layerLabel: {
    fontSize: '10px',
    color: '#666',
    marginTop: '4px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  placeholder: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '16px 24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    border: '1px dashed #444',
    color: '#666',
    fontSize: '12px',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '24px',
    fontSize: '12px',
    color: '#888',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  instructionsList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
    lineHeight: 1.6,
  },
}

export default RollOnPreview

