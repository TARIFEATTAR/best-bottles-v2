import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import outlineSrc from './assets/bottle-outline.svg';

interface BottleCanvasProps {
    bottleMat: { id: string, name: string, color: string, opacity?: number } | null;
    rollerMat: { id: string, name: string, color: string } | null;
    capMat: { id: string, name: string, color: string } | null;
    showWireframe: boolean;
    showDimensions: boolean;
    specs: { height: string, diameter: string, neckFinish: string };
}

export const BottleCanvas: React.FC<BottleCanvasProps> = ({
    bottleMat,
    rollerMat,
    capMat,
    showWireframe,
    showDimensions,
    specs
}) => {
    return (
        <div className="relative w-[500px] h-[600px] flex items-center justify-center">

            {/* Dynamic Bottle Representation (CSS/SVG Hybrid) */}
            <div className="relative z-10 flex flex-col items-center transform scale-125 origin-center transition-transform duration-700">

                {/* Cap */}
                <div className="relative w-16 h-28 mb-0.5 z-30">
                    <AnimatePresence>
                        {capMat && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-0 rounded-t-lg rounded-b-md shadow-lg"
                                style={{
                                    backgroundColor: capMat.color,
                                    background: `linear-gradient(135deg, ${capMat.color}, #00000033)`,
                                    boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)'
                                }}
                            >
                                {/* Metallic Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60 rounded-t-lg rounded-b-md" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Cap Wireframe Placeholder (if not selected) */}
                    {!capMat && showWireframe && (
                        <div className="absolute inset-0 rounded-t-lg rounded-b-md border border-blue-600/30 bg-blue-50/10 border-dashed" />
                    )}
                </div>

                {/* Roller Housing (Only visible if bottle or roller selected) */}
                <div className="relative w-14 h-4 z-20 -my-1">
                    <AnimatePresence>
                        {rollerMat && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 rounded-sm bg-gray-300 shadow-sm flex items-center justify-center"
                            >
                                {/* The Ball */}
                                <div
                                    className="w-8 h-8 rounded-full shadow-inner -mt-6 border border-gray-200"
                                    style={{ backgroundColor: rollerMat.color }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!rollerMat && showWireframe && (
                        <div className="absolute inset-0 border border-blue-600/30 border-dashed" />
                    )}
                </div>

                {/* Bottle */}
                <div className="relative w-20 h-64 rounded-b-3xl rounded-t-md z-10">
                    <AnimatePresence>
                        {bottleMat && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: bottleMat.opacity || 1,
                                    backgroundColor: bottleMat.color
                                }}
                                className="absolute inset-0 rounded-b-3xl rounded-t-md overflow-hidden backdrop-blur-sm shadow-xl"
                                style={{
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 25px 50px -12px rgba(0,0,0,0.25)'
                                }}
                            >
                                {/* Glass Highlights */}
                                <div className="absolute top-0 right-3 w-4 h-full bg-gradient-to-b from-white/10 to-transparent blur-md" />
                                <div className="absolute top-0 left-2 w-1 h-full bg-white/20 blur-sm" />

                                {/* Liquid (Optional Visual Flair) */}
                                <div className="absolute bottom-2 left-2 right-2 h-[85%] bg-black/5 rounded-b-2xl rounded-t-lg backdrop-brightness-95" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Bottle Wireframe Placeholder */}
                    {!bottleMat && showWireframe && (
                        <div className="absolute inset-0 rounded-b-3xl rounded-t-md border border-blue-600/30 bg-blue-50/10 border-dashed" />
                    )}
                </div>


                {/* Wireframe Overlay using Asset */}
                <AnimatePresence>
                    {showWireframe && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-[-60px] w-[calc(100%+120px)] h-[calc(100%+120px)] pointer-events-none z-40 bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${outlineSrc})` }}
                        >
                            {/* Measurement Lines (kept as SVG overlay on top of image for dynamic data) */}
                            {showDimensions && (
                                <svg className="w-full h-full" viewBox="0 0 300 500">
                                    {/* Height */}
                                    <line x1="230" y1="130" x2="230" y2="390" stroke="#2563EB" strokeWidth="1" />
                                    <line x1="225" y1="130" x2="235" y2="130" stroke="#2563EB" strokeWidth="1" />
                                    <line x1="225" y1="390" x2="235" y2="390" stroke="#2563EB" strokeWidth="1" />
                                    <text x="240" y="260" fill="#2563EB" fontSize="10" fontFamily="monospace" fontWeight="bold">{specs.height}</text>

                                    {/* Diameter */}
                                    <line x1="110" y1="410" x2="190" y2="410" stroke="#2563EB" strokeWidth="1" />
                                    <line x1="110" y1="405" x2="110" y2="415" stroke="#2563EB" strokeWidth="1" />
                                    <line x1="190" y1="405" x2="190" y2="415" stroke="#2563EB" strokeWidth="1" />
                                    <text x="135" y="425" fill="#2563EB" fontSize="10" fontFamily="monospace" fontWeight="bold">{specs.diameter}</text>

                                    {/* Neck Finish */}
                                    <line x1="90" y1="120" x2="110" y2="135" stroke="#2563EB" strokeWidth="0.5" />
                                    <text x="40" y="115" fill="#2563EB" fontSize="10" fontFamily="monospace">{specs.neckFinish}</text>
                                </svg>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Shadow */}
            <div className="absolute bottom-[20px] w-32 h-4 bg-black/20 blur-xl rounded-full opacity-60 transition-opacity duration-700"
                style={{ opacity: bottleMat ? 0.6 : 0.1 }}
            />

        </div>
    );
};
