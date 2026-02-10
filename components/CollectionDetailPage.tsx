import React, { useState, useEffect } from 'react';

// Demo Data - Extended for the requested demo
import rollOnData from "../data/roll-on-9ml-cylinder.json";
import sprayData from "../data/elegant-60ml-spray.json";
import atomizerData from "../data/travel-atomizer-10ml.json";

// Demo Data - Extended for the requested demo
const PRODUCT_FAMILIES = [
    {
        id: "9ml-cylinder-roll-on",
        name: "Demo Listing",
        originalName: "9ml Cylinder Roll-On Bottle",
        description: rollOnData.categoryDescription,
        image: rollOnData.baseBottles[0].imageUrl,
        stats: {
            "Capacity": rollOnData.sharedSpecs.capacity,
            "Height": rollOnData.sharedSpecs.heightWithCap,
            "Diameter": rollOnData.sharedSpecs.diameter
        },
        bottles: rollOnData.baseBottles.map(b => ({ id: b.id, color: b.name, image: b.imageUrl })),
        caps: rollOnData.capOptions.map(c => ({ id: c.id, name: c.name, color: c.color, image: c.imageUrl })),
        rollers: rollOnData.rollerOptions.map(r => ({ id: r.id, name: r.name })),
        swatchLabel: "Glass Color",
        tag: "Best Seller",
        tagClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        data: rollOnData
    },
    {
        id: "60ml-elegant-spray",
        name: "Demo Listing",
        originalName: "60ml Elegant Square Spray",
        description: sprayData.categoryDescription,
        image: sprayData.baseBottles[0].imageUrl,
        stats: {
            "Capacity": sprayData.sharedSpecs.capacity,
            "Height": sprayData.sharedSpecs.heightWithCap,
            "Diameter": sprayData.sharedSpecs.diameter
        },
        bottles: sprayData.baseBottles.map(b => ({ id: b.id, color: b.name, image: b.imageUrl })),
        caps: sprayData.capOptions.map(c => ({ id: c.id, name: c.name, color: c.color, image: c.imageUrl })),
        rollers: sprayData.rollerOptions.map(r => ({ id: r.id, name: r.name })),
        swatchLabel: "Finish",
        tag: "New Arrival",
        tagClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        data: sprayData
    },
    {
        id: "travel-atomizer",
        name: "Demo Listing",
        originalName: "Travel Atomizer (10ml)",
        description: atomizerData.categoryDescription,
        image: atomizerData.baseBottles[0].imageUrl,
        stats: {
            "Capacity": atomizerData.sharedSpecs.capacity,
            "Height": atomizerData.sharedSpecs.heightWithCap,
            "Diameter": atomizerData.sharedSpecs.diameter
        },
        bottles: atomizerData.baseBottles.map(b => ({ id: b.id, color: b.name, image: b.imageUrl })),
        caps: atomizerData.capOptions.map(c => ({ id: c.id, name: c.name, color: c.color, image: c.imageUrl })),
        rollers: atomizerData.rollerOptions.map(r => ({ id: r.id, name: r.name })),
        swatchLabel: "Body Color",
        tag: "Premium Choice",
        tagClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        data: atomizerData
    }
];



interface CollectionDetailPageProps {
    onBack: () => void;
    onProductClick: (productId: string) => void;
    onAddToCart?: (product: any, quantity: number) => void;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ onBack, onProductClick, onAddToCart }) => {

    // Auto-scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
    const [activeSelections, setActiveSelections] = useState<Record<string, { bottleId: string, capId: string, rollerId: string }>>({
        "9ml-cylinder-roll-on": { bottleId: rollOnData.baseBottles[0].id, capId: rollOnData.capOptions[0].id, rollerId: rollOnData.rollerOptions[0].id },
        "60ml-elegant-spray": { bottleId: sprayData.baseBottles[0].id, capId: sprayData.capOptions[0].id, rollerId: sprayData.rollerOptions[0].id },
        "travel-atomizer": { bottleId: atomizerData.baseBottles[0].id, capId: atomizerData.capOptions[0].id, rollerId: atomizerData.rollerOptions[0].id }
    });

    const getCurrentSku = (familyId: string, selections: { bottleId: string, capId: string, rollerId: string }) => {
        let data: any;
        if (familyId === "9ml-cylinder-roll-on") data = rollOnData;
        else if (familyId === "60ml-elegant-spray") data = sprayData;
        else if (familyId === "travel-atomizer") data = atomizerData;

        if (!data) return "";

        // Try matrix search first for manual overrides or pre-calculated SKUs
        if (data.skuMatrix) {
            const entry = data.skuMatrix.find((s: any) =>
                s.bottle === selections.bottleId &&
                s.cap === selections.capId &&
                (s.roller === selections.rollerId || !s.roller)
            );
            if (entry) return entry.sku;
        }

        // Dynamic construction logic based on component parts
        const bottle = data.baseBottles.find((b: any) => b.id === selections.bottleId) || data.baseBottles[0];
        const cap = data.capOptions.find((c: any) => c.id === selections.capId) || data.capOptions[0];
        const roller = data.rollerOptions?.find((r: any) => r.id === selections.rollerId) || data.rollerOptions?.[0];

        if (familyId === "9ml-cylinder-roll-on") {
            const rollerCode = roller?.skuCode || "";
            const capCode = cap.imageCode || cap.skuCode || "";
            return `${bottle.skuPrefix}${rollerCode}${capCode}`;
        }

        if (familyId === "60ml-elegant-spray") {
            const capCode = cap.imageCode || cap.skuCode || "";
            return `${bottle.skuPrefix}${capCode}`;
        }

        if (familyId === "travel-atomizer") {
            const capCode = cap.skuCode || "";
            return `${bottle.skuPrefix}${capCode}`;
        }

        return bottle.skuPrefix || "";
    };

    const handleSwatchHover = (productId: string, type: 'bottle' | 'cap' | 'roller', valueId: string) => {
        setActiveSelections(prev => {
            const newSelections = {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [`${type}Id`]: valueId
                }
            };

            const sku = getCurrentSku(productId, newSelections[productId]);
            const baseUrl = 'https://www.bestbottles.com/images/store/enlarged_pics/';
            setPreviewImages(p => ({ ...p, [productId]: `${baseUrl}${sku}.gif` }));

            return newSelections;
        });
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
            {/* Breadcrumbs */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
                <div className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center space-x-2">
                    <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white">Featured Collections</span>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-4">
                    Demo Listings
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-lg">
                    This selection is provided for demonstration purposes to showcase the configurator functionality and user experience.
                </p>
            </div>

            {/* Collection List (Vertical Cards) */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-8 md:space-y-12">

                {PRODUCT_FAMILIES.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-0">

                            {/* Image Side */}
                            <div className="lg:col-span-5 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 min-h-[300px] md:min-h-[400px] flex items-center justify-center p-16 md:p-24 cursor-pointer" onClick={() => onProductClick(product.id)}>
                                <div className="relative w-full h-full flex items-center justify-center scale-[0.6] md:scale-[0.55] translate-y-2 transition-transform duration-500 group-hover:scale-[0.65] md:group-hover:scale-[0.6]">
                                    <img
                                        src={previewImages[product.id] || product.image}
                                        alt={product.name}
                                        className="w-full h-full max-h-[450px] object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-2xl"
                                    />
                                </div>

                                {/* Floating Stats */}
                                <div className="absolute bottom-6 left-6 flex gap-3">
                                    {Object.entries(product.stats).map(([label, value]) => (
                                        <div key={label} className="bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                            <div className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">{label}</div>
                                            <div className="text-xs font-bold text-[#1e1e4b] dark:text-white leading-none">{value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tag */}
                                <div className={`absolute top-6 left-6 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.tagClass}`}>
                                    {product.tag}
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center">
                                <div className="mb-6">
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1e1e4b] dark:text-white mb-1 cursor-pointer hover:text-[#C5A065] transition-colors" onClick={() => onProductClick(product.id)}>
                                        {product.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-[10px] font-bold text-[#C5A065] uppercase tracking-widest">{(product as any).originalName}</div>
                                        <div className="h-3 w-[1px] bg-gray-200 dark:bg-gray-800"></div>
                                        <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">SKU: {getCurrentSku(product.id, activeSelections[product.id])}</div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {product.description}
                                    </p>

                                </div>

                                {/* Configuration Preview */}
                                <div className="space-y-8 mb-8">
                                    {/* 1. Cap Options (if applicable) */}
                                    {product.caps.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">1. Cap Styles</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{product.caps.length} Options Available</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {product.caps.map((cap, idx) => (
                                                    <div
                                                        key={cap.id}
                                                        className={`flex flex-col items-center gap-1 group/cap cursor-pointer relative border p-1 rounded-full transition-all ${activeSelections[product.id].capId === cap.id ? 'border-[#C5A065] bg-[#C5A065]/10 shadow-sm' : 'border-transparent'}`}
                                                        onMouseEnter={() => handleSwatchHover(product.id, 'cap', cap.id)}
                                                    >
                                                        <div
                                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 shadow-inner transition-transform group-hover/cap:scale-110"
                                                            style={{ backgroundColor: cap.color }}
                                                            title={cap.name}
                                                        ></div>
                                                        <span className="text-[10px] text-gray-500 opacity-0 group-hover/cap:opacity-100 transition-opacity absolute top-full mt-1 bg-white dark:bg-black px-1.5 py-0.5 rounded shadow-lg z-20 whitespace-nowrap border border-gray-100 dark:border-gray-800 pointer-events-none">{cap.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Roller/Applicator Options (if applicable) */}
                                    {(product as any).rollers && (product as any).rollers.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">2. Applicator Type</span>
                                            <div className="flex gap-2">
                                                {(product as any).rollers.map((roller: any) => (
                                                    <div
                                                        key={roller.id}
                                                        className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-[10px] font-bold uppercase flex items-center gap-1.5 ${activeSelections[product.id].rollerId === roller.id ? 'border-[#C5A065] bg-[#C5A065]/10 text-[#C5A065]' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-gray-500'}`}
                                                        onMouseEnter={() => handleSwatchHover(product.id, 'roller', roller.id)}
                                                    >
                                                        <span className="material-symbols-outlined text-xs">{activeSelections[product.id].rollerId === roller.id ? 'radio_button_checked' : 'check_circle'}</span>
                                                        {roller.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Glass/Body Colors */}
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">3. {product.swatchLabel}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {(product as any).bottles.map((bottle: any) => (
                                                <button
                                                    key={bottle.id}
                                                    onMouseEnter={() => handleSwatchHover(product.id, 'bottle', bottle.id)}
                                                    className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 group/btn ${activeSelections[product.id].bottleId === bottle.id ? 'border-[#C5A065] bg-[#C5A065]/5 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 hover:border-[#C5A065]'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${activeSelections[product.id].bottleId === bottle.id ? 'bg-[#C5A065]' : 'bg-gray-300'}`}></div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover/btn:text-[#1e1e4b] dark:group-hover/btn:text-white">{bottle.color}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>


                                {/* Action Row */}
                                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                                        In Stock & Ready to Ship
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const currentSelection = activeSelections[product.id];
                                                const selectedBottle = product.bottles.find(b => b.id === currentSelection.bottleId);
                                                const selectedCap = product.caps.find(c => c.id === currentSelection.capId);
                                                const selectedRoller = (product as any).rollers?.find((r: any) => r.id === currentSelection.rollerId);

                                                // Calculate Price
                                                const data = (product as any).data;
                                                const basePrice = data.pricingMatrix.basePrices[currentSelection.bottleId]?.["1"] || 0;
                                                const upcharge = currentSelection.rollerId === 'metal-roller' ? data.pricingMatrix.metalRollerUpcharge : 0;
                                                const totalPrice = basePrice + upcharge;

                                                onAddToCart?.({
                                                    sku: getCurrentSku(product.id, currentSelection),
                                                    name: product.originalName,
                                                    price: totalPrice,
                                                    image: previewImages[product.id] || product.image,
                                                    variant: `${selectedBottle?.color || ''} ${selectedCap?.name || ''} ${selectedRoller?.name || ''}`.trim(),
                                                    specs: data.sharedSpecs
                                                }, 1);
                                            }}
                                            className="border border-[#1e1e4b] dark:border-white text-[#1e1e4b] dark:text-white px-4 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#1e1e4b] hover:text-white dark:hover:bg-white dark:hover:text-[#1e1e4b] transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                            Add
                                        </button>
                                        <button
                                            onClick={() => onProductClick(product.id)}
                                            className="bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:opacity-90 hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                        >
                                            Configure <span className="material-symbols-outlined text-sm">settings</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Mini Footer */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-400 text-sm">Need a custom mold? <span className="text-[#C5A065] font-bold cursor-pointer hover:underline">Start a custom project</span></p>
            </div>
        </div>
    );
};