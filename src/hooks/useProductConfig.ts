
import { useEffect, useState } from 'react';
import { client } from '../lib/sanity';

export interface ProductConfig {
  _id: string;
  title: string;
  defaultGlass: {
    _id: string;
    name: string;
    layerImageUrl: string;
    previewSwatchUrl?: string;
    priceModifier: number;
    hexColor?: string;
  };
  glassOptions: {
    _id: string;
    name: string;
    layerImageUrl: string;
    previewSwatchUrl?: string;
    priceModifier: number;
    hexColor?: string;
  }[];
  fitmentVariants: {
    _id: string;
    name: string;
    type: string;
    details: string;
    layerImageUrl?: string;
    previewSwatchUrl?: string;
  }[];
  capOptions: {
    _id: string;
    name: string;
    layerImageUrl: string;
    previewSwatchUrl?: string;
    priceModifier: number;
    assemblyOffsetY: number;
    assemblyOffsetX: number;
    finish: string;
  }[];
  basePrice?: number;
  shopifyProductId?: string;
  sku?: string;
}

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    basePrice,
    shopifyProductId,
    sku,
    
    defaultGlass->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      "previewSwatchUrl": previewSwatch.asset->url,
      priceModifier,
      hexColor
    },
    
    glassOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      "previewSwatchUrl": previewSwatch.asset->url,
      priceModifier,
      hexColor
    },

    fitmentVariants[]->{
      _id,
      name,
      type,
      "layerImageUrl": layerImage.asset->url,
      "previewSwatchUrl": previewSwatch.asset->url
    },

    capOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      "previewSwatchUrl": previewSwatch.asset->url,
      assemblyOffsetY,
      assemblyOffsetX,
      priceModifier,
      finish
    }
  }`;

export function useProductConfig(slug: string) {
  const [product, setProduct] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    if (!slug) return;

    // Move state update to avoid synchronous cascading renders flagged by linter
    setTimeout(() => setLoading(true), 0);
    client.fetch(PRODUCT_QUERY, { slug })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product config:", err);
        setError(err);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading, error };
}
