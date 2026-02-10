/**
 * LayeredBottleCanvas
 * 
 * A manufacturing-grade bottle visualization system that renders
 * a bottle from overlays, starting from a blueprint outline.
 * 
 * Layer Order (bottom to top):
 * 1. Outline Layer (always visible) - Black & white SVG/PNG
 * 2. Glass Layer - Transparent overlay with color/material
 * 3. Roller Layer - Neck insert overlay
 * 4. Cap Layer - Top closure overlay
 * 
 * All layers are absolutely positioned and must share the same
 * canvas dimensions for pixel-perfect alignment.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface LayeredBottleCanvasProps {
    // Image URLs (from Sanity or fallback)
    outlineUrl: string;
    glassOverlayUrl?: string;
    rollerOverlayUrl?: string;
    capOverlayUrl?: string;

    // Fallback colors when overlays aren't available
    glassColor?: string;
    rollerColor?: string;
    capColor?: string;

    // Visual controls
    showWireframe?: boolean;
    showDimensions?: boolean;

    // Dimension data for measurement lines
    dimensions?: {
        heightWithCap?: number;
        heightWithoutCap?: number;
        diameter?: number;
        thread?: string;
    };

    // Canvas size
    width?: number;
    height?: number;
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const slideInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 }
    }
};

// ============================================
// COMPONENT
// ============================================

export const LayeredBottleCanvas: React.FC<LayeredBottleCanvasProps> = ({
    outlineUrl,
    glassOverlayUrl,
    rollerOverlayUrl,
    capOverlayUrl,
    glassColor,
    rollerColor,
    capColor,
    showWireframe = true,
    showDimensions = false,
    dimensions,
    width = 400,
    height = 600,
}) => {

    // Determine if we have real overlays or need fallback rendering
    const hasGlassOverlay = !!glassOverlayUrl;
    const hasRollerOverlay = !!rollerOverlayUrl;
    const hasCapOverlay = !!capOverlayUrl;

    // Check if selection is made (either overlay or color)
    const hasGlass = hasGlassOverlay || !!glassColor;
    const hasRoller = hasRollerOverlay || !!rollerColor;
    const hasCap = hasCapOverlay || !!capColor;

    // Calculate completion state for visual effects
    const isComplete = hasGlass && hasRoller && hasCap;

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width, height }}
        >
            {/* Canvas Container - All layers stack here */}
            <div
                className="relative"
                style={{ width: width * 0.8, height: height * 0.9 }}
            >

                {/* ========== LAYER 1: OUTLINE (ALWAYS VISIBLE) ========== */}
                <motion.div
                    className="absolute inset-0 z-10"
                    animate={{
                        opacity: showWireframe ? 1 : (isComplete ? 0.15 : 0.4)
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <img
                        src={outlineUrl}
                        alt="Bottle Blueprint"
                        className="w-full h-full object-contain"
                        style={{
                            filter: isComplete && !showWireframe ? 'brightness(0.8)' : 'none'
                        }}
                    />
                </motion.div>

                {/* ========== LAYER 2: GLASS OVERLAY ========== */}
                <AnimatePresence>
                    {hasGlass && (
                        <motion.div
                            key="glass-layer"
                            className="absolute inset-0 z-20 pointer-events-none"
                            variants={fadeInVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {hasGlassOverlay ? (
                                // Real overlay image from Sanity
                                <img
                                    src={glassOverlayUrl}
                                    alt="Glass Material"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                // Fallback: CSS-based glass effect
                                <div
                                    className="absolute inset-[15%] top-[25%] bottom-[5%] rounded-b-3xl rounded-t-md"
                                    style={{
                                        backgroundColor: glassColor,
                                        opacity: 0.7,
                                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {/* Glass highlights */}
                                    <div className="absolute top-0 right-4 w-3 h-full bg-gradient-to-b from-white/20 to-transparent blur-sm" />
                                    <div className="absolute top-0 left-3 w-1 h-full bg-white/15 blur-[2px]" />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========== LAYER 3: ROLLER OVERLAY ========== */}
                <AnimatePresence>
                    {hasRoller && (
                        <motion.div
                            key="roller-layer"
                            className="absolute inset-0 z-30 pointer-events-none"
                            variants={fadeInVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {hasRollerOverlay ? (
                                // Real overlay image from Sanity
                                <img
                                    src={rollerOverlayUrl}
                                    alt="Roller Insert"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                // Fallback: CSS-based roller
                                <div className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[35%] h-[8%]">
                                    <div
                                        className="w-full h-full rounded-sm shadow-sm flex items-center justify-center"
                                        style={{ backgroundColor: '#9CA3AF' }}
                                    >
                                        <div
                                            className="w-[60%] aspect-square rounded-full shadow-inner border border-white/30 -mt-[50%]"
                                            style={{ backgroundColor: rollerColor || '#E5E7EB' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========== LAYER 4: CAP OVERLAY ========== */}
                <AnimatePresence>
                    {hasCap && (
                        <motion.div
                            key="cap-layer"
                            className="absolute inset-0 z-40 pointer-events-none"
                            variants={slideInVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {hasCapOverlay ? (
                                // Real overlay image from Sanity
                                <img
                                    src={capOverlayUrl}
                                    alt="Cap Finish"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                // Fallback: CSS-based cap
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 top-[3%] w-[32%] h-[16%] rounded-t-xl rounded-b-md shadow-lg"
                                    style={{
                                        backgroundColor: capColor,
                                        background: `linear-gradient(135deg, ${capColor}, ${capColor}CC)`,
                                    }}
                                >
                                    {/* Metallic sheen */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-xl rounded-b-md" />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ========== DIMENSION LINES OVERLAY ========== */}
                <AnimatePresence>
                    {showDimensions && dimensions && (
                        <motion.svg
                            className="absolute inset-0 z-50 pointer-events-none"
                            viewBox="0 0 320 480"
                            variants={fadeInVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Height measurement (right side) */}
                            <g className="dimension-height">
                                <line x1="280" y1="40" x2="280" y2="420" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,4" />
                                <line x1="275" y1="40" x2="285" y2="40" stroke="#2563EB" strokeWidth="1" />
                                <line x1="275" y1="420" x2="285" y2="420" stroke="#2563EB" strokeWidth="1" />
                                <text x="290" y="235" fill="#2563EB" fontSize="11" fontFamily="monospace" fontWeight="600">
                                    {dimensions.heightWithCap ? `${dimensions.heightWithCap}mm` : '72mm'}
                                </text>
                            </g>

                            {/* Diameter measurement (bottom) */}
                            <g className="dimension-diameter">
                                <line x1="110" y1="440" x2="210" y2="440" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,4" />
                                <line x1="110" y1="435" x2="110" y2="445" stroke="#2563EB" strokeWidth="1" />
                                <line x1="210" y1="435" x2="210" y2="445" stroke="#2563EB" strokeWidth="1" />
                                <text x="140" y="460" fill="#2563EB" fontSize="11" fontFamily="monospace" fontWeight="600">
                                    {dimensions.diameter ? `${dimensions.diameter}mm` : '18mm'}
                                </text>
                            </g>

                            {/* Thread spec (top left) */}
                            {dimensions.thread && (
                                <g className="dimension-thread">
                                    <line x1="60" y1="60" x2="100" y2="80" stroke="#2563EB" strokeWidth="0.5" />
                                    <text x="20" y="55" fill="#2563EB" fontSize="10" fontFamily="monospace">
                                        {dimensions.thread}
                                    </text>
                                </g>
                            )}
                        </motion.svg>
                    )}
                </AnimatePresence>

            </div>

            {/* ========== GROUND SHADOW ========== */}
            <motion.div
                className="absolute bottom-8 w-32 h-4 bg-black/20 blur-xl rounded-full"
                animate={{
                    opacity: isComplete ? 0.5 : 0.15,
                    scale: isComplete ? 1 : 0.8
                }}
                transition={{ duration: 0.6 }}
            />

            {/* ========== COMPLETION GLOW EFFECT ========== */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="absolute inset-0 bg-gradient-radial from-emerald-100/30 via-transparent to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default LayeredBottleCanvas;
