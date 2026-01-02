
import React from 'react';

interface ViewerProps {
    glassImage?: string;
    fitmentImage?: string;
    capImage?: string;
    capOffsetY?: number;
    capOffsetX?: number;
    isLoading?: boolean;
}

export const ProductViewer: React.FC<ViewerProps> = ({
    glassImage,
    fitmentImage,
    capImage,
    capOffsetY = 0,
    capOffsetX = 0,
    isLoading
}) => {
    return (
        <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Container for the 2000x2000 canvas methodology */}
            <div className="relative w-full h-full">

                {/* Layer 1: Glass Body (Base) - Z-10 */}
                {glassImage && (
                    <img
                        src={glassImage}
                        alt="Bottle Body"
                        className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                    />
                )}

                {/* Layer 2: Mechanism/Fitment (Optional) - Z-20 */}
                {fitmentImage && (
                    <img
                        src={fitmentImage}
                        alt="Mechanism"
                        className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                    />
                )}

                {/* Layer 3: Cap (Top) - Z-30 */}
                {capImage && (
                    <img
                        src={capImage}
                        alt="Cap"
                        className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none transition-transform duration-300 ease-out"
                        style={{
                            transform: `translate(${capOffsetX}px, ${capOffsetY}px)`
                        }}
                    />
                )}
            </div>
        </div>
    );
};
