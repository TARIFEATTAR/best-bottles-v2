
import { useEffect, useState } from 'react';
import { client } from '../lib/sanity';

export interface ProductConfig {
  _id: string;
  title: string;
  defaultGlass: {
    _id: string;
    name: string;
    layerImageUrl: string;
    priceModifier: number;
    hexColor?: string;
  };
  glassOptions: {
    _id: string;
    name: string;
    layerImageUrl: string;
    priceModifier: number;
    hexColor?: string;
  }[];
  fitmentVariants: {
    _id: string;
    name: string;
    type: string;
    details: string;
    layerImageUrl?: string;
  }[];
  capOptions: {
    _id: string;
    name: string;
    layerImageUrl: string;
    priceModifier: number;
    assemblyOffsetY: number;
    finish: string;
  }[];
}

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    
    defaultGlass->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      priceModifier,
      hexColor
    },
    
    glassOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      priceModifier,
      hexColor
    },

    fitmentVariants[]->{
      _id,
      name,
      type,
      "layerImageUrl": layerImage.asset->url
    },

    capOptions[]->{
      _id,
      name,
      "layerImageUrl": layerImage.asset->url,
      assemblyOffsetY,
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

    setLoading(true);
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
