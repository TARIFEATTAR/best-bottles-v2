
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Link from 'next/link'

export const revalidate = 0 // Ensure fresh data for demo

// GROQ Query
const QUERY = `*[_type in ["product", "productRollOn"]] | order(_createdAt desc)[0...6] {
  _id,
  _type,
  title,
  price,
  inStock,
  shopifyProductId,
  // RollOn MVP structure
  composition {
    baseGlass,
    fitmentComponent,
    capComponent
  },
  // Full System structure
  visualStack {
    baseLayer->{ layerImage, name },
    fitmentLayer->{ layerImage, name, assemblyOffsetY },
    capLayer->{ layerImage, name, assemblyOffsetY },
    backgroundLayer->{ backgroundImage }
  }
}`

export default async function SanityShowcasePage() {
    const products = await client.fetch(QUERY)

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
            <header className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Best Bottles Intelligence Platform
                </h1>
                <p className="text-neutral-400">
                    Live Sanity Data Showcase • Exploded View Architecture • Real-Time Inventory
                </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                        <p>No products found in Sanity. Please run the sync script or add data in Studio.</p>
                    </div>
                )}
            </main>

            <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-600">
                Data fetched live from Sanity Dataset: <strong>production</strong>
            </footer>
        </div>
    )
}

function ProductCard({ product }: { product: any }) {
    // Normalize data between the two schemas (MVP vs Full)
    const isMVP = product._type === 'productRollOn'

    const glass = isMVP ? product.composition?.baseGlass : product.visualStack?.baseLayer?.layerImage
    const fitment = isMVP ? product.composition?.fitmentComponent : product.visualStack?.fitmentLayer?.layerImage
    const cap = isMVP ? product.composition?.capComponent : product.visualStack?.capLayer?.layerImage

    const fitmentOffset = isMVP ? (product.composition?.fitmentComponent?.offsetY || 0) : (product.visualStack?.fitmentLayer?.assemblyOffsetY || 0)
    const capOffset = isMVP ? (product.composition?.capComponent?.offsetY || 0) : (product.visualStack?.capLayer?.assemblyOffsetY || 0)

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition-colors group">
            {/* Visualizer Region */}
            <div className="relative h-80 bg-neutral-900 overflow-hidden flex items-end justify-center pb-4">

                {/* Abstract Grid Background */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {/* The Exploded Stack */}
                <div className="relative w-48 h-64 flex justify-center">

                    {/* Layer 1: Glass (Bottom) */}
                    {glass && (
                        <img
                            src={urlFor(glass).width(300).url()}
                            alt="Glass"
                            className="absolute bottom-0 w-32 object-contain z-10 drop-shadow-2xl"
                        />
                    )}

                    {/* Layer 2: Fitment (Middle) */}
                    {fitment && (
                        <img
                            src={urlFor(fitment).width(300).url()}
                            alt="Fitment"
                            className="absolute bottom-0 w-32 object-contain z-20"
                            style={{ bottom: '35%', transform: `translateY(${fitmentOffset}px)` }}
                        />
                    )}

                    {/* Layer 3: Cap (Top) */}
                    {cap && (
                        <img
                            src={urlFor(cap).width(300).url()}
                            alt="Cap"
                            className="absolute bottom-0 w-32 object-contain z-30"
                            style={{ bottom: '10%', transform: `translateY(${capOffset}px)` }}
                        />
                    )}

                </div>

                {/* Layer Indicators (Hover) */}
                <div className="absolute top-4 left-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-cyan-400">
                    <span>L3: CAP_Stack</span>
                    <span>L2: MECH_Stack</span>
                    <span>L1: BODY_Glass</span>
                </div>

            </div>

            {/* Data Region */}
            <div className="p-5 border-t border-neutral-800">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="font-semibold text-neutral-200 leading-tight">{product.title}</h2>
                    <span className="text-green-400 font-mono font-bold">${product.price?.toFixed(2) || '0.00'}</span>
                </div>

                <div className="space-y-2 mt-4 text-xs font-mono text-neutral-500">
                    <div className="flex justify-between">
                        <span>Shopify ID:</span>
                        <span className={product.shopifyProductId ? "text-neutral-400" : "text-red-900"}>
                            {product.shopifyProductId || 'NOT SYNCED'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Inventory:</span>
                        <span className={product.inStock ? "text-green-600" : "text-red-500"}>
                            {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Schema Type:</span>
                        <span className="text-purple-400">{product._type}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
