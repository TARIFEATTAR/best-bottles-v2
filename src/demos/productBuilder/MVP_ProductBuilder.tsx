
import React, { useState } from 'react';
import { useProductConfig } from '../../hooks/useProductConfig';
import { ProductViewer } from '../../components/ProductViewer';

interface Props {
    productSlug?: string;
    onAddToCart?: (product: any, quantity: number) => void;
}

export const MVP_ProductBuilder: React.FC<Props> = ({
    productSlug = '9ml-roll-on-bottle',
    onAddToCart
}) => {
    const { product, loading, error } = useProductConfig(productSlug);

    // Selection State
    const [selectedGlassId, setSelectedGlassId] = useState<string | null>(null);
    const [selectedFitmentId, setSelectedFitmentId] = useState<string | null>(null);
    const [selectedCapId, setSelectedCapId] = useState<string | null>(null);

    // State for Blueprint Mode
    const [showBlueprint, setShowBlueprint] = useState(false);

    // Ghost Cap Interaction
    const [isPeeking, setIsPeeking] = useState(false);

    // Sprayer Browsing Mode
    const [isBrowsingFitments, setIsBrowsingFitments] = useState(false);

    // Derived Selections
    const selectedGlass = product?.glassOptions?.find(g => g._id === selectedGlassId)
        || product?.defaultGlass;

    const selectedFitment = product?.fitmentVariants?.find(f => f._id === selectedFitmentId);
    const selectedCap = product?.capOptions?.find(c => c._id === selectedCapId);

    // Price Calculation
    const basePrice = product?.basePrice || 1.25;
    const glassModifier = selectedGlass?.priceModifier || 0;
    const capModifier = selectedCap?.priceModifier || 0;
    const totalPrice = basePrice + glassModifier + capModifier;

    // Auto-select defaults
    React.useEffect(() => {
        if (product) {
            if (!selectedGlassId && product.defaultGlass) setSelectedGlassId(product.defaultGlass._id);
            if (!selectedFitmentId && product.fitmentVariants?.length > 0) setSelectedFitmentId(product.fitmentVariants[0]._id);
            if (!selectedCapId && product.capOptions?.length > 0) setSelectedCapId(product.capOptions[0]._id);
        }
    }, [product]);

    const handleAddToCart = () => {
        if (!product || !onAddToCart) return;

        let finalSku = product.sku || 'CUSTOM-BOTTLE';
        if (selectedGlass?.skuPart && selectedFitment?.skuPart && selectedCap?.skuPart) {
            finalSku = `${selectedGlass.skuPart}${selectedFitment.skuPart}${selectedCap.skuPart}`;
        }

        const configuredProduct = {
            id: product.shopifyProductId || product._id,
            name: `${product.title} (${selectedGlass?.name}, ${selectedCap?.name})`,
            price: totalPrice,
            sku: finalSku,
            variant: `${selectedGlass?.name || 'Standard'} / ${selectedCap?.name || 'Standard'}`,
            image: selectedGlass?.layerImageUrl || product.defaultGlass?.layerImageUrl,
            attributes: [
                { key: "Glass", value: selectedGlass?.name },
                { key: "Mechanism", value: selectedFitment?.name },
                { key: "Cap", value: selectedCap?.name }
            ]
        };

        onAddToCart(configuredProduct, 1);
    };

    const isFlatCap = selectedCap?.name?.toLowerCase().includes('flat');
    const isSprayFitment = selectedFitment?.type === 'Spray';
    const isSprayProduct = !product?.capOptions || product.capOptions.length === 0;
    const showFitment = !isFlatCap && selectedFitment;

    const effectiveCapImage = isSprayFitment
        ? (isBrowsingFitments ? undefined : selectedFitment?.overcapImageUrl)
        : selectedCap?.layerImageUrl;

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-gray-400 font-serif italic">Curating your experience...</p>
            </div>
        </div>
    );

    if (error || !product) return <div className="p-20 text-center font-serif text-red-800">Unable to load configuration.</div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* LEFT: DRAMATIC HERO VIEWER */}
                <div className="w-full lg:w-[55%] xl:w-[60%] bg-[#F5F3EF] relative flex items-center justify-center p-6 lg:p-12 overflow-hidden border-r border-gray-100">
                    {/* View Controls */}
                    <div className="absolute top-8 left-8 z-20 flex gap-2">
                        <button
                            onClick={() => setShowBlueprint(false)}
                            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm ${!showBlueprint ? 'bg-[#1D1D1F] text-white' : 'bg-white/80 text-gray-500 hover:bg-white'}`}
                        >
                            Gallery
                        </button>
                        <button
                            onClick={() => setShowBlueprint(true)}
                            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm flex items-center gap-2 ${showBlueprint ? 'bg-blue-900 text-white' : 'bg-white/80 text-gray-500 hover:bg-white'}`}
                        >
                            Blueprint <span className="material-symbols-outlined text-[14px]">architecture</span>
                        </button>
                    </div>

                    {/* Main Image Container - MUCH LARGER NOW */}
                    <div className="w-full max-w-[550px] xl:max-w-[650px] aspect-square transition-all duration-700">
                        <div className={`h-full w-full transition-transform duration-500 ${showBlueprint ? 'scale-110' : 'scale-100 hover:scale-[1.02]'}`}>
                            <ProductViewer
                                glassImage={selectedGlass?.layerImageUrl}
                                fitmentImage={showFitment ? selectedFitment?.layerImageUrl : undefined}
                                capImage={effectiveCapImage}
                                isLoading={loading}
                                showBlueprint={showBlueprint}
                                ghostCap={isPeeking && !isSprayFitment}
                                isSpray={isSprayFitment}
                            />
                        </div>
                    </div>

                    {/* Exploded View Context */}
                    {showBlueprint && (
                        <div className="absolute bottom-8 left-8 text-[10px] text-gray-400 font-serif italic">
                            * Technical specification: 1:1 Scale Representation
                        </div>
                    )}
                </div>

                {/* RIGHT: PREMIUM CONTROLS PANEL */}
                <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-white h-screen overflow-hidden">
                    <div className="overflow-y-auto custom-scrollbar">
                        <div className="p-6 lg:p-8">
                            <header className="mb-6">
                                <div className="text-[9px] text-primary font-bold uppercase tracking-[0.3em] mb-2">Master Collection</div>
                                <h1 className="text-3xl font-serif text-[#1D1D1F] leading-tight mb-2">{product.title}</h1>
                                <div className="h-px w-12 bg-primary/30 mb-3"></div>
                                <p className="text-xs text-gray-500 font-light leading-relaxed max-w-sm">
                                    Bespoke configuration for high-performance fragrance brands.
                                </p>
                            </header>

                            <div className="space-y-6">

                                {/* STEP 1: GLASS */}
                                <section>
                                    <div className="flex items-end justify-between mb-3 pb-2 border-b border-gray-100">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                            <span className="text-primary italic mr-2 text-xs">01</span>
                                            Vessel Finish
                                        </h3>
                                        <span className="text-[9px] text-gray-400 font-medium tracking-wider">{selectedGlass?.name}</span>
                                    </div>
                                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                        {product.glassOptions?.map((glass) => (
                                            <button
                                                key={glass._id}
                                                className={`relative aspect-square rounded-lg transition-all p-1 border ${selectedGlassId === glass._id
                                                    ? 'border-primary shadow-sm scale-105'
                                                    : 'border-transparent hover:border-gray-200 bg-gray-50'}`}
                                                onClick={() => setSelectedGlassId(glass._id)}
                                            >
                                                <div className="w-full h-full rounded-md overflow-hidden shadow-inner">
                                                    {glass.previewSwatchUrl ? (
                                                        <img src={glass.previewSwatchUrl} alt={glass.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full" style={{ backgroundColor: glass.hexColor || '#eee' }} />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* STEP 2: MECHANISM */}
                                <section
                                    onMouseEnter={() => {
                                        setIsPeeking(true);
                                        if (isSprayProduct) setIsBrowsingFitments(true);
                                    }}
                                    onMouseLeave={() => {
                                        setIsPeeking(false);
                                        setIsBrowsingFitments(false);
                                    }}
                                >
                                    <div className="flex items-end justify-between mb-3 pb-2 border-b border-gray-100">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                            <span className="text-primary italic mr-2 text-xs">02</span>
                                            {isSprayProduct ? 'Delivery System' : 'Internal Mechanism'}
                                        </h3>
                                        <span className="text-[9px] text-amber-600 font-bold tracking-widest uppercase">Precision Fit</span>
                                    </div>

                                    {isFlatCap ? (
                                        <div className="text-xs text-amber-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">info</span>
                                            Flat caps are incompatible with rollers.
                                        </div>
                                    ) : isSprayProduct ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {product.fitmentVariants?.map(fitment => (
                                                <button
                                                    key={fitment._id}
                                                    onClick={() => setSelectedFitmentId(fitment._id)}
                                                    className={`relative p-2 rounded-lg border transition-all text-left flex flex-col gap-1.5 ${selectedFitmentId === fitment._id
                                                        ? 'border-primary bg-primary/[0.02] shadow-sm'
                                                        : 'border-gray-100 hover:border-gray-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                                            {fitment.previewSwatchUrl ? (
                                                                <img src={fitment.previewSwatchUrl} alt={fitment.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-gray-300 text-[10px]">spray</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {selectedFitmentId === fitment._id && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                                                    </div>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700 leading-tight">
                                                        {fitment.name.replace(' Sprayer', '').replace(' Mist', '')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            {product.fitmentVariants?.map(fitment => (
                                                <button
                                                    key={fitment._id}
                                                    onClick={() => setSelectedFitmentId(fitment._id)}
                                                    className={`flex-1 group relative overflow-hidden py-3 px-4 rounded-lg border transition-all flex flex-col items-center gap-1.5 ${selectedFitmentId === fitment._id
                                                        ? 'border-primary bg-white shadow-sm'
                                                        : 'border-gray-100 text-gray-400 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        {fitment.name.toLowerCase().includes('metal') ? 'settings_input_component' : 'radio_button_unchecked'}
                                                    </span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${selectedFitmentId === fitment._id ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {fitment.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* STEP 3: CAP / OVERCAP */}
                                <section>
                                    <div className="flex items-end justify-between mb-3 pb-2 border-b border-gray-100">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                            <span className="text-primary italic mr-2 text-xs">03</span>
                                            {isSprayProduct ? 'Included Overcap' : 'Enclosure Style'}
                                        </h3>
                                        <span className="text-[9px] text-gray-400 font-medium tracking-wider">
                                            {isSprayProduct ? (selectedFitment?.name?.replace('fitment', '') + ' Cap') : selectedCap?.name}
                                        </span>
                                    </div>

                                    {isSprayProduct ? (
                                        /* Special Overcap Preview for Sprayers */
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-white bg-white flex-shrink-0 group">
                                                {selectedFitment?.overcapImageUrl ? (
                                                    <img
                                                        src={selectedFitment.overcapImageUrl}
                                                        alt="Overcap Preview"
                                                        className="w-full h-full object-contain p-0.5 transition-transform group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200" />
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-900">
                                                    Premium {selectedFitment?.name?.replace('fitment', '')} Enclosure
                                                </h4>
                                                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                                                    Factory-matched for perfect seal.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Cap Grid for Roll-Ons */
                                        <div className="grid grid-cols-5 gap-2">
                                            {product.capOptions?.map(cap => (
                                                <button
                                                    key={cap._id}
                                                    onClick={() => setSelectedCapId(cap._id)}
                                                    className={`relative aspect-square rounded-full transition-all p-0.5 border-2 ${selectedCapId === cap._id
                                                        ? 'border-primary shadow-sm scale-105'
                                                        : 'border-transparent hover:border-gray-200 bg-gray-50'}`}
                                                    title={cap.name}
                                                >
                                                    <div className="w-full h-full rounded-full overflow-hidden shadow-inner bg-white">
                                                        {cap.previewSwatchUrl ? (
                                                            <img src={cap.previewSwatchUrl} alt={cap.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>
                                {/* Bottom padding to clear sticky footer */}
                                <div className="h-24"></div>
                            </div>
                        </div>
                    </div>

                    {/* STICKY CTA BAR - COMPACT */}
                    <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 lg:px-8 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-30 mt-auto">
                        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
                            <div>
                                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Unit Price</div>
                                <div className="text-2xl font-serif text-[#1D1D1F]">${totalPrice.toFixed(2)}</div>
                            </div>

                            <div className="hidden sm:block h-8 w-px bg-gray-100"></div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 lg:flex-none min-w-[180px] bg-[#1D1D1F] text-white px-6 py-3 rounded-lg hover:bg-primary transition-all shadow-lg shadow-black/5 font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                Add to Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
