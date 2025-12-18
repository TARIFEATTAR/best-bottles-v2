import React from "react";
import { Product } from "../types";

// Import the product family data for display
import rollOnData from "../data/roll-on-9ml-cylinder.json";

interface CollectionDetailPageProps {
    onBack: () => void;
    onProductClick?: (product: Product) => void;
    onAddToCart?: (product: Product, quantity: number) => void;
}

// Consolidated product families for demo
const PRODUCT_FAMILIES = [
    {
        id: "9ml-cylinder-roll-on",
        name: "9ml Cylinder Roll-On Bottle",
        description: "Configurable glass roll-on bottle with interchangeable components. Select your glass color, cap style, and roller type.",
        capacity: "9 ml (0.3 oz)",
        priceRange: "$0.55 - $0.87/pc",
        heroImage: "https://www.bestbottles.com/images/store/enlarged_pics/GBCylAmb9MtlRollBlkDot.gif",
        stats: {
            count1: rollOnData.baseBottles.length,
            label1: "Glass Colors",
            count2: rollOnData.capOptions.length,
            label2: "Cap Styles",
            count3: rollOnData.rollerOptions.length,
            label3: "Roller Types"
        },
        bottles: rollOnData.baseBottles.slice(0, 5),
        caps: rollOnData.capOptions,
        swatchLabel: "Available Cap Styles",
        tag: "Configurable Product",
        tagClass: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    },
    {
        id: "60ml-elegant-spray",
        name: "60ml Elegant Square Spray",
        description: "Elegant rectangular design glass bottle with fine mist sprayer. Available in clear and frosted glass with various premium metallic sprayers.",
        capacity: "60 ml (2 oz)",
        priceRange: "$1.81 - $3.09/pc",
        heroImage: "https://www.bestbottles.com/images/store/enlarged_pics/GBElgFrst60SpryCu.gif",
        stats: {
            count1: 2,
            label1: "Glass Finishes",
            count2: 3,
            label2: "Spray Finishes",
            count3: 2,
            label3: "Cap Types"
        },
        bottles: [
            { id: "frosted", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBElgFrst60SpryCu.gif", name: "Frosted" },
            { id: "clear", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBElg60SpryCu.gif", name: "Clear" }
        ],
        caps: [
            { id: "copper", color: "#B87333", name: "Copper" },
            { id: "silver", color: "#C0C0C0", name: "Silver" },
            { id: "black", color: "#000000", name: "Black" }
        ],
        swatchLabel: "Spray Finishes",
        tag: "Best Seller",
        tagClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
    },
    {
        id: "travel-atomizer",
        name: "Travel Atomizer",
        description: "Compact and refillable travel atomizer. Perfect for on-the-go fragrance application. Available in a vibrant range of anodized aluminum colors.",
        capacity: "10 ml (0.34 oz)",
        priceRange: "$2.99 - $3.50/pc",
        heroImage: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Blk.gif",
        stats: {
            count1: 7,
            label1: "Colors",
            count2: 2,
            label2: "Sizes",
            count3: 1,
            label3: "Style"
        },
        bottles: [
            { id: "black", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Blk.gif", name: "Black" },
            { id: "silver", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Sl.gif", name: "Silver" },
            { id: "gold", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Gl.gif", name: "Gold" },
            { id: "blue", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Blu.gif", name: "Blue" },
            { id: "pink", imageUrl: "https://www.bestbottles.com/images/store/enlarged_pics/GBAtom10Pnk.gif", name: "Pink" }
        ],
        caps: [
            { id: "black", color: "#000000", name: "Black" },
            { id: "silver", color: "#C0C0C0", name: "Silver" },
            { id: "gold", color: "#FFD700", name: "Gold" },
            { id: "blue", color: "#0000FF", name: "Blue" },
            { id: "pink", color: "#FFC0CB", name: "Pink" },
            { id: "red", color: "#FF0000", name: "Red" },
            { id: "green", color: "#008000", name: "Green" }
        ],
        swatchLabel: "Color Options",
        tag: "New Arrival",
        tagClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
    }
];

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ onBack, onProductClick }) => {

    return (
        <div className="w-full bg-white dark:bg-background-dark min-h-screen font-sans">
            {/* Breadcrumbs */}
            <div className="max-w-[1440px] mx-auto px-6 py-6 text-xs text-gray-500 flex items-center gap-2">
                <button onClick={onBack} className="hover:text-primary transition-colors">Home</button>
                <span className="text-gray-300">›</span>
                <button onClick={onBack} className="hover:text-primary transition-colors">Categories</button>
                <span className="text-gray-300">›</span>
                <span className="text-text-light dark:text-text-dark font-medium">Demo Collection</span>
            </div>

            {/* Header */}
            <div className="max-w-[1440px] mx-auto px-6 mb-12">
                <div className="inline-block bg-[#C5A065]/10 text-[#C5A065] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                    Demo Category
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-text-light dark:text-text-dark mb-4">
                    Featured Collections
                </h1>
                <p className="text-[#637588] dark:text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
                    Explore our curated selection of premium glass and aluminum packaging. Fully configurable to match your brand identity.
                </p>
            </div>

            {/* Product Families List */}
            <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-12">

                {PRODUCT_FAMILIES.map((product) => (
                    <div
                        key={product.id}
                        className="group cursor-pointer bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                        onClick={() => onProductClick?.({} as Product)}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                            {/* Left: Product Image with Variants Preview */}
                            <div className="relative bg-[#F5F5F7] dark:bg-[#252525] p-8 lg:p-12">
                                {/* Main Image */}
                                <div className="aspect-square flex items-center justify-center mb-6">
                                    <img
                                        src={product.heroImage}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Bottle Color Variants Preview */}
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2">Preview:</span>
                                    {product.bottles.map((bottle) => (
                                        <div key={bottle.id} className="relative group/thumb">
                                            <img
                                                src={bottle.imageUrl}
                                                alt={bottle.name}
                                                className="w-10 h-10 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white p-1 hover:border-[#C5A065] transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Product Info */}
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className={`inline-block ${product.tagClass} text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 w-fit`}>
                                    {product.tag}
                                </div>

                                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-4 group-hover:text-[#C5A065] transition-colors">
                                    {product.name}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Configuration Options Summary */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-[#C5A065]">{product.stats.count1}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{product.stats.label1}</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-[#C5A065]">{product.stats.count2}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{product.stats.label2}</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-[#C5A065]">{product.stats.count3}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{product.stats.label3}</div>
                                    </div>
                                </div>

                                {/* Cap Styles Preview */}
                                <div className="mb-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-3">{product.swatchLabel}:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.caps.map((cap) => (
                                            <div
                                                key={cap.id}
                                                className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: cap.color }}
                                                />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{cap.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Starting from</div>
                                        <div className="text-2xl font-bold text-[#1e1e4b] dark:text-white">{product.priceRange}</div>
                                    </div>
                                    <button className="bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] px-8 py-4 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg group-hover:shadow-xl">
                                        Configure Bottle
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Info Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#f8f6f3] dark:bg-white/5 p-6 rounded-xl text-center">
                        <span className="material-symbols-outlined text-3xl text-[#C5A065] mb-3">tune</span>
                        <h3 className="font-bold text-[#1e1e4b] dark:text-white mb-2">Fully Configurable</h3>
                        <p className="text-sm text-gray-500">Mix and match glass colors, caps, and roller types to create your perfect bottle.</p>
                    </div>
                    <div className="bg-[#f8f6f3] dark:bg-white/5 p-6 rounded-xl text-center">
                        <span className="material-symbols-outlined text-3xl text-[#C5A065] mb-3">local_shipping</span>
                        <h3 className="font-bold text-[#1e1e4b] dark:text-white mb-2">Wholesale Pricing</h3>
                        <p className="text-sm text-gray-500">Volume discounts automatically applied. Better prices at higher quantities.</p>
                    </div>
                    <div className="bg-[#f8f6f3] dark:bg-white/5 p-6 rounded-xl text-center">
                        <span className="material-symbols-outlined text-3xl text-[#C5A065] mb-3">inventory_2</span>
                        <h3 className="font-bold text-[#1e1e4b] dark:text-white mb-2">In Stock</h3>
                        <p className="text-sm text-gray-500">All configurations ship within 24-48 hours from our warehouse.</p>
                    </div>
                </div>
            </div>

            {/* Mini Footer */}
            <div className="max-w-[1440px] mx-auto px-6 py-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 mt-20">
                <div className="flex items-center gap-2 opacity-50">
                    <span className="material-symbols-outlined text-xl">change_history</span>
                    <span className="font-serif font-bold">Best Bottles</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">© 2024 Best Bottles Inc.</span>
            </div>
        </div >
    );
};