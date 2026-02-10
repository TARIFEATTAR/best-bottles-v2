
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
    specs?: { glass?: string; fitment?: string; cap?: string };
    ghostCap?: boolean;
    isSpray?: boolean;
    labelImage?: string;
}> = ({
    glassImage,
    fitmentImage,
    capImage,
    capOffsetY = 0,
    capOffsetX = 0,
    isLoading,
    showBlueprint = false,
    measurements = { height: '72mm', width: '18mm', neck: '13/415' },
    specs,
    ghostCap = false,
    isSpray = false,
    labelImage,
}) => {
        // Clean Spec Sheet Color Palette (Off-White + Light Blue Lines)
        const specSheet = {
            bg: '#FAFBFC',        // Clean off-white
            grid: '#E3E8F0',      // Very light blue-gray gridlines  
            line: '#94A3B8',      // Slate blue for measurement lines
            text: '#374151',      // Dark gray for high legibility
            accent: '#64748B',    // Muted slate for secondary text
            paper: '#FFFFFF',     // White for label backgrounds
        };

        return (
            <div className={`relative w-full h-full aspect-square rounded-xl overflow-hidden border transition-all duration-500 ${showBlueprint
                ? 'border-amber-200/50 shadow-lg'
                : 'bg-gray-50 border-gray-100 shadow-sm'
                }`}
                style={showBlueprint ? { backgroundColor: specSheet.bg } : undefined}
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

                        {/* Architectural Grid Background - Very Light */}
                        <div
                            className="absolute inset-0 opacity-25 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(${specSheet.grid} 1px, transparent 1px), linear-gradient(90deg, ${specSheet.grid} 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}
                        ></div>

                        {/* Drafting Paper Lines/Border */}
                        <div
                            className="absolute inset-4 border flex flex-col justify-between p-4"
                            style={{ borderColor: `${specSheet.grid}80` }}
                        >
                            <div className="flex justify-between items-start opacity-60">
                                <div className="text-[10px] font-mono tracking-tight font-medium" style={{ color: specSheet.text }}>REF: BB-5ML-SPEC</div>
                                <div className="text-[10px] font-mono tracking-tight font-medium" style={{ color: specSheet.text }}>SHEET NO: 01/A</div>
                            </div>

                            <div className="flex justify-between items-end opacity-60">
                                <div className="text-[10px] font-mono tracking-tight font-medium" style={{ color: specSheet.text }}>SC: 1:1 ORIG</div>
                                <div
                                    className="px-2 py-1 text-[8px] font-mono uppercase tracking-wider border rounded"
                                    style={{ borderColor: specSheet.grid, color: specSheet.text, backgroundColor: 'white' }}
                                >
                                    Approved Specification
                                </div>
                            </div>
                        </div>

                        {/* Exploded View Labels */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <div className="w-full max-w-[420px] h-[500px] relative">
                                {/* Component Labels with Pointers - Positioned to align with exploded components */}

                                {/* Cap/Enclosure - Points to top component */}
                                <div className="absolute top-[10%] left-[55%] flex items-center gap-2">
                                    <div className="w-16 h-px opacity-60" style={{ backgroundColor: specSheet.line }}></div>
                                    <div className="flex flex-col bg-white/95 px-2.5 py-1.5 rounded shadow-sm border border-gray-100">
                                        <span className="text-[11px] font-sans font-bold uppercase tracking-wide" style={{ color: specSheet.text }}>{isSpray ? 'Overcap' : 'Enclosure'}</span>
                                        <span className="text-[9px] font-sans italic" style={{ color: specSheet.accent }}>Component_03</span>
                                        {specs?.cap && <span className="text-[8px] font-mono mt-0.5" style={{ color: specSheet.accent }}>MAT: {specs.cap}</span>}
                                    </div>
                                </div>

                                {/* Fitment - Points to middle component (roller/spray) */}
                                <div className="absolute top-[36%] left-[55%] flex items-center gap-2">
                                    <div className="w-16 h-px opacity-60" style={{ backgroundColor: specSheet.line }}></div>
                                    <div className="flex flex-col bg-white/95 px-2.5 py-1.5 rounded shadow-sm border border-gray-100">
                                        <span className="text-[11px] font-sans font-bold uppercase tracking-wide" style={{ color: specSheet.text }}>{isSpray ? 'Spray Pump' : 'Fitment'}</span>
                                        <span className="text-[9px] font-sans italic" style={{ color: specSheet.accent }}>Component_02</span>
                                        {specs?.fitment && <span className="text-[8px] font-mono mt-0.5" style={{ color: specSheet.accent }}>MAT: {specs.fitment}</span>}
                                    </div>
                                </div>

                                {/* Glass Vessel - Points to bottom component (bottle body) */}
                                <div className="absolute top-[70%] left-[55%] flex items-center gap-2">
                                    <div className="w-16 h-px opacity-60" style={{ backgroundColor: specSheet.line }}></div>
                                    <div className="flex flex-col bg-white/95 px-2.5 py-1.5 rounded shadow-sm border border-gray-100">
                                        <span className="text-[11px] font-sans font-bold uppercase tracking-wide" style={{ color: specSheet.text }}>Glass Vessel</span>
                                        <span className="text-[9px] font-sans italic" style={{ color: specSheet.accent }}>Component_01</span>
                                        {specs?.glass && <span className="text-[8px] font-mono mt-0.5" style={{ color: specSheet.accent }}>MAT: {specs.glass}</span>}
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

                    {/* AI Label Overlay */}
                    {labelImage && !showBlueprint && (
                        <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                            <div className="w-[28%] h-[35%] translate-y-[28%] relative overflow-hidden mix-blend-multiply opacity-90 rounded-sm">
                                <img
                                    src={labelImage}
                                    alt=" AI Label"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none"></div>
                            </div>
                        </div>
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
                        <div className="absolute right-[12%] top-[18%] bottom-[12%] w-px opacity-50 border-l border-dashed" style={{ borderColor: specSheet.line }}>
                            <div className="absolute top-0 w-5 h-0.5 -translate-x-2.5" style={{ backgroundColor: specSheet.line }}></div>
                            <div className="absolute bottom-0 w-5 h-0.5 -translate-x-2.5" style={{ backgroundColor: specSheet.line }}></div>
                            <div className="absolute top-1/2 left-5 -translate-y-1/2">
                                <span className="bg-white px-2 py-1 text-[12px] font-mono font-semibold whitespace-nowrap rotate-90 inline-block shadow-sm border border-gray-200 rounded" style={{ color: specSheet.text }}>
                                    H: {measurements.height}
                                </span>
                            </div>
                        </div>

                        {/* Width Annotation */}
                        <div className="absolute bottom-[8%] left-[28%] right-[28%] h-px opacity-50 border-t border-dashed" style={{ borderColor: specSheet.line }}>
                            <div className="absolute left-0 h-5 w-0.5 -translate-y-2.5" style={{ backgroundColor: specSheet.line }}></div>
                            <div className="absolute right-0 h-5 w-0.5 -translate-y-2.5" style={{ backgroundColor: specSheet.line }}></div>
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                <span className="bg-white px-2 py-1 text-[12px] font-mono font-semibold whitespace-nowrap shadow-sm border border-gray-200 rounded" style={{ color: specSheet.text }}>
                                    W: {measurements.width}
                                </span>
                            </div>
                        </div>

                        {/* Neck Specification Annotation */}
                        <div className="absolute top-[51%] left-[22%] right-[22%] h-px opacity-50" style={{ backgroundColor: specSheet.line }}>
                            <div className="absolute top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-white/95 px-2 py-0.5 text-[11px] font-mono font-medium whitespace-nowrap shadow-sm border border-gray-200/50 rounded" style={{ color: specSheet.text }}>
                                    Neck: {measurements.neck}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
