/**
 * Blueprint Builder V2 Demo
 * Demo #4: Architectural Bottle Configurator
 * 
 * An industrial design / CAD-style product configuration experience.
 * NOT a photo compositor - uses flat vector overlays only.
 * 
 * Canonical Product Specs:
 * - Height with cap: 83mm
 * - Height without cap: 70mm
 * - Diameter: 20mm
 * - Neck thread: 17-415
 * 
 * Route: /demo/blueprint-builder-v2
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBottleModel, type BottleModelData } from '../../lib/sanityDemo';
import {
    ArchitecturalBottleCanvas,
    type GlassColor,
    type CapFinish,
} from './ArchitecturalBottleCanvas';

// ============================================
// MATERIAL OPTIONS (FLAT COLORS, NOT PHOTOS)
// ============================================



// ============================================
// SWATCH SELECTOR COMPONENT
// ============================================

interface SwatchSelectorProps<T> {
    label: string;
    stepNumber: number;
    options: T[];
    selectedId: string | null;
    onSelect: (option: T) => void;
    disabled?: boolean;
    getColor: (option: T) => string;
    getImage?: (option: T) => string | undefined;
    getName: (option: T) => string;
    getId: (option: T) => string;
}

function SwatchSelector<T>({
    label,
    stepNumber,
    options,
    selectedId,
    onSelect,
    disabled = false,
    getColor,
    getImage,
    getName,
    getId,
}: SwatchSelectorProps<T>) {
    return (
        <div className={`transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold flex items-center justify-center">
                        {stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                </div>
                {selectedId && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] text-emerald-600 font-medium"
                    >
                        ✓ Selected
                    </motion.span>
                )}
            </div>

            {/* Swatches */}
            <div className="grid grid-cols-3 gap-2">
                {options.map((option) => {
                    const id = getId(option);
                    const isActive = selectedId === id;
                    const color = getColor(option);
                    const image = getImage ? getImage(option) : undefined;
                    const name = getName(option);

                    return (
                        <motion.button
                            key={id}
                            onClick={() => onSelect(option)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all
                ${isActive
                                    ? 'border-[#1a1a1a] bg-gray-50 ring-1 ring-[#1a1a1a]/20'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }
              `}
                        >
                            {/* Color swatch */}
                            <div
                                className={`
                  w-8 h-8 rounded-full border transition-all overflow-hidden relative
                  ${isActive ? 'ring-2 ring-offset-1 ring-[#1a1a1a]/30' : ''}
                `}
                                style={{
                                    backgroundColor: color,
                                    borderColor: color === '#fafafa' ? '#e5e5e5' : 'transparent',
                                }}
                            >
                                {image && (
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-medium ${isActive ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
                                {name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// MAIN DEMO COMPONENT
// ============================================

export const BlueprintBuilderV2: React.FC = () => {
    // Data State
    const [bottleData, setBottleData] = useState<BottleModelData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Selection state (initialize as null, set when data loads)
    const [selectedGlass, setSelectedGlass] = useState<GlassColor | null>(null);
    const [selectedCap, setSelectedCap] = useState<CapFinish | null>(null);

    // View state
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [showCap, setShowCap] = useState(false); // Default: No Cap

    // Fetch Data on Mount
    useEffect(() => {
        async function loadData() {
            try {
                console.log("Fetching bottle model...");
                const data = await fetchBottleModel();
                console.log("Fetched data:", data);

                if (data) {
                    setBottleData(data);
                    // Default State: Select first glass, but no cap
                    if (data.glassOptions.length > 0) {
                        const defaultGlass = data.glassOptions[0];
                        setSelectedGlass({
                            id: defaultGlass._id,
                            name: defaultGlass.name,
                            fill: defaultGlass.colorHex || '#f0f4f8',
                            opacity: defaultGlass.name.toLowerCase() === 'frosted' ? 0.4 : 0.2,
                            swatchUrl: defaultGlass.swatchUrl,
                            overlayUrl: defaultGlass.overlayUrl
                        });
                    }
                } else {
                    console.warn("No data returned from Sanity demo dataset.");
                }
            } catch (err) {
                console.error("Failed to load blueprint data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Derived state
    const isComplete = selectedGlass && selectedCap;
    const currentStep = !selectedGlass ? 1 : !selectedCap ? 2 : 3;

    // Handlers
    const handleReset = () => {
        if (bottleData?.glassOptions.length) {
            const defaultGlass = bottleData.glassOptions[0];
            setSelectedGlass({
                id: defaultGlass._id,
                name: defaultGlass.name,
                fill: defaultGlass.colorHex || '#f0f4f8',
                opacity: 0.2
            });
        }
        setSelectedCap(null);
        setShowCap(true);
        setShowMeasurements(false);
    };

    // Transform Sanity Data references to Component Props
    // We Map Sanity data to the local interface shape expected by the UI
    const glassOptionsInternal: (GlassColor & { swatchUrl?: string })[] = bottleData?.glassOptions.map(g => ({
        id: g._id,
        name: g.name,
        fill: g.colorHex || '#f0f4f8',
        opacity: g.name.toLowerCase() === 'frosted' ? 0.4 : 0.2, // Simple heuristic for demo
        swatchUrl: g.swatchUrl,
        overlayUrl: g.overlayUrl // Pass texture URL
    })) || [];



    const capOptionsInternal: (CapFinish & { swatchUrl?: string })[] = bottleData?.capOptions.map(c => ({
        id: c._id,
        name: c.name,
        fill: getColorForCap(c.name), // Helper to map names to approximate hex colors
        gradient: c.finish === 'Polished' ? 'subtle' : undefined,
        swatchUrl: c.swatchUrl,
        overlayUrl: c.overlayUrl // Pass texture URL
    })) || [];

    // -- Helper for Cap Colors since we didn't store hexes in Sanity for caps (only finish) --
    function getColorForCap(name: string): string {
        const n = name.toLowerCase();
        if (n.includes('gold')) return '#d4af37';
        if (n.includes('silver')) return '#c0c0c0';
        if (n.includes('copper')) return '#b87333';
        if (n.includes('rose')) return '#b76e79';
        if (n.includes('black')) return '#1a1a1a';
        if (n.includes('white')) return '#fafafa';
        return '#cccccc';
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-gray-300 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a] font-sans flex flex-col">

            {/* ========== HEADER ========== */}
            <header className="px-8 py-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl" style={{ color: '#5a7a9a' }}>architecture</span>
                        9ml Roll-On Blueprint
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-gray-200">
                            Demo #4
                        </span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        83mm × Ø20mm • 17-415 Thread
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {isComplete && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={handleReset}
                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Reset
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* ========== MAIN LAYOUT ========== */}
            <main className="flex-grow flex">

                {/* ===== LEFT PANEL: SELECTIONS ===== */}
                <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">

                    {/* Header Actions */}
                    <div className="flex items-center justify-between mb-8 p-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-light text-[#1a1a1a]">9ml Roll-On Blueprint</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-gray-400">
                                    {bottleData?.dimensions?.heightWithCap || '83'}mm × Ø{bottleData?.dimensions?.diameter || '20'}mm
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                                    DEMO #{bottleData?._id?.slice(-4) || '---'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8 px-4">
                        {/* Toggle: Blueprint Mode (Only if Complete) */}
                        <div className={`flex items-center justify-between transition-opacity duration-300 ${!isComplete ? 'opacity-40 pointer-events-none' : ''}`}>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Blueprint Mode</span>
                            <button
                                onClick={() => setShowMeasurements(!showMeasurements)}
                                disabled={!isComplete} // Disabled via pointer-events-none above mostly
                                className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                ${showMeasurements ? 'bg-[#1a1a1a]' : 'bg-gray-200'}
                            `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${showMeasurements ? 'translate-x-5' : 'translate-x-0'}
                                `}
                                />
                            </button>
                        </div>

                        {/* Toggle: Show Cap */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Show Cap</span>
                            <button
                                onClick={() => setShowCap(!showCap)}
                                className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                ${showCap ? 'bg-[#5a7a9a]' : 'bg-gray-200'}
                            `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                    ${showCap ? 'translate-x-5' : 'translate-x-0'}
                                `}
                                />
                            </button>
                        </div>
                    </div>
                    {/* Selection Steps */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-6">


                        {/* Step 1: Glass */}
                        <SwatchSelector<GlassColor & { swatchUrl?: string }>
                            label="Glass Type"
                            stepNumber={1}
                            options={glassOptionsInternal}
                            selectedId={selectedGlass?.id || null}
                            onSelect={(opt: GlassColor) => setSelectedGlass(opt)}
                            disabled={false}
                            getColor={(opt) => opt.fill}
                            getImage={(opt) => opt.swatchUrl}
                            getName={(opt) => opt.name}
                            getId={(opt) => opt.id}
                        />

                        {/* Step 2: Cap */}
                        <SwatchSelector<CapFinish & { swatchUrl?: string }>
                            label="Cap Finish"
                            stepNumber={2}
                            options={capOptionsInternal}
                            selectedId={selectedCap?.id || null}
                            onSelect={(opt: CapFinish) => setSelectedCap(opt)}
                            disabled={currentStep < 2}
                            getColor={(opt) => opt.fill}
                            getImage={(opt) => opt.swatchUrl}
                            getName={(opt) => opt.name}
                            getId={(opt) => opt.id}
                        />

                    </div>

                    {/* Status Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <AnimatePresence mode="wait">
                            {isComplete ? (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-emerald-600 text-base filled-icon">check_circle</span>
                                        <span className="text-xs font-semibold text-emerald-700">Configuration Complete</span>
                                    </div>
                                    <div className="text-[10px] text-emerald-600 space-y-0.5 font-mono">
                                        <div>Glass: {selectedGlass?.name}</div>
                                        <div>Cap: {selectedCap?.name}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="progress"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-gray-400"
                                >
                                    Step {currentStep} of 2
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ===== CENTER: CANVAS ===== */}
                <div className="flex-grow flex items-center justify-center relative overflow-hidden">

                    {/* Product Label */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10">
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">9ml Cylinder Roll-On</p>
                    </div>

                    {/* Architectural Canvas */}
                    <ArchitecturalBottleCanvas
                        glassColor={selectedGlass}
                        capFinish={selectedCap}
                        showCap={showCap}
                        showMeasurements={showMeasurements}
                        showGrid={true}
                        outlineUrl={bottleData?.outlineImageUrl}
                        width="100%"
                        height="100%"
                        // Dynamic dimensions
                        heightTotal={bottleData?.dimensions?.heightWithCap || 83}
                        heightBody={bottleData?.dimensions?.heightWithoutCap || 70}
                        diameter={bottleData?.dimensions?.diameter || 20}
                        thread={bottleData?.dimensions?.thread || '17-415'}
                    />

                    {/* Step Progress Indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center gap-2">
                                <div
                                    className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                    ${currentStep > step
                                            ? 'bg-emerald-500 text-white'
                                            : currentStep === step
                                                ? 'bg-[#1a1a1a] text-white ring-2 ring-[#1a1a1a]/20'
                                                : 'bg-gray-200 text-gray-400'
                                        }
                  `}
                                >
                                    {currentStep > step ? '✓' : step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-6 h-0.5 ${currentStep > step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                </div>

                {/* ===== RIGHT PANEL: SPECS (optional) ===== */}
                {showMeasurements && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-[200px] bg-white border-l border-gray-200 p-4"
                    >
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h3>
                        <div className="space-y-2 text-xs font-mono text-gray-600">
                            <div className="flex justify-between">
                                <span>Capacity</span>
                                <span className="text-[#1a1a1a] font-semibold">9ml</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Height (w/ cap)</span>
                                <span className="text-[#1a1a1a] font-semibold">{bottleData?.dimensions?.heightWithCap || 83}mm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Height (w/o cap)</span>
                                <span className="text-[#1a1a1a] font-semibold">{bottleData?.dimensions?.heightWithoutCap || 70}mm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Diameter</span>
                                <span className="text-[#1a1a1a] font-semibold">Ø{bottleData?.dimensions?.diameter || 20}mm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Neck Thread</span>
                                <span className="text-[#1a1a1a] font-semibold">{bottleData?.dimensions?.thread || '17-415'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

            </main>
        </div>
    );
};

export default BlueprintBuilderV2;
