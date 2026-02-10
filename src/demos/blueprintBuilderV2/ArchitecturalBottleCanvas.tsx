/**
 * ArchitecturalBottleCanvas
 * 
 * A precision CAD-style bottle visualization component.
 * Renders layered SVG overlays on an architectural drafting background.
 * 
 * Layer order (bottom to top):
 * 1. Drafting paper background (grid)
 * 2. Bottle outline (with or without cap)
 * 3. Glass color overlay (clipped to body)
 * 4. Roller overlay (when visible)
 * 5. Cap color overlay (clipped to cap)
 * 6. Measurement overlay (toggleable)
 * 
 * All dimensions are based on canonical specs:
 * - Height with cap: 83mm
 * - Height without cap: 70mm
 * - Diameter: 20mm
 * - Neck thread: 17-415
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface GlassColor {
    id: string;
    name: string;
    fill: string;       // Primary fill color
    opacity?: number;   // Glass transparency (0.1-0.3)
    overlayUrl?: string; // Texture overlay from Sanity
    swatchUrl?: string;
}



export interface CapFinish {
    id: string;
    name: string;
    fill: string;       // Cap color
    gradient?: string;  // Optional subtle vertical gradient
    overlayUrl?: string; // Texture overlay from Sanity
}

export interface ArchitecturalBottleCanvasProps {
    // Selections (Nullable to handle initial empty state)
    glassColor?: GlassColor | null;
    capFinish?: CapFinish | null;

    // View mode
    showCap?: boolean;           // Show bottle with cap or without
    showMeasurements?: boolean;  // Show dimension callouts
    showGrid?: boolean;          // Show drafting grid background

    // NEW: Dynamic Outline from Sanity
    outlineUrl?: string;

    // Size
    width?: number | string;
    height?: number | string;

    // Dimensions (for labels)
    heightTotal?: number;
    heightBody?: number;
    diameter?: number;
    thread?: string;
}

// ============================================
// CONSTANTS
// ============================================

// SVG viewBox matches our asset coordinate system
const VIEWBOX = "0 0 60 120";

// Paths derived from canonical dimensions (1 unit = 1mm)
const PATHS = {
    // Bottle body (20mm diameter, ~70mm visible height)
    body: `
    M 20 31.5
    L 20 98.5
    Q 20 101.5 23 101.5
    L 37 101.5
    Q 40 101.5 40 98.5
    L 40 31.5
    Z
  `,

    // Cap outline (13mm tall)
    cap: `
    M 20.5 18.5
    L 20.5 31
    L 39.5 31
    L 39.5 18.5
    Q 39.5 17.5 38.5 17.5
    L 21.5 17.5
    Q 20.5 17.5 20.5 18.5
    Z
  `,


};

// ============================================
// SUBCOMPONENTS
// ============================================

/** Architectural drafting paper background */
const DraftingBackground: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;

    return (
        <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                backgroundColor: '#f8f6f2', // Warm off-white
                backgroundImage: `
          linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
                backgroundSize: '10px 10px, 10px 10px, 50px 50px, 50px 50px',
            }}
        />
    );
};

/** Clean neutral background (non-grid mode) */
const CleanBackground: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;

    return (
        <div
            className="absolute inset-0"
            style={{ backgroundColor: '#fafafa' }}
        />
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ArchitecturalBottleCanvas: React.FC<ArchitecturalBottleCanvasProps> = ({
    glassColor,
    capFinish,
    showCap = true,
    showMeasurements = false,
    showGrid = true,
    outlineUrl, // Destructure new prop
    width = 400,
    height = 600,
    heightTotal = 83,
    heightBody = 70,
    diameter = 20,
    thread = '17-415',
}) => {

    return (
        <div
            className="relative overflow-hidden rounded-lg bg-white"
            style={{ width, height }}
        >
            {/* ========== BACKGROUND: DRAFTING GRID (Toggleable) ========== */}
            <AnimatePresence>
                {showMeasurements && (
                    <DraftingBackground key="grid" show={true} />
                )}
            </AnimatePresence>

            {/* ========== MAIN CONTENT CONTAINER ========== */}
            {/* We stack: 
                1. Clean White BG (Always)
                2. Real Images (Fills)
                3. SVG Outlines (Strokes)
                4. Measurement Overlays
            */}

            <div className="absolute inset-0 flex items-center justify-center">
                {/* The relative container for perfect alignment of SVG and PNGs */}
                {/* Adjust aspect ratio container to match the viewBox 60x120 roughly 1:2 */}
                <div className="relative w-full h-full">

                    {/* ==== LAYER 1: GLASS BODY (BASE) ==== */}
                    <AnimatePresence>
                        {glassColor ? (
                            <motion.img
                                key={`glass-${glassColor.name}`}
                                src={glassColor.overlayUrl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 w-full h-full object-contain z-10"
                                alt="Glass Body"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs z-0">
                                Select Glass
                            </div>
                        )}
                    </AnimatePresence>

                    {/* ==== LAYER 2: CAP (OVERLAY) ==== */}
                    <AnimatePresence>
                        {capFinish && showCap && (
                            <motion.img
                                key={`cap-${capFinish.name}`}
                                src={capFinish.overlayUrl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 w-full h-full object-contain z-20"
                                alt="Cap"
                            />
                        )}
                    </AnimatePresence>

                    {/* ==== LAYER 3: BLUEPRINT / SPECS (OVERLAY TOGGLE) ==== */}
                    <AnimatePresence>
                        {showMeasurements && (
                            <motion.div
                                className="absolute inset-0 z-30 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >


                                {/* Blueprint Image Overlay (from Sanity) */}
                                {outlineUrl && (
                                    <img
                                        src={outlineUrl}
                                        className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-60"
                                        alt="Blueprint Specs"
                                    />
                                )}

                                {/* SVG Measurements (Code Generated) */}
                                <svg
                                    viewBox={VIEWBOX}
                                    className="absolute inset-0 w-full h-full"
                                    preserveAspectRatio="none"
                                    style={{ padding: 0 }}
                                >
                                    <g>
                                        <line x1="48" y1={showCap ? "17.5" : "31.5"} x2="48" y2="101.5" stroke="#5a7a9a" strokeWidth="0.3" />
                                        <text x="50" y="60" fill="#5a7a9a" fontSize="3" fontFamily="monospace" transform="rotate(90 50 60)">
                                            {showCap ? heightTotal : heightBody} mm
                                        </text>
                                        <line x1="20" y1="108" x2="40" y2="108" stroke="#5a7a9a" strokeWidth="0.3" />
                                        <text x="25" y="113" fill="#5a7a9a" fontSize="3" fontFamily="monospace">Ø {diameter} mm</text>
                                    </g>
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Mode Indicator */}
            {showMeasurements && (
                <div className="absolute bottom-4 left-4 z-50">
                    <span className="text-[10px] font-mono text-[#5a7a9a] uppercase tracking-wider bg-white/80 px-2 py-1 rounded border border-[#5a7a9a]/20">
                        Blueprint Mode Active
                    </span>
                </div>
            )}
        </div>
    );
};

export default ArchitecturalBottleCanvas;
