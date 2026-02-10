'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { urlFor } from './sanityImage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SanityImageAsset {
  _id: string;
  url: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface GlassOption {
  _key?: string;
  label: string;
  baseImage: SanityImageAsset | { asset: SanityImageAsset };
}

interface CapOption {
  _key?: string;
  label: string;
  capImage: SanityImageAsset | { asset: SanityImageAsset };
}

interface FitmentVariant {
  _key?: string;
  label: string;
  glassOptions: GlassOption[];
}

export interface ProductConfiguratorProps {
  fitmentVariants: FitmentVariant[];
  capOptions: CapOption[];
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getImageUrl(image: SanityImageAsset | { asset: SanityImageAsset } | null): string | null {
  if (!image) return null;
  
  // If it's already a resolved asset with url
  if ('url' in image && image.url) {
    return image.url;
  }
  
  // If it has an asset property
  if ('asset' in image && image.asset) {
    if ('url' in image.asset) {
      return image.asset.url;
    }
    // Use urlFor for Sanity image references
    try {
      return urlFor(image as any).width(1000).height(1000).url();
    } catch {
      return null;
    }
  }
  
  // Try urlFor as fallback
  try {
    return urlFor(image as any).width(1000).height(1000).url();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProductConfigurator({
  fitmentVariants,
  capOptions,
  aspectRatio = 'square',
  className = '',
}: ProductConfiguratorProps) {
  // ─── State ───────────────────────────────────────────────────────────────
  const [selectedFitmentIndex, setSelectedFitmentIndex] = useState(0);
  const [selectedGlassIndex, setSelectedGlassIndex] = useState(0);
  const [selectedCapIndex, setSelectedCapIndex] = useState(0);

  // ─── Derived Values ──────────────────────────────────────────────────────
  const selectedFitment = fitmentVariants?.[selectedFitmentIndex];
  const selectedGlass = selectedFitment?.glassOptions?.[selectedGlassIndex];
  const selectedCap = capOptions?.[selectedCapIndex];

  const baseImageUrl = useMemo(
    () => getImageUrl(selectedGlass?.baseImage as any),
    [selectedGlass]
  );
  
  const capImageUrl = useMemo(
    () => getImageUrl(selectedCap?.capImage as any),
    [selectedCap]
  );

  // ─── Aspect Ratio Style ──────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: aspectRatio === 'square' ? '1 / 1' : aspectRatio === 'portrait' ? '3 / 4' : '4 / 3',
  };

  const layerStyle = (zIndex: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex,
  });

  // ─── Early Return if No Data ─────────────────────────────────────────────
  if (!fitmentVariants?.length) {
    return (
      <div className={`p-8 bg-gray-100 text-center text-gray-500 ${className}`}>
        No product configuration available
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {/* Product Viewer */}
      <div style={containerStyle} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        {/* Layer 1: Base (bottle + fitment) */}
        {baseImageUrl && (
          <div style={layerStyle(10)}>
            <Image
              src={baseImageUrl}
              alt={selectedGlass?.label || 'Product'}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        )}

        {/* Layer 2: Cap */}
        {capImageUrl && (
          <div style={layerStyle(20)}>
            <Image
              src={capImageUrl}
              alt={selectedCap?.label || 'Cap'}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* No image fallback */}
        {!baseImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Select options below
          </div>
        )}
      </div>

      {/* ─── Controls ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Fitment Toggle */}
        {fitmentVariants.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roller Type
            </label>
            <div className="flex gap-2">
              {fitmentVariants.map((variant, index) => (
                <button
                  key={variant._key || index}
                  onClick={() => {
                    setSelectedFitmentIndex(index);
                    setSelectedGlassIndex(0); // Reset glass selection
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFitmentIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Glass Options */}
        {selectedFitment?.glassOptions?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Glass Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {selectedFitment.glassOptions.map((glass, index) => {
                const thumbUrl = getImageUrl(glass.baseImage as any);
                return (
                  <button
                    key={glass._key || index}
                    onClick={() => setSelectedGlassIndex(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedGlassIndex === index
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={glass.label}
                  >
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={glass.label}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">{glass.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {selectedGlass?.label}
            </p>
          </div>
        )}

        {/* Cap Options */}
        {capOptions?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cap Style
            </label>
            <div className="flex gap-2 flex-wrap">
              {capOptions.map((cap, index) => {
                const thumbUrl = getImageUrl(cap.capImage as any);
                return (
                  <button
                    key={cap._key || index}
                    onClick={() => setSelectedCapIndex(index)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedCapIndex === index
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={cap.label}
                  >
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={cap.label}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">{cap.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCap?.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


