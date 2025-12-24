import React from 'react';

interface BlueprintTogglesProps {
    showWireframe: boolean;
    setShowWireframe: (val: boolean) => void;
    showDimensions: boolean;
    setShowDimensions: (val: boolean) => void;
}

export const BlueprintToggles: React.FC<BlueprintTogglesProps> = ({
    showWireframe,
    setShowWireframe,
    showDimensions,
    setShowDimensions
}) => {
    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Visual Overlays</h3>

            <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Technical Wireframe</span>
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={showWireframe}
                        onChange={(e) => setShowWireframe(e.target.checked)}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${showWireframe ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${showWireframe ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Show Dimensions</span>
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={showDimensions}
                        onChange={(e) => setShowDimensions(e.target.checked)}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${showDimensions ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${showDimensions ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
            </label>
        </div>
    );
};
