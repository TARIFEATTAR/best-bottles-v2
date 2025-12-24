import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from './Reveal';

interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        }
    };
    featuredImage?: {
        url: string;
        altText?: string;
    };
    variants: {
        edges: {
            node: {
                id: string;
                title: string;
            }
        }[];
    };
}

interface ShopifyProductGridProps {
    onAddToCart?: (product: any, quantity: number) => void;
    limit?: number;
}

export const ShopifyProductGrid: React.FC<ShopifyProductGridProps> = ({ onAddToCart, limit = 4 }) => {
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN;

    const fetchProducts = async () => {
        if (!token || !cleanDomain) {
            setError("Shopify credentials not configured");
            setLoading(false);
            return;
        }

        try {
            const url = `https://${cleanDomain}/api/2024-01/graphql.json`;
            const query = `
                {
                  products(first: ${limit}) {
                    edges {
                      node {
                        id
                        title
                        handle
                        description
                        priceRange {
                          minVariantPrice {
                            amount
                            currencyCode
                          }
                        }
                        featuredImage {
                          url
                          altText
                        }
                        variants(first: 1) {
                          edges {
                            node {
                              id
                              title
                            }
                          }
                        }
                      }
                    }
                  }
                }
            `;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': token,
                },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();
            if (result.errors) {
                console.error("Shopify API Error:", result.errors);
                setError(result.errors[0].message || "Failed to fetch products");
            } else {
                const fetchedProducts = result.data.products.edges.map((edge: any) => edge.node);
                setProducts(fetchedProducts);
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [limit]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 rounded-2xl mb-4"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Generic high-end products for demo fallback
    const DEMO_PRODUCTS: ShopifyProduct[] = [
        {
            id: 'demo-1',
            title: 'Sample Essence Flask',
            handle: 'sample-flask',
            description: 'Premium demo product shown because your Shopify catalog is currently empty.',
            priceRange: { minVariantPrice: { amount: '45.00', currencyCode: 'USD' } },
            featuredImage: { url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142', altText: 'Demo' },
            variants: { edges: [{ node: { id: 'v1', title: 'Default' } }] }
        },
        {
            id: 'demo-2',
            title: 'Artisan Glass Vial',
            handle: 'artisan-vial',
            description: 'Premium demo product shown because your Shopify catalog is currently empty.',
            priceRange: { minVariantPrice: { amount: '32.00', currencyCode: 'USD' } },
            featuredImage: { url: 'https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-39b140c0.jpg?v=1765595835', altText: 'Demo' },
            variants: { edges: [{ node: { id: 'v2', title: 'Default' } }] }
        }
    ];

    const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;
    const isShowingDemo = products.length === 0 && !loading && !error;

    if (error) {
        return (
            <div className="w-full py-12 px-8 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-red-200 dark:border-red-900/30 text-center">
                <div className="max-w-md mx-auto">
                    <span className="material-symbols-outlined text-4xl text-red-400 mb-4">api_off</span>
                    <h3 className="text-xl font-serif font-bold mb-2">Connection Issue</h3>
                    <p className="text-zinc-500 text-sm mb-6">
                        We reached Shopify, but encountered an error: {error}
                    </p>
                    <button onClick={fetchProducts} className="text-xs font-bold uppercase tracking-widest text-[#C5A059] flex items-center justify-center gap-2 mx-auto">
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            {isShowingDemo && (
                <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mx-auto md:mx-0">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Demo Preview Enabled — No live products published yet</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence>
                    {displayProducts.map((product, idx) => (
                        <Reveal key={product.id} delay={idx * 0.1} effect="slide-up">
                            <div className="group relative flex flex-col h-full">
                                {/* Product Image Stage */}
                                <div className="aspect-[4/5] bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    {product.featuredImage ? (
                                        <img
                                            src={product.featuredImage.url}
                                            alt={product.featuredImage.altText || product.title}
                                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                                            <span className="material-symbols-outlined text-4xl text-zinc-200">image</span>
                                        </div>
                                    )}


                                    {/* Hover Action Bar */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/20 to-transparent">

                                        <button
                                            onClick={() => onAddToCart?.({
                                                sku: product.handle,
                                                name: product.title,
                                                price: parseFloat(product.priceRange.minVariantPrice.amount),
                                                image: product.featuredImage?.url
                                            }, 1)}
                                            className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                            Quick Add
                                        </button>
                                    </div>

                                    {/* Bagde */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#C5A059] text-white text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded">Shopify Live</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mt-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white leading-tight group-hover:text-[#C5A059] transition-colors">
                                            {product.title}
                                        </h3>
                                        <span className="font-mono text-sm font-bold text-[#1D1D1F] dark:text-[#C5A059]">
                                            ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 font-light leading-relaxed mb-4">
                                        {product.description || "Premium glass packaging solution for luxury brands."}
                                    </p>

                                    <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1D1D1F] dark:text-white/50 group-hover:text-[#C5A059] transition-colors cursor-pointer">
                                        View Details
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

