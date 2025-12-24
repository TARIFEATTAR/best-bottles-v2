import React, { useEffect, useState } from 'react';

export const ShopifyDebugger: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const rawDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '';
    const domain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_TOKEN;

    const fetchShopData = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `https://${domain}/api/2024-01/graphql.json`;

            const query = `
        {
          shop {
            name
            description
            primaryDomain {
              url
            }
          }
          products(first: 3) {
            edges {
              node {
                id
                title
                handle
                featuredImage {
                  url
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
                setError(result.errors);
            } else {
                setData(result.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopData();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-20">
            <h1 className="text-3xl font-serif font-bold mb-6">Shopify API Connection Test</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Store Domain</p>
                    <code className="text-[10px] block opacity-50 mb-1">Raw: {rawDomain}</code>
                    <code className="text-sm break-all font-bold">Clean: {domain}</code>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Token Prefix</p>
                    <code className="text-sm">{(token || '').substring(0, 10)}...</code>
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-3 text-zinc-500">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
                    Testing connection...
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    <h2 className="font-bold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        API Error
                    </h2>
                    <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(error, null, 2)}</pre>
                    <button
                        onClick={fetchShopData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {data && (
                <div className="space-y-6">
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
                        <h2 className="font-bold mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined">check_circle</span>
                            Connection Successful
                        </h2>
                        <p className="text-sm">Connected to: <strong>{data.shop.name}</strong></p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-3">Recent Products</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {data.products.edges.map(({ node }: any) => (
                                <div key={node.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    {node.featuredImage && (
                                        <img src={node.featuredImage.url} alt={node.title} className="w-full aspect-square object-cover rounded-lg mb-3 shadow-sm" />
                                    )}
                                    <p className="font-bold text-sm line-clamp-2">{node.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <details className="mt-8">
                        <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                            View Raw Response Data
                        </summary>
                        <pre className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] overflow-auto max-h-80 border border-zinc-200 dark:border-zinc-700">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};
