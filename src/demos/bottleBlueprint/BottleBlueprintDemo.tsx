import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottleCanvas } from './BottleCanvas';
import { BlueprintToggles } from './BlueprintToggles';

// Mock Data for "Sandbox Demo" - Bottle Blueprint
const MOCK_BOTTLE_DATA = {
    name: "9ml Cylinder Roll-On",
    basePrice: 0.85,
    dimensions: {
        height: "72mm",
        diameter: "18mm",
        neckFinish: "GPI 13-415"
    },
    components: {
        bottle: {
            name: "Glass Vial",
            materials: [
                { id: "amber", name: "Amber Glass", color: "#B87333", opacity: 0.9 },
                { id: "clear", name: "Clear Glass", color: "#F0F4F8", opacity: 0.2, glass: true },
                { id: "cobalt", name: "Cobalt Blue", color: "#0047AB", opacity: 0.8 },
                { id: "frosted", name: "Frosted Glass", color: "#E0E0E0", opacity: 0.6, frosted: true }
            ]
        },
        roller: {
            name: "Roller Ball & Housing",
            materials: [
                { id: "stainless", name: "Stainless Steel", color: "#E5E7EB", metal: true },
                { id: "glass", name: "Glass Ball", color: "#F0F4F8", glass: true },
                { id: "gemstone", name: "Gemstone", color: "#D8BFD8", stone: true } // Examples
            ]
        },
        cap: {
            name: "Screw Cap",
            materials: [
                { id: "gold", name: "Gold Metal", color: "#D4AF37", metal: true },
                { id: "silver", name: "Silver Metal", color: "#C0C0C0", metal: true },
                { id: "black", name: "Black Matte", color: "#222222", matte: true },
                { id: "white", name: "White Gloss", color: "#FFFFFF", gloss: true }
            ]
        }
    }
};

export const BottleBlueprintDemo: React.FC = () => {
    // Selection States (initially null to simulate "Blueprint" -> "Select" flow)
    const [selectedBottleMat, setSelectedBottleMat] = useState<any>(null);
    const [selectedRollerMat, setSelectedRollerMat] = useState<any>(null);
    const [selectedCapMat, setSelectedCapMat] = useState<any>(null);

    // Visual Toggles
    const [showWireframe, setShowWireframe] = useState(true);
    const [showDimensions, setShowDimensions] = useState(true);

    // Completion State
    const isComplete = selectedBottleMat && selectedRollerMat && selectedCapMat;

    // Auto-fade wireframe when complete (after a short delay for effect)
    React.useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                setShowWireframe(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isComplete]);

    // Reset function for replayability
    const handleReset = () => {
        setSelectedBottleMat(null);
        setSelectedRollerMat(null);
        setSelectedCapMat(null);
        setShowWireframe(true);
        setShowDimensions(true);
    };

    // Helper to get step number
    const getStep = () => {
        if (!selectedBottleMat) return 1;
        if (!selectedRollerMat) return 2;
        if (!selectedCapMat) return 3;
        return 4; // Complete
    };

    const step = getStep();

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col">
            {/* Blueprint Header */}
            <header className="px-8 py-6 border-b border-[#D2D2D7] bg-white flex justify-between items-center z-10 sticky top-0">
                <div>
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">architecture</span>
                        Bottle Blueprint <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Labs</span>
                    </h1>
                    <p className="text-sm text-[#86868B] mt-1">Experimental Configuration Sandbox</p>
                </div>
                <div className="flex gap-4 items-center">
                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3 items-center"
                            >
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    Start Over
                                </button>
                                <div className="w-px h-6 bg-gray-200" />
                                <button className="px-5 py-2 bg-[#1D1D1F] text-white text-sm font-medium rounded-lg hover:bg-black transition-colors shadow-lg">
                                    See How This Could Scale
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <main className="flex-grow flex relative overflow-hidden">
                {/* Left Panel: Configuration */}
                <div className="w-1/4 min-w-[320px] bg-white border-r border-[#D2D2D7] p-8 flex flex-col gap-8 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-[calc(100vh-88px)]">

                    <BlueprintToggles
                        showWireframe={showWireframe}
                        setShowWireframe={setShowWireframe}
                        showDimensions={showDimensions}
                        setShowDimensions={setShowDimensions}
                    />

                    <div className="space-y-8">
                        {/* Step 1: Bottle Material */}
                        <div className={`transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">1. Select Glass</h3>
                                {selectedBottleMat && <span className="text-xs text-green-600 font-medium">Selected</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {MOCK_BOTTLE_DATA.components.bottle.materials.map((mat) => (
                                    <button
                                        key={mat.id}
                                        onClick={() => setSelectedBottleMat(mat)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedBottleMat?.id === mat.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                                            style={{ backgroundColor: mat.color, opacity: mat.opacity }}
                                        />
                                        <span className="text-sm font-medium">{mat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Roller Material */}
                        <div className={`transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">2. Select Roller Fitment</h3>
                                {selectedRollerMat && <span className="text-xs text-green-600 font-medium">Selected</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {MOCK_BOTTLE_DATA.components.roller.materials.map((mat) => (
                                    <button
                                        key={mat.id}
                                        onClick={() => setSelectedRollerMat(mat)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedRollerMat?.id === mat.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                                            style={{ backgroundColor: mat.color }}
                                        />
                                        <span className="text-sm font-medium">{mat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 3: Cap Material */}
                        <div className={`transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">3. Select Cap Finish</h3>
                                {selectedCapMat && <span className="text-xs text-green-600 font-medium">Selected</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {MOCK_BOTTLE_DATA.components.cap.materials.map((mat) => (
                                    <button
                                        key={mat.id}
                                        onClick={() => setSelectedCapMat(mat)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedCapMat?.id === mat.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full shadow-inner border border-black/10"
                                            style={{ backgroundColor: mat.color }}
                                        />
                                        <span className="text-sm font-medium">{mat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Panel: Context-aware */}
                    <div className="mt-auto pt-8 border-t border-gray-100">
                        <AnimatePresence mode="wait">
                            {!isComplete ? (
                                <motion.div
                                    key="sandbox-info"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-blue-50 p-4 rounded-xl border border-blue-100"
                                >
                                    <div className="flex gap-2 items-start">
                                        <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                                        <div>
                                            <p className="text-xs font-semibold text-blue-800">Sandbox Mode</p>
                                            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                                This is a conceptual demo. Complete all 3 steps to see the full configuration.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="complete-summary"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-symbols-outlined text-emerald-600 filled-icon">check_circle</span>
                                        <p className="text-sm font-semibold text-emerald-800">Configuration Complete</p>
                                    </div>
                                    <div className="space-y-2 text-xs text-emerald-700">
                                        <div className="flex justify-between">
                                            <span>Glass</span>
                                            <span className="font-medium">{selectedBottleMat?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Roller</span>
                                            <span className="font-medium">{selectedRollerMat?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cap</span>
                                            <span className="font-medium">{selectedCapMat?.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 mt-4 leading-relaxed opacity-80">
                                        Imagine this configuration logic applied across your entire catalog.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center: Canvas */}
                <div className="flex-grow bg-[#F5F5F7] relative flex items-center justify-center overflow-hidden">
                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Product Name Label (Top) */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20">
                        <p className="text-xs font-bold text-[#86868B] uppercase tracking-widest mb-1">Configuring</p>
                        <h2 className="text-lg font-semibold text-[#1D1D1F]">{MOCK_BOTTLE_DATA.name}</h2>
                    </div>

                    {/* Bottle Canvas */}
                    <BottleCanvas
                        bottleMat={selectedBottleMat}
                        rollerMat={selectedRollerMat}
                        capMat={selectedCapMat}
                        showWireframe={showWireframe}
                        showDimensions={showDimensions}
                        specs={MOCK_BOTTLE_DATA.dimensions}
                    />

                    {/* Step Indicator (Bottom) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step > s
                                        ? 'bg-emerald-500 text-white'
                                        : step === s
                                            ? 'bg-primary text-white ring-4 ring-primary/20'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step > s ? (
                                        <span className="material-symbols-outlined text-sm filled-icon">check</span>
                                    ) : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-8 h-0.5 transition-colors duration-500 ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Completion Celebration */}
                    <AnimatePresence>
                        {isComplete && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
                            >
                                <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-3xl" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default BottleBlueprintDemo;
