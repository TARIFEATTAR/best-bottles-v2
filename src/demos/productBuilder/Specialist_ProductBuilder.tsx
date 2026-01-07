
import React, { useState, useMemo } from 'react';
import { useProductConfig } from '../../hooks/useProductConfig';
import { ProductViewer } from '../../components/ProductViewer';

interface Props {
    productSlug?: string;
    onAddToCart?: (product: any, quantity: number) => void;
}

export const Specialist_ProductBuilder: React.FC<Props> = ({
    productSlug = '5ml-cylinder-master',
    onAddToCart
}) => {
    const { product, loading, error } = useProductConfig(productSlug);

    // Selection State
    const [selectedGlassId, setSelectedGlassId] = useState<string | null>(null);
    const [selectedFitmentId, setSelectedFitmentId] = useState<string | null>(null);
    const [selectedCapId, setSelectedCapId] = useState<string | null>(null);

    // State for Blueprint Mode
    const [showBlueprint, setShowBlueprint] = useState(false);

    // Interaction states
    const [isPeeking, setIsPeeking] = useState(false);
    const [isBrowsingFitments, setIsBrowsingFitments] = useState(false);

    // Categorized Fitments
    const categorizedFitments = useMemo(() => {
        if (!product?.fitmentVariants) return { rollers: [], sprayers: [] };

        return {
            rollers: product.fitmentVariants.filter((f: any) => f.name.toLowerCase().includes('roll')),
            sprayers: product.fitmentVariants.filter((f: any) => f.name.toLowerCase().includes('spry') || f.name.toLowerCase().includes('spray'))
        };
    }, [product]);

    // Derived Selections
    const selectedGlass = product?.glassOptions?.find(g => g._id === selectedGlassId)
        || product?.defaultGlass;

    const selectedFitment = product?.fitmentVariants?.find(f => f._id === selectedFitmentId);
    const selectedCap = product?.capOptions?.find(c => c._id === selectedCapId);

    const isSprayFitment = selectedFitment?.name.toLowerCase().includes('spry') || selectedFitment?.name.toLowerCase().includes('spray');

    // Auto-select defaults
    React.useEffect(() => {
        if (product) {
            if (!selectedGlassId && product.defaultGlass) setSelectedGlassId(product.defaultGlass._id);
            if (!selectedFitmentId && product.fitmentVariants?.length > 0) setSelectedFitmentId(product.fitmentVariants[0]._id);
            if (!selectedCapId && product.capOptions?.length > 0) setSelectedCapId(product.capOptions[0]._id);
        }
    }, [product]);

    // Price Calculation
    const basePrice = product?.basePrice || 0.55;
    const glassModifier = selectedGlass?.priceModifier || 0;
    const capModifier = isSprayFitment ? 0 : (selectedCap?.priceModifier || 0);
    const totalPrice = basePrice + glassModifier + capModifier;

    const handleAddToCart = () => {
        if (!product || !onAddToCart) return;

        let finalSku = product.sku || 'CUSTOM-BOTTLE';
        if (selectedGlass?.skuPart && selectedFitment?.skuPart && (selectedCap?.skuPart || isSprayFitment)) {
            finalSku = `${selectedGlass.skuPart}${selectedFitment.skuPart}${isSprayFitment ? '' : selectedCap?.skuPart}`;
        }

        const configuredProduct = {
            id: product.shopifyProductId || product._id,
            name: `${product.title} (${selectedGlass?.name}, ${selectedFitment?.name})`,
            price: totalPrice,
            sku: finalSku,
            variant: `${selectedGlass?.name || 'Standard'} / ${selectedFitment?.name || 'Standard'}`,
            image: selectedGlass?.layerImageUrl || product.defaultGlass?.layerImageUrl,
            attributes: [
                { key: "Glass", value: selectedGlass?.name },
                { key: "Mechanism", value: selectedFitment?.name },
                { key: "Cap", value: isSprayFitment ? "Included Overcap" : selectedCap?.name }
            ]
        };

        onAddToCart(configuredProduct, 1);
    };

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

                    {/* Main Image Container */}
                    <div className="w-full max-w-[550px] xl:max-w-[650px] aspect-square transition-all duration-700">
                        <div className={`h-full w-full transition-transform duration-500 ${showBlueprint ? 'scale-110' : 'scale-100 hover:scale-[1.02]'}`}>
                            <ProductViewer
                                glassImage={selectedGlass?.layerImageUrl}
                                fitmentImage={selectedFitment?.layerImageUrl}
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
                <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-white">
                    <div className="flex-1 p-8 lg:p-12 xl:p-16">
                        <header className="mb-12 text-center lg:text-left">
                            <div className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-4">The Bottle Specialist</div>
                            <h1 className="text-4xl xl:text-5xl font-serif text-[#1D1D1F] leading-tight mb-4">5ML Cylinder Master</h1>
                            <div className="h-px w-12 bg-primary/30 mb-6 mx-auto lg:mx-0"></div>
                            <p className="text-gray-500 font-light leading-relaxed max-w-sm mx-auto lg:mx-0">
                                Select between premium roll-on and fine mist spray delivery systems for your 5ml collection.
                            </p>
                        </header>

                        <div className="space-y-12">

                            {/* STEP 1: GLASS */}
                            <section>
                                <div className="flex items-end justify-between mb-6 pb-2 border-b border-gray-100">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                        <span className="text-primary italic mr-2 text-xs">01</span>
                                        Vessel Finish
                                    </h3>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-wider">{selectedGlass?.name}</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {product.glassOptions?.map((glass) => (
                                        <button
                                            key={glass._id}
                                            className={`relative aspect-square rounded-lg transition-all p-1.5 border ${selectedGlassId === glass._id
                                                ? 'border-primary shadow-md scale-105'
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

                            {/* STEP 2: MECHANISM (CONSOLIDATED) */}
                            <section
                                onMouseEnter={() => {
                                    setIsPeeking(true);
                                    if (isSprayFitment) setIsBrowsingFitments(true);
                                }}
                                onMouseLeave={() => {
                                    setIsPeeking(false);
                                    setIsBrowsingFitments(false);
                                }}
                            >
                                <div className="flex items-end justify-between mb-6 pb-2 border-b border-gray-100">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                        <span className="text-primary italic mr-2 text-xs">02</span>
                                        {isSprayFitment ? 'Spray Delivery' : 'Roll-On Mechanism'}
                                    </h3>
                                    <span className="text-[10px] text-amber-600 font-bold tracking-widest uppercase">Precision Fit</span>
                                </div>

                                {/* CATEGORY SELECTOR */}
                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={() => setSelectedFitmentId(categorizedFitments.rollers[0]?._id)}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${!isSprayFitment ? 'bg-[#1D1D1F] text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        Roll-On Options
                                    </button>
                                    <button
                                        onClick={() => setSelectedFitmentId(categorizedFitments.sprayers[0]?._id)}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${isSprayFitment ? 'bg-[#1D1D1F] text-white border-transparent shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        Spray Options
                                    </button>
                                </div>

                                {/* OPTIONS GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {(isSprayFitment ? categorizedFitments.sprayers : categorizedFitments.rollers).map(fitment => (
                                        <button
                                            key={fitment._id}
                                            onClick={() => setSelectedFitmentId(fitment._id)}
                                            className={`relative p-3 rounded-xl border transition-all text-left flex flex-col gap-2 ${selectedFitmentId === fitment._id
                                                ? 'border-primary bg-primary/[0.02] shadow-sm'
                                                : 'border-gray-100 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-50 border border-gray-100">
                                                    {fitment.previewSwatchUrl ? (
                                                        <img src={fitment.previewSwatchUrl} alt={fitment.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-gray-300 text-xs">{isSprayFitment ? 'spray' : 'roll-on'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedFitmentId === fitment._id && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700 leading-tight">
                                                {fitment.name.replace(' fitment', '').replace(' Sprayer', '').replace(' Mist', '')}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* STEP 3: CAP / OVERCAP */}
                            <section>
                                <div className="flex items-end justify-between mb-6 pb-2 border-b border-gray-100">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
                                        <span className="text-primary italic mr-2 text-xs">03</span>
                                        {isSprayFitment ? 'Included Overcap' : 'Enclosure Style'}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                                        {isSprayFitment ? (selectedFitment?.name?.replace(' fitment', '').replace(' Sprayer', '').replace(' Mist', '') + ' Cap') : selectedCap?.name}
                                    </span>
                                </div>

                                {isSprayFitment ? (
                                    /* Special Overcap Preview for Sprayers */
                                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-white bg-white flex-shrink-0 group">
                                            {selectedFitment?.overcapImageUrl ? (
                                                <img
                                                    src={selectedFitment.overcapImageUrl}
                                                    alt="Overcap Preview"
                                                    className="w-full h-full object-contain p-1 transition-transform group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                                                Premium {selectedFitment?.name?.replace(' fitment', '')} Enclosure
                                            </h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                                                Factory-matched design ensuring a perfect airtight seal and unified aesthetic.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Standard Cap Grid for Roll-Ons */
                                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                                        {product.capOptions?.map(cap => (
                                            <button
                                                key={cap._id}
                                                onClick={() => setSelectedCapId(cap._id)}
                                                className={`relative aspect-square rounded-full transition-all p-1 border-2 ${selectedCapId === cap._id
                                                    ? 'border-primary shadow-md scale-110'
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
                        </div>
                    </div>

                    {/* STICKY CTA BAR */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-8 lg:p-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-30">
                        <div className="flex items-center justify-between gap-8 max-w-2xl mx-auto">
                            <div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2 text-center lg:text-left">Estimated Unit Price</div>
                                <div className="text-4xl font-serif text-[#1D1D1F]">${totalPrice.toFixed(2)}</div>
                            </div>

                            <div className="hidden sm:block h-10 w-px bg-gray-100"></div>

                            <div className="hidden sm:block">
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">Inventory Access</div>
                                <div className="text-xs font-bold text-gray-800 tracking-wider">6-8 WEEK LEAD TIME</div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 lg:flex-none min-w-[200px] bg-[#1D1D1F] text-white px-10 py-5 rounded-xl hover:bg-primary transition-all shadow-xl shadow-black/10 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                                Add to Order
                            </button>
                        </div>
                        <div className="mt-4 text-[9px] text-gray-400 text-center uppercase tracking-widest font-light">
                            Volume Tier Pricing tier applied at checkout
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
