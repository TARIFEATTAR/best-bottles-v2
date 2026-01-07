
import React from 'react';

interface ViewerProps {
    glassImage?: string;
    fitmentImage?: string;
    capImage?: string;
    capOffsetY?: number;
    capOffsetX?: number;
    isLoading?: boolean;
}

export const ProductViewer: React.FC<ViewerProps & {
    showBlueprint?: boolean;
    measurements?: { height: string; width: string; neck: string };
    ghostCap?: boolean;
    isSpray?: boolean;
}> = ({
    glassImage,
    fitmentImage,
    capImage,
    capOffsetY = 0,
    capOffsetX = 0,
    isLoading,
    showBlueprint = false,
    measurements = { height: '55mm', width: '18mm', neck: '13/415' },
    ghostCap = false,
    isSpray = false,
}) => {
        // Vintage Parchment Color Palette
        const parchment = {
            bg: '#F5EDE3',        // Warm cream base
            grid: '#D4C4B0',      // Faded sepia ink
            line: '#A89078',      // Brown ink for measurements
            text: '#5C4A3D',      // Dark walnut text
            accent: '#8B7355',    // Warm brown accent
            paper: '#EDE4D8',     // Paper highlight
        };

        return (
            <div className={`relative w-full h-full aspect-square rounded-xl overflow-hidden border transition-all duration-500 ${showBlueprint
                ? 'border-amber-200/50 shadow-lg'
                : 'bg-gray-50 border-gray-100 shadow-sm'
                }`}
                style={showBlueprint ? { backgroundColor: parchment.bg } : undefined}
            >
                {/* 1. LAYER: BLUEPRINT BACKGROUND (Expanded) */}
                {showBlueprint && (
                    <div className="absolute inset-0 transition-opacity duration-700 pointer-events-none z-0">
                        {/* Paper Grain Texture Overlay */}
                        <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply z-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                            }}
                        />

                        {/* Architectural Grid Background */}
                        <div
                            className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(${parchment.grid} 1px, transparent 1px), linear-gradient(90deg, ${parchment.grid} 1px, transparent 1px)`,
                                backgroundSize: '32px 32px'
                            }}
                        ></div>

                        {/* Drafting Paper Lines/Border */}
                        <div
                            className="absolute inset-4 border border-[#d1cfc9]/50 flex flex-col justify-between p-4"
                            style={{ borderColor: `${parchment.grid}60` }}
                        >
                            <div className="flex justify-between items-start opacity-40">
                                <div className="text-[9px] font-mono tracking-tighter" style={{ color: parchment.text }}>REF: BB-5ML-SPEC</div>
                                <div className="text-[9px] font-mono tracking-tighter" style={{ color: parchment.text }}>SHEET NO: 01/A</div>
                            </div>

                            <div className="flex justify-between items-end opacity-40">
                                <div className="text-[9px] font-mono tracking-tighter" style={{ color: parchment.text }}>SC: 1:1 ORIG</div>
                                <div
                                    className="px-2 py-1 text-[7px] font-mono uppercase tracking-widest border"
                                    style={{ borderColor: parchment.grid, color: parchment.text }}
                                >
                                    Approved Specification
                                </div>
                            </div>
                        </div>

                        {/* Exploded View Labels */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <div className="w-full max-w-[400px] h-[500px] relative">
                                {/* Component Labels with Pointers */}
                                <div className="absolute top-[18%] left-[65%] flex items-center gap-3">
                                    <div className="w-12 h-px opacity-30" style={{ backgroundColor: parchment.line }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-serif font-black uppercase tracking-widest" style={{ color: parchment.text }}>{isSpray ? 'Overcap' : 'Enclosure'}</span>
                                        <span className="text-[8px] font-serif italic" style={{ color: parchment.accent }}>Component_03</span>
                                    </div>
                                </div>

                                <div className="absolute top-[42%] left-[65%] flex items-center gap-3">
                                    <div className="w-12 h-px opacity-30" style={{ backgroundColor: parchment.line }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-serif font-black uppercase tracking-widest" style={{ color: parchment.text }}>{isSpray ? 'Spray Pump' : 'Fitment'}</span>
                                        <span className="text-[8px] font-serif italic" style={{ color: parchment.accent }}>Component_02</span>
                                    </div>
                                </div>

                                <div className="absolute top-[75%] left-[65%] flex items-center gap-3">
                                    <div className="w-12 h-px opacity-30" style={{ backgroundColor: parchment.line }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-serif font-black uppercase tracking-widest" style={{ color: parchment.text }}>Glass Vessel</span>
                                        <span className="text-[8px] font-serif italic" style={{ color: parchment.accent }}>Component_01</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. LAYER: LOADING STATE */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {/* 3. LAYER: PRODUCT CONTENT */}
                <div className={`relative w-full h-full transition-all duration-700 ${showBlueprint ? 'scale-[0.65] translate-y-[5%]' : 'scale-100'}`}>
                    {/* Glass Body */}
                    {glassImage && (
                        <img
                            src={glassImage}
                            alt="Bottle Body"
                            className={`absolute inset-0 w-full h-full object-contain z-10 pointer-events-none transition-all duration-700 ease-out ${showBlueprint ? 'opacity-95 sepia-[0.15] contrast-110' : ''}`}
                            style={showBlueprint ? { transform: 'translateY(22%)' } : undefined}
                        />
                    )}

                    {/* Fitment */}
                    {fitmentImage && (
                        <img
                            src={fitmentImage}
                            alt="Mechanism"
                            className={`absolute inset-0 w-full h-full object-contain z-20 pointer-events-none transition-all duration-700 ease-out ${showBlueprint ? 'opacity-95 sepia-[0.15] contrast-110' : ''}`}
                            style={showBlueprint ? { transform: 'translateY(-10%) scale(0.95)' } : undefined}
                        />
                    )}

                    {/* Cap */}
                    {capImage && (
                        <img
                            src={capImage}
                            alt="Cap"
                            className={`absolute inset-0 w-full h-full object-contain z-30 pointer-events-none transition-all duration-700 ease-out ${ghostCap ? 'opacity-20' : ''} ${showBlueprint ? 'opacity-95 sepia-[0.15] contrast-110' : ''}`}
                            style={showBlueprint ? { transform: 'translateY(-42%) scale(0.95)' } : { transform: `translate(${capOffsetX}px, ${capOffsetY}px)` }}
                        />
                    )}
                </div>

                {/* 4. LAYER: MEASUREMENTS (Overlay in Blueprint) */}
                {showBlueprint && (
                    <div className="absolute inset-0 z-40 pointer-events-none animate-in fade-in duration-700">
                        {/* Height Annotation */}
                        <div className="absolute right-[15%] top-[20%] bottom-[15%] w-px opacity-30 bg-dashed border-l border-dashed" style={{ borderColor: parchment.line }}>
                            <div className="absolute top-0 w-4 h-px -translate-x-2" style={{ backgroundColor: parchment.line }}></div>
                            <div className="absolute bottom-0 w-4 h-px -translate-x-2" style={{ backgroundColor: parchment.line }}></div>
                            <div className="absolute top-1/2 left-4 -translate-y-1/2">
                                <span className="bg-white/90 px-1.5 py-0.5 text-[10px] font-mono whitespace-nowrap rotate-90 inline-block border border-gray-100" style={{ color: parchment.text }}>
                                    H: {measurements.height}
                                </span>
                            </div>
                        </div>

                        {/* Width Annotation */}
                        <div className="absolute bottom-[10%] left-[30%] right-[30%] h-px opacity-30 bg-dashed border-t border-dashed" style={{ borderColor: parchment.line }}>
                            <div className="absolute left-0 h-4 w-px -translate-y-2" style={{ backgroundColor: parchment.line }}></div>
                            <div className="absolute right-0 h-4 w-px -translate-y-2" style={{ backgroundColor: parchment.line }}></div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                <span className="bg-white/90 px-1.5 py-0.5 text-[10px] font-mono whitespace-nowrap border border-gray-100" style={{ color: parchment.text }}>
                                    W: {measurements.width}
                                </span>
                            </div>
                        </div>

                        {/* Neck Specification Annotation */}
                        <div className="absolute top-[48%] left-[25%] right-[25%] h-px opacity-30" style={{ backgroundColor: parchment.line }}>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                                <span className="text-[8px] font-mono italic whitespace-nowrap" style={{ color: parchment.text }}>
                                    Neck: {measurements.neck}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
