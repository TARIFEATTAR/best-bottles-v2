
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

    // Auto-select defaults when loaded
    React.useEffect(() => {
        if (product) {
            if (!selectedGlassId && product.defaultGlass) setSelectedGlassId(product.defaultGlass._id);
            if (!selectedFitmentId && product.fitmentVariants?.length > 0) setSelectedFitmentId(product.fitmentVariants[0]._id);
            if (!selectedCapId && product.capOptions?.length > 0) setSelectedCapId(product.capOptions[0]._id);
        }
    }, [product]);

    const handleAddToCart = () => {
        if (!product || !onAddToCart) return;

        const configuredProduct = {
            id: product.shopifyProductId || product._id,
            name: product.title,
            price: totalPrice,
            sku: product.sku || 'CUSTOM-BOTTLE',
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

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium italic">Preparing your studio...</p>
        </div>
    );

    if (error || !product) return <div className="p-10 text-red-500 text-center">Error loading configuration. Please try again later.</div>;

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row">
            {/* LEFT: Viewer */}
            <div className="w-full md:w-3/5 p-8 lg:p-16 flex items-center justify-center bg-[#F5F3EF] border-r border-gray-100 relative">
                <div className="w-full max-w-[700px] drop-shadow-2xl">
                    <ProductViewer
                        glassImage={selectedGlass?.layerImageUrl}
                        fitmentImage={selectedFitment?.layerImageUrl}
                        capImage={selectedCap?.layerImageUrl}
                        capOffsetY={selectedCap?.assemblyOffsetY || 0}
                        capOffsetX={selectedCap?.assemblyOffsetX || 0}
                        isLoading={loading}
                    />
                </div>

                {/* Visual Label */}
                <div className="absolute top-8 left-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Preview Mode</span>
                </div>
            </div>

            {/* RIGHT: Controls */}
            <div className="w-full md:w-2/5 p-8 lg:p-12 overflow-y-auto bg-white">
                <div className="max-w-md mx-auto">
                    <header className="mb-12">
                        <h1 className="text-3xl lg:text-4xl font-serif text-[#1D1D1F] mb-3">{product.title}</h1>
                        <p className="text-gray-500 font-light text-lg">Artisanal configuration for premium brands.</p>
                    </header>

                    {/* 1. Glass Selection */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">01. Bottle Finish</h3>
                            <span className="text-xs text-gray-400 font-medium">{selectedGlass?.name}</span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {product.glassOptions?.map((glass) => (
                                <button
                                    key={glass._id}
                                    className={`relative w-14 h-14 rounded-full border-2 transition-all p-1 ${selectedGlassId === glass._id
                                        ? 'border-primary ring-2 ring-primary/20 scale-110'
                                        : 'border-transparent hover:border-gray-200'}`}
                                    onClick={() => setSelectedGlassId(glass._id)}
                                    title={glass.name}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-gray-100 shadow-inner">
                                        {glass.previewSwatchUrl ? (
                                            <img src={glass.previewSwatchUrl} alt={glass.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full" style={{ backgroundColor: glass.hexColor || '#eee' }} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Mechanism Toggle (Simplified Segmented Control) */}
                    <div className="mb-10 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Internal Mechanism</h3>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-400 font-mono">Precision Fit</span>
                        </div>

                        <div className="flex p-1 bg-gray-200/50 rounded-xl">
                            {product.fitmentVariants?.map(fitment => (
                                <button
                                    key={fitment._id}
                                    onClick={() => setSelectedFitmentId(fitment._id)}
                                    className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedFitmentId === fitment._id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {fitment.name.toLowerCase().includes('metal') ? 'settings' : 'mode_standby'}
                                    </span>
                                    {fitment.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 italic text-center">Toggled selection for high-precision components.</p>
                    </div>

                    {/* 3. Cap Selection */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">02. Cap Style</h3>
                            <span className="text-xs text-gray-400 font-medium">{selectedCap?.name}</span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {product.capOptions?.map(cap => (
                                <button
                                    key={cap._id}
                                    onClick={() => setSelectedCapId(cap._id)}
                                    className={`relative w-14 h-14 rounded-full border-2 transition-all p-1 ${selectedCapId === cap._id
                                        ? 'border-primary ring-2 ring-primary/20 scale-110'
                                        : 'border-transparent hover:border-gray-200'}`}
                                    title={cap.name}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-gray-100 shadow-inner">
                                        {cap.previewSwatchUrl ? (
                                            <img src={cap.previewSwatchUrl} alt={cap.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary & Checkout */}
                    <div className="mt-auto p-8 rounded-3xl bg-[#F5F3EF] border border-[#EBE7DD]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Unit Price (Estimated)</div>
                                <div className="text-3xl font-serif text-primary">${totalPrice.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Est. Lead Time</div>
                                <div className="text-sm font-medium text-gray-700">6-8 Weeks</div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-[#1D1D1F] text-white px-8 py-5 rounded-2xl hover:bg-primary transition-all shadow-xl shadow-black/10 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                            Add to Order
                        </button>
                        <p className="text-[9px] text-gray-400 text-center mt-4 uppercase tracking-[0.1em]">Volume discounts applied in cart</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
