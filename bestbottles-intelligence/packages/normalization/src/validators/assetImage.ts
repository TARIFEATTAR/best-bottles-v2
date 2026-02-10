import sharp from 'sharp';

export interface AssetImageValidationResult {
  ok: boolean;
  reason?: string;
  meta?: {
    width: number;
    height: number;
    format: string;
    hasAlpha: boolean;
  };
}

export interface AssetImageValidationOptions {
  /**
   * Required format (default: 'png')
   */
  requiredFormat?: 'png' | 'jpg' | 'jpeg' | 'webp';
  /**
   * Required dimensions (exact match)
   */
  requiredDimensions?: { width: number; height: number };
  /**
   * Required aspect ratio (e.g., 1 for square, 4/3 for landscape)
   */
  requiredAspectRatio?: number;
  /**
   * Tolerance for aspect ratio comparison (default: 0.01)
   */
  aspectRatioTolerance?: number;
  /**
   * Minimum dimensions
   */
  minDimensions?: { width: number; height: number };
  /**
   * Maximum dimensions
   */
  maxDimensions?: { width: number; height: number };
}

const DEFAULT_OPTIONS: Required<AssetImageValidationOptions> = {
  requiredFormat: 'png',
  requiredDimensions: undefined,
  requiredAspectRatio: undefined,
  aspectRatioTolerance: 0.01,
  minDimensions: undefined,
  maxDimensions: undefined,
};

/**
 * Validates an image asset for product stacking requirements
 * 
 * Ensures:
 * - Format is PNG (for transparency support)
 * - Dimensions match requirements (exact or aspect ratio)
 * - Image is valid and readable
 * 
 * @param filePathOrBuffer - Path to image file or Buffer containing image data
 * @param options - Validation options
 * @returns Validation result with metadata
 */
export async function validateAssetImage(
  filePathOrBuffer: string | Buffer,
  options: AssetImageValidationOptions = {}
): Promise<AssetImageValidationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load image metadata
    const image = sharp(filePathOrBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return {
        ok: false,
        reason: 'Unable to read image dimensions',
      };
    }

    const { width, height, format } = metadata;
    const hasAlpha = metadata.hasAlpha ?? false;
    const aspectRatio = width / height;

    // Check format
    if (opts.requiredFormat && format !== opts.requiredFormat) {
      return {
        ok: false,
        reason: `Image format is ${format}, expected ${opts.requiredFormat}`,
        meta: { width, height, format, hasAlpha },
      };
    }

    // Check exact dimensions
    if (opts.requiredDimensions) {
      if (
        width !== opts.requiredDimensions.width ||
        height !== opts.requiredDimensions.height
      ) {
        return {
          ok: false,
          reason: `Image dimensions are ${width}x${height}, expected ${opts.requiredDimensions.width}x${opts.requiredDimensions.height}`,
          meta: { width, height, format, hasAlpha },
        };
      }
    }

    // Check aspect ratio
    if (opts.requiredAspectRatio !== undefined) {
      const ratioDiff = Math.abs(aspectRatio - opts.requiredAspectRatio);
      if (ratioDiff > opts.aspectRatioTolerance) {
        return {
          ok: false,
          reason: `Image aspect ratio is ${aspectRatio.toFixed(3)}, expected ${opts.requiredAspectRatio.toFixed(3)} (±${opts.aspectRatioTolerance})`,
          meta: { width, height, format, hasAlpha },
        };
      }
    }

    // Check minimum dimensions
    if (opts.minDimensions) {
      if (
        width < opts.minDimensions.width ||
        height < opts.minDimensions.height
      ) {
        return {
          ok: false,
          reason: `Image dimensions ${width}x${height} are below minimum ${opts.minDimensions.width}x${opts.minDimensions.height}`,
          meta: { width, height, format, hasAlpha },
        };
      }
    }

    // Check maximum dimensions
    if (opts.maxDimensions) {
      if (
        width > opts.maxDimensions.width ||
        height > opts.maxDimensions.height
      ) {
        return {
          ok: false,
          reason: `Image dimensions ${width}x${height} exceed maximum ${opts.maxDimensions.width}x${opts.maxDimensions.height}`,
          meta: { width, height, format, hasAlpha },
        };
      }
    }

    // For PNG, recommend alpha channel (but don't fail)
    if (opts.requiredFormat === 'png' && !hasAlpha) {
      // Warning, not error - some PNGs don't need transparency
    }

    return {
      ok: true,
      meta: { width, height, format, hasAlpha },
    };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error
          ? `Image validation failed: ${error.message}`
          : 'Unknown error during image validation',
    };
  }
}

/**
 * Convenience function for validating product stacking assets
 * 
 * Validates PNG format with square aspect ratio (1:1)
 */
export async function validateProductStackingAsset(
  filePathOrBuffer: string | Buffer,
  options?: {
    requiredDimensions?: { width: number; height: number };
    minDimensions?: { width: number; height: number };
  }
): Promise<AssetImageValidationResult> {
  return validateAssetImage(filePathOrBuffer, {
    requiredFormat: 'png',
    requiredAspectRatio: 1, // Square
    ...options,
  });
}


