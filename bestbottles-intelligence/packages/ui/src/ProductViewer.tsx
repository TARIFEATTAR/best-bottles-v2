import React from 'react';
import Image from 'next/image';
import { SanityImageObject } from '@sanity/image-url/lib/types/types';
import { urlFor } from './sanityImage';

export interface AlignmentConfig {
  xOffset?: number;
  yOffset?: number;
  scale?: number;
}

export interface ProductViewerProps {
  baseImage: SanityImageObject | string | null;
  fitmentImage?: SanityImageObject | string | null;
  capImage?: SanityImageObject | string | null;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  alignment?: AlignmentConfig;
  className?: string;
}

/**
 * ProductViewer - Code-based image stacking component
 * 
 * Renders product images in layers:
 * - Layer 1 (bottom): baseImage
 * - Layer 2 (middle): fitmentImage (optional)
 * - Layer 3 (top): capImage (optional)
 * 
 * All images are absolutely positioned within a fixed aspect-ratio container
 * to ensure consistent stacking without ghosting or misalignment.
 */
export function ProductViewer({
  baseImage,
  fitmentImage,
  capImage,
  aspectRatio = 'square',
  alignment,
  className = '',
}: ProductViewerProps) {
  // Use inline styles for aspect ratio to avoid Tailwind purging issues
  const aspectPadding = {
    square: '100%',      // 1:1
    portrait: '133.33%', // 4:3 (height > width)
    landscape: '75%',    // 3:4 (width > height)
  }[aspectRatio];

  const baseImageUrl = baseImage
    ? typeof baseImage === 'string'
      ? baseImage
      : urlFor(baseImage).width(2000).height(2000).url()
    : null;

  const fitmentImageUrl =
    fitmentImage && fitmentImage !== null
      ? typeof fitmentImage === 'string'
        ? fitmentImage
        : urlFor(fitmentImage).width(2000).height(2000).url()
      : null;

  const capImageUrl =
    capImage && capImage !== null
      ? typeof capImage === 'string'
        ? capImage
        : urlFor(capImage).width(2000).height(2000).url()
      : null;

  if (!baseImageUrl) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: aspectPadding,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#9ca3af', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          No base image
        </span>
      </div>
    );
  }

  // Build transform style from alignment config
  const buildTransformStyle = (): React.CSSProperties => {
    if (!alignment) return {};

    const transforms: string[] = [];
    const translateX = alignment.xOffset ?? 0;
    const translateY = alignment.yOffset ?? 0;
    const scale = alignment.scale ?? 1;

    if (translateX !== 0 || translateY !== 0) {
      transforms.push(`translate(${translateX}px, ${translateY}px)`);
    }
    if (scale !== 1) {
      transforms.push(`scale(${scale})`);
    }

    return transforms.length > 0
      ? { transform: transforms.join(' ') }
      : {};
  };

  const transformStyle = buildTransformStyle();

  // Container style with explicit aspect ratio
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: aspectRatio === 'square' ? '1 / 1' : aspectRatio === 'portrait' ? '3 / 4' : '4 / 3',
  };

  // Layer style for absolute positioning
  const layerStyle = (zIndex: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex,
    ...transformStyle,
  });

  return (
    <div className={className} style={containerStyle}>
      {/* Layer 1: Base (bottom) */}
      {baseImageUrl && (
        <div style={layerStyle(10)}>
          <Image
            src={baseImageUrl}
            alt="Product base"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
      )}

      {/* Layer 2: Fitment (middle) */}
      {fitmentImageUrl && (
        <div style={layerStyle(20)}>
          <Image
            src={fitmentImageUrl}
            alt="Product fitment"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Layer 3: Cap (top) */}
      {capImageUrl && (
        <div style={layerStyle(30)}>
          <Image
            src={capImageUrl}
            alt="Product cap"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
    </div>
  );
}

