/**
 * EXPLODED VIEW COMPONENT
 * 
 * Renders the layered "Component Stack" for a product.
 * Each layer is positioned absolutely and stacked using z-index.
 * 
 * Layers (bottom to top):
 * - Z-Index 0: Background (architectural grid)
 * - Z-Index 1: Bottle (glass body)
 * - Z-Index 2: Fitment (roller/sprayer mechanism)
 * - Z-Index 3: Cap (top piece)
 */

'use client'

import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

interface LayerImage {
  asset: {
    _id: string
    url: string
    metadata?: {
      dimensions?: {
        width: number
        height: number
      }
    }
  }
}

interface VisualStackProps {
  visualStack: {
    backgroundLayer?: {
      name: string
      backgroundImage: LayerImage
    }
    baseLayer?: {
      name: string
      layerImage: LayerImage
      assemblyOffsetY?: number
    }
    fitmentLayer?: {
      name: string
      layerImage: LayerImage
      assemblyOffsetY?: number
    }
    capLayer?: {
      name: string
      layerImage: LayerImage
      assemblyOffsetY?: number
    }
  }
  width?: number
  height?: number
  className?: string
}

export function ExplodedView({ 
  visualStack, 
  width = 400, 
  height = 600,
  className = ''
}: VisualStackProps) {
  const { backgroundLayer, baseLayer, fitmentLayer, capLayer } = visualStack

  return (
    <div 
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {/* Layer 1: Background (Z-Index 0) */}
      {backgroundLayer?.backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        >
          <Image
            src={urlFor(backgroundLayer.backgroundImage).width(width).height(height).url()}
            alt={backgroundLayer.name || 'Background'}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Layer 2: Bottle/Glass Body (Z-Index 1) */}
      {baseLayer?.layerImage && (
        <div 
          className="absolute inset-0 flex items-end justify-center"
          style={{ zIndex: 1 }}
        >
          <Image
            src={urlFor(baseLayer.layerImage).width(width).url()}
            alt={baseLayer.name || 'Bottle'}
            width={width * 0.6}
            height={height * 0.7}
            className="object-contain"
          />
        </div>
      )}

      {/* Layer 3: Fitment/Mechanism (Z-Index 2) */}
      {fitmentLayer?.layerImage && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            zIndex: 2,
            transform: `translateY(${fitmentLayer.assemblyOffsetY || -50}px)`
          }}
        >
          <Image
            src={urlFor(fitmentLayer.layerImage).width(width).url()}
            alt={fitmentLayer.name || 'Fitment'}
            width={width * 0.3}
            height={height * 0.15}
            className="object-contain"
          />
        </div>
      )}

      {/* Layer 4: Cap (Z-Index 3) */}
      {capLayer?.layerImage && (
        <div 
          className="absolute inset-0 flex items-start justify-center pt-8"
          style={{ 
            zIndex: 3,
            transform: `translateY(${capLayer.assemblyOffsetY || 0}px)`
          }}
        >
          <Image
            src={urlFor(capLayer.layerImage).width(width).url()}
            alt={capLayer.name || 'Cap'}
            width={width * 0.25}
            height={height * 0.12}
            className="object-contain"
          />
        </div>
      )}

      {/* Layer Labels (for debugging/preview) */}
      <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 p-2 rounded" style={{ zIndex: 10 }}>
        <div>🔵 Bottle: {baseLayer?.name || 'None'}</div>
        <div>⚙️ Fitment: {fitmentLayer?.name || 'None'}</div>
        <div>🔘 Cap: {capLayer?.name || 'None'}</div>
      </div>
    </div>
  )
}

