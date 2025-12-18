
import React, { useState, useEffect } from "react";

interface ProductDetailProps {
    onBack?: () => void;
    onAddToCart?: (product: any, quantity: number) => void;
}

// --- Hardcoded "Golden Record" Product Data ---
const PRODUCT = {
    name: "Elegant Frosted Square 60ml",
    itemType: "Classic Perfume Spray Glass Bottles",
    sku: "GBElgFrst60SpryShnBlk", // The specific SKU from reference
    description: "Elegant design 60 ml, 2oz frosted glass bottle with shiny black spray pump. For use with perfume or fragrance oil, essential oils, aromatic oils and aromatherapy. Elegant bottle is a family of bottles available in 5ml, 15ml, 30ml, 60ml and 100ml.",

    // Specific Dimensions from Reference
    specs: {
        capacity: "60 ml (2.03 oz)",
        heightWithCap: "135 ±2 mm",
        heightWithoutCap: "86 ±1 mm",
        width: "54 ±1 mm",
        depth: "27 ±0.5 mm",
        neckSize: "18-415",
        material: "Frosted Glass"
    },

    // Wholesale Tier Logic
    pricingTiers: [
        { label: "1 pcs - $3.25/pc", price: 3.25, minQty: 1 },
        { label: "12 pcs - $2.95/pc", price: 2.95, minQty: 12 },
        { label: "100 pcs - $2.50/pc", price: 2.50, minQty: 100 },
        { label: "500 pcs - $2.10/pc", price: 2.10, minQty: 500 },
    ],

    // Image Gallery
    images: [
        {
            id: 'front',
            label: 'Front View',
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqWM45PYPPB2Zy73EsR2EW_4ebrNLWrHH3urJIkzUTNbYsQ0kWUXHKcqn0IPQj-QYTHYOwW6cF7dztUXzMDAzBx-xaw8Fg4RXehcYlcINeVjEZWYLtVbtUrhx8t9_6LRrraIRWcYIocubk70JcgGFbzZ-JnOpd5rzDYNexf4qP2_Eh0-aN0Zx89996TKVLx4ByEv4bzDiHww8rLEcOyLVR47myFr3bjNlOL8EYuKxZm6ZjN-umH5DkExOpA59VLOGWGPjCQC5OmgU",
        },
        {
            id: 'depth',
            label: 'Depth View',
            src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
        },
        {
            id: 'tech',
            label: 'Technical Drawing',
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Technical_drawing_of_a_bottle.svg/800px-Technical_drawing_of_a_bottle.svg.png",
        },
    ],

    // Cap Variants (Left column in reference)
    variants: [
        { id: 'black', color: '#1a1a1a', name: 'Black Spray', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgc-N6bhQ9qBm4W3cs4_4tpiph1pE7Ps6W5ExSAiF1YfqXhK71QwuIGxFMFFhWvgBv93YT5i5SAJNtEWGMhrB8NhUA8q1Z7Z1km-YkVhE2DrWSyWcJ5zEDQY5dDz2upoSmfpUdFSfjBwmSFA0Qp-kfDhZTbGbYVHUqyjBExt2zauIUdjfydfG3nznSYTVpr_SY0vNhtc-0y0LQChpbRtTMmlo183J17pEKpmR9Uz1Kqbzf0mtujAac8L1EWIPKY3EJJ_CHGjle1jw" },
        { id: 'gold', color: '#D4AF37', name: 'Gold Spray', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmPQVN1zfnL-pefbRaXs9ctvZS76b-DQUDFfWr3W7wW1EuQifDsxG8CDn1NGwXO2kEux9cNIgAB_nz4J7Hwsx9pFXmgmMVZ8X6565BTYHYusawwDiNxsWv8S2EHFoe4qtlufVppuTInVOktF60uOjaUvvAla01ITbTj9okzHJc4-aJXJVLhH3csu3sZwIUxGYsBKoV4vVWXXsvPhb7kO0rhzlYI1tMQPMjNkTrhl2G17v2yz__lsA9UbJFVjjH5jXe5U24GNArpkQ" },
        { id: 'silver', color: '#C0C0C0', name: 'Silver Spray', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgc-N6bhQ9qBm4W3cs4_4tpiph1pE7Ps6W5ExSAiF1YfqXhK71QwuIGxFMFFhWvgBv93YT5i5SAJNtEWGMhrB8NhUA8q1Z7Z1km-YkVhE2DrWSyWcJ5zEDQY5dDz2upoSmfpUdFSfjBwmSFA0Qp-kfDhZTbGbYVHUqyjBExt2zauIUdjfydfG3nznSYTVpr_SY0vNhtc-0y0LQChpbRtTMmlo183J17pEKpmR9Uz1Kqbzf0mtujAac8L1EWIPKY3EJJ_CHGjle1jw" },
        { id: 'copper', color: '#B87333', name: 'Copper Spray', img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDwv4czIreKFOH6Hkf_GaE5eXUqrYlRIuULDQt3PTGXpUBtQtMZGv1BHbkgLdtMr4b3Byo-u_uHouV2wMSMnTywM9B2h2xTzS0EWt8YrCylJHGCrc4P5QkPggb7dqErkf7VakoJ0RFfBK4Akzs_p1--BzLXPJWq097sNBthZaMPmfQa4h28sjAA6yHcS3wnJUX1iic20rXf3LEi8S840N6moqiYIpdDWBrHSlDvDkOrNiYnIdCXquI_M0K11i8XzlYgQKS4oKhsp4" },
    ]
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ onBack, onAddToCart }) => {
    const [selectedImage, setSelectedImage] = useState(PRODUCT.images[0].src);
    const [selectedViewLabel, setSelectedViewLabel] = useState(PRODUCT.images[0].label);
    const [selectedTier, setSelectedTier] = useState(PRODUCT.pricingTiers[0]);
    const [orderQty, setOrderQty] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
    const [isSaved, setIsSaved] = useState(false);

    // Handle Logic: When Qty changes, auto-select the best tier
    const handleQtyChange = (val: string) => {
        const num = parseInt(val) || 0;
        setOrderQty(num);

        // Reverse find the highest tier that matches the quantity
        const applicableTier = [...PRODUCT.pricingTiers].reverse().find(t => num >= t.minQty);

        // Only switch if different, but allow manual override via dropdown later if needed
        if (applicableTier) {
            setSelectedTier(applicableTier);
        }
    };

    const totalPrice = (orderQty * selectedTier.price).toFixed(2);

    const handleSaveProject = () => {
        setIsSaved(!isSaved);
        // Logic to persist to local storage or backend would go here
    };

    return (
        <main className="w-full bg-white dark:bg-background-dark min-h-screen font-sans pb-32 lg:pb-20">

            {/* 1. Navigation / Breadcrumbs */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-6 border-b border-gray-100 dark:border-gray-800 mb-4 md:mb-8 sticky top-[72px] bg-white/90 dark:bg-background-dark/90 backdrop-blur z-30">
                <div className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center space-x-2 md:space-x-3">
                    <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <span>/</span>
                    <span className="hover:text-primary cursor-pointer hidden md:inline">Shop</span>
                    <span className="hidden md:inline">/</span>
                    <span className="text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-none">{PRODUCT.name}</span>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* 2. Left Column: Thumbnails (Desktop Only - Left Strip) */}
                    <div className="lg:col-span-1 hidden lg:flex flex-col gap-4 sticky top-32 h-fit">
                        {/* Main Views */}
                        {PRODUCT.images.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => { setSelectedImage(img.src); setSelectedViewLabel(img.label); }}
                                className={`w-full aspect-square rounded-lg border bg-gray-50 dark:bg-white/5 p-2 transition-all relative group ${selectedImage === img.src ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                title={img.label}
                            >
                                <img src={img.src} alt={img.label} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                {img.id === 'tech' && <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-white text-black px-1 rounded shadow">DWG</span>}
                            </button>
                        ))}

                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

                        {/* Variant Thumbnails */}
                        <span className="text-[10px] uppercase font-bold text-gray-400 text-center">Variants</span>
                        {PRODUCT.variants.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVariant(v)}
                                className={`w-full aspect-square rounded-lg border bg-white dark:bg-white/5 p-2 transition-all flex flex-col items-center justify-center gap-1 ${selectedVariant.id === v.id ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                title={v.name}
                            >
                                <img src={v.img} alt={v.name} className="w-8 h-8 object-contain" />
                                <div className="w-2 h-2 rounded-full border border-gray-300" style={{ background: v.color }}></div>
                            </button>
                        ))}
                    </div>

                    {/* 3. Center Column: Main Stage */}
                    <div className="lg:col-span-6">
                        {/* 
                UPDATED CONTAINER: 
                - Switched from aspect-[4/5] to fixed viewport heights (h-[50vh] mobile, h-[75vh] desktop).
                - Added max-h-[800px] to prevent it from getting too tall on massive screens.
                - Use object-contain to ensure the whole bottle fits within this box.
             */}
                        <div className="sticky top-24 md:top-32 bg-white dark:bg-[#1E1E1E] rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 w-full h-[50vh] md:h-[75vh] max-h-[800px] flex items-center justify-center p-6 md:p-10 shadow-sm overflow-hidden group relative">

                            {/* Main Image */}
                            <img
                                src={selectedImage}
                                alt={selectedViewLabel}
                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* View Label Badge */}
                            <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                {selectedViewLabel}
                            </div>
                        </div>

                        {/* Mobile: Horizontal Gallery Strip (Visible lg:hidden) */}
                        <div className="flex lg:hidden gap-3 overflow-x-auto py-4 px-1 no-scrollbar mt-2">
                            {PRODUCT.images.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => { setSelectedImage(img.src); setSelectedViewLabel(img.label); }}
                                    className={`w-20 h-20 shrink-0 rounded-lg border bg-gray-50 dark:bg-white/5 p-2 transition-all ${selectedImage === img.src ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <img src={img.src} alt={img.label} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </button>
                            ))}
                            <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1 h-20"></div>
                            {PRODUCT.variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`w-20 h-20 shrink-0 rounded-lg border bg-white dark:bg-white/5 p-2 flex flex-col items-center justify-center gap-1 ${selectedVariant.id === v.id ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <img src={v.img} alt={v.name} className="w-8 h-8 object-contain" />
                                    <div className="w-2 h-2 rounded-full border border-gray-300" style={{ background: v.color }}></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Right Column: Product Details & Order Form */}
                    <div className="lg:col-span-5 flex flex-col space-y-6 md:space-y-8">

                        {/* Header Info */}
                        <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">{PRODUCT.itemType}</span>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1e1e4b] dark:text-white mt-2 mb-2">{PRODUCT.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">SKU: {PRODUCT.sku}</span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> In Stock
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-l-2 border-[#C5A065] pl-4">
                            {PRODUCT.description}
                        </p>

                        {/* --- WHOLESALE ORDER BOX --- */}
                        <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-200 dark:border-gray-700 p-4 md:p-6 rounded-lg shadow-inner">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
                                {/* Tier Dropdown */}
                                <div className="md:col-span-8">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Purchase Tier</label>
                                    <div className="relative">
                                        <select
                                            value={JSON.stringify(selectedTier)}
                                            onChange={(e) => {
                                                const tier = JSON.parse(e.target.value);
                                                setSelectedTier(tier);
                                                setOrderQty(Math.max(orderQty, tier.minQty));
                                            }}
                                            className="w-full appearance-none bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 md:py-3 text-sm font-bold text-[#1e1e4b] dark:text-white focus:border-[#1e1e4b] outline-none shadow-sm"
                                        >
                                            {PRODUCT.pricingTiers.map((tier, idx) => (
                                                <option key={idx} value={JSON.stringify(tier)}>{tier.label}</option>
                                            ))}
                                        </select>
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-sm text-gray-500">expand_more</span>
                                    </div>
                                </div>

                                {/* Qty Input - Made larger for mobile touch */}
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Order Qty</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={orderQty}
                                        onChange={(e) => handleQtyChange(e.target.value)}
                                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-sm font-bold text-center outline-none focus:border-[#1e1e4b] dark:text-white shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Totals Row */}
                            <div className="flex items-center justify-between bg-white dark:bg-black/10 p-4 rounded border border-gray-200 dark:border-gray-600 mb-4">
                                <div className="text-xs text-gray-500">
                                    Total Qty: <span className="font-bold text-black dark:text-white text-sm ml-1">{orderQty}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Total Price: <span className="font-bold text-[#1e1e4b] dark:text-white text-lg ml-1">${totalPrice}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {/* Save Project Button */}
                                <button
                                    onClick={handleSaveProject}
                                    className={`flex-1 md:flex-none px-4 py-4 md:py-3 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${isSaved ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' : 'bg-white dark:bg-transparent text-[#1e1e4b] dark:text-white hover:bg-gray-50'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined ${isSaved ? 'filled-icon' : ''}`}>favorite</span>
                                    <span className="hidden md:inline">{isSaved ? 'Saved' : 'Save'}</span>
                                </button>

                                {/* Main Add to Cart */}
                                <button
                                    onClick={() => onAddToCart?.({
                                        ...PRODUCT,
                                        price: selectedTier.price,
                                        variant: selectedVariant.name,
                                        image: selectedVariant.img || PRODUCT.images[0].src
                                    }, orderQty)}
                                    className="flex-[3] w-full bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] py-4 md:py-3 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    Add To <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                </button>
                            </div>
                        </div>

                        {/* --- SPECIFICATIONS LIST --- */}
                        <div className="space-y-4 pt-4">
                            <h4 className="font-bold text-sm text-[#1e1e4b] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Technical Specifications</h4>

                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Item Capacity:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.capacity}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Height with Cap:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.heightWithCap}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Height w/o Cap:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.heightWithoutCap}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Item Width:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.width}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Item Depth:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.depth}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-[#1e1e4b] dark:text-white">Neck Thread Size:</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">{PRODUCT.specs.neckSize}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-4 pt-8">
                            <button className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-[#1e1e4b] hover:border-[#1e1e4b] dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">download</span> Spec Sheet
                            </button>
                            <button className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-[#1e1e4b] hover:border-[#1e1e4b] dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">request_quote</span> Volume Quote
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {/* --- MOBILE STICKY ACTION BAR (Optimal for Mobile) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 p-4 md:hidden z-50 flex items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Total Estimate</span>
                    <span className="text-xl font-serif font-bold text-[#1e1e4b] dark:text-white">${totalPrice}</span>
                </div>
                <button
                    onClick={() => onAddToCart?.({
                        ...PRODUCT,
                        price: selectedTier.price,
                        variant: selectedVariant.name,
                        image: selectedVariant.img || PRODUCT.images[0].src
                    }, orderQty)}
                    className="flex-1 bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] py-3 rounded-lg text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    Add To Cart
                </button>
            </div>

        </main>
    );
};
