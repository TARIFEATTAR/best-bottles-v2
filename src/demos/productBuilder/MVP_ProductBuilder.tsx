
import React, { useState } from 'react';
import { useProductConfig } from '../../hooks/useProductConfig';
import { ProductViewer } from '../../components/ProductViewer';

interface Props {
    productSlug?: string;
}

export const MVP_ProductBuilder: React.FC<Props> = ({ productSlug = '9ml-roll-on-bottle' }) => {
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

    // Auto-select defaults when loaded
    React.useEffect(() => {
        if (product) {
            if (!selectedGlassId && product.defaultGlass) setSelectedGlassId(product.defaultGlass._id);
            if (!selectedFitmentId && product.fitmentVariants?.length > 0) setSelectedFitmentId(product.fitmentVariants[0]._id);
            if (!selectedCapId && product.capOptions?.length > 0) setSelectedCapId(product.capOptions[0]._id);
        }
    }, [product]);

    if (loading) return <div className="p-10 flex justify-center">Loading Configuration...</div>;
    if (error || !product) return <div className="p-10 text-red-500">Error loading product or product not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* LEFT: Viewer */}
            <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white border-r border-gray-200">
                <div className="w-full max-w-[600px]">
                    <ProductViewer
                        glassImage={selectedGlass?.layerImageUrl}
                        fitmentImage={selectedFitment?.layerImageUrl} // Optional
                        capImage={selectedCap?.layerImageUrl}
                        capOffsetY={selectedCap?.assemblyOffsetY || 0}
                        isLoading={loading}
                    />
                </div>
            </div>

            {/* RIGHT: Controls */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <h1 className="text-2xl font-serif text-primary mb-2">{product.title}</h1>
                <p className="text-sm text-gray-500 mb-8">Configure your perfect bottle.</p>

                {/* 1. Glass Selection (Currently just one default in this simple schema, but expandable) */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Glass Finish</h3>
                    <div className="flex gap-3 flex-wrap">
                        {product.glassOptions?.map((glass) => (
                            <button
                                key={glass._id}
                                className={`px-4 py-2 rounded border transition-all ${selectedGlassId === glass._id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-gray-200 hover:border-gray-300'}`}
                                onClick={() => setSelectedGlassId(glass._id)}
                            >
                                <span className="text-sm font-medium">{glass.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Fitment Selection */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Mechanism</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {product.fitmentVariants?.map(fitment => (
                            <button
                                key={fitment._id}
                                onClick={() => setSelectedFitmentId(fitment._id)}
                                className={`flex items-center gap-3 p-3 rounded border text-left transition-all ${selectedFitmentId === fitment._id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{fitment.name}</div>
                                    <div className="text-xs text-gray-500">{fitment.type}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Cap Selection */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Cap Style</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {product.capOptions?.map(cap => (
                            <button
                                key={cap._id}
                                onClick={() => setSelectedCapId(cap._id)}
                                className={`flex items-center gap-3 p-3 rounded border text-left transition-all ${selectedCapId === cap._id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                {/* Preview Swatch if we had one, else generic circle */}
                                <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex-shrink-0" />

                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{cap.name}</div>
                                    <div className="text-xs text-gray-500">{cap.finish}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Unit Price</div>
                            <div className="text-2xl font-serif text-primary">$1.25</div>
                        </div>
                        <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium">
                            Request Samples
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
