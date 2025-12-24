/**
 * MaterialSwatchSelector
 * 
 * A minimal, premium swatch-based selector for materials.
 * Displays flat color or material thumbnails - not product photos.
 * 
 * Used for: Glass color, Roller type, Cap finish
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface MaterialOption {
    id: string;
    name: string;
    color?: string;
    overlayUrl?: string;
    finish?: string;
}

export interface MaterialSwatchSelectorProps {
    label: string;
    stepNumber: number;
    options: MaterialOption[];
    selectedId: string | null;
    onSelect: (option: MaterialOption) => void;
    disabled?: boolean;
    showStatus?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const MaterialSwatchSelector: React.FC<MaterialSwatchSelectorProps> = ({
    label,
    stepNumber,
    options,
    selectedId,
    onSelect,
    disabled = false,
    showStatus = true,
}) => {
    const isSelected = selectedId !== null;

    return (
        <div
            className={`transition-all duration-500 ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white text-xs font-bold flex items-center justify-center">
                        {stepNumber}
                    </span>
                    <h3 className="text-xs font-bold text-[#86868B] uppercase tracking-wider">
                        {label}
                    </h3>
                </div>
                {showStatus && isSelected && (
                    <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs text-emerald-600 font-medium flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm filled-icon">check_circle</span>
                        Selected
                    </motion.span>
                )}
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-3 gap-2">
                {options.map((option) => {
                    const isActive = selectedId === option.id;

                    return (
                        <motion.button
                            key={option.id}
                            onClick={() => onSelect(option)}
                            whileHover={{ scale: disabled ? 1 : 1.02 }}
                            whileTap={{ scale: disabled ? 1 : 0.98 }}
                            className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl border 
                transition-all duration-200 text-center group
                ${isActive
                                    ? 'border-[#C5A065] bg-[#C5A065]/5 ring-2 ring-[#C5A065]/30'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80'
                                }
              `}
                        >
                            {/* Swatch Circle */}
                            <div className="relative">
                                <div
                                    className={`
                    w-10 h-10 rounded-full shadow-inner border transition-all
                    ${isActive
                                            ? 'border-[#C5A065] ring-2 ring-[#C5A065]/20'
                                            : 'border-black/10 group-hover:border-black/20'
                                        }
                  `}
                                    style={{
                                        backgroundColor: option.color || '#E5E5E5',
                                    }}
                                >
                                    {/* Metallic sheen for metal finishes */}
                                    {(option.finish === 'Polished' || option.name.toLowerCase().includes('metal')) && (
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/10" />
                                    )}

                                    {/* Matte indicator */}
                                    {option.finish === 'Matte' && (
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-black/10" />
                                    )}
                                </div>

                                {/* Selection checkmark */}
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C5A065] rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-white text-xs filled-icon">check</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`
                  text-[11px] font-medium leading-tight transition-colors
                  ${isActive ? 'text-[#1D1D1F]' : 'text-gray-600'}
                `}
                            >
                                {option.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default MaterialSwatchSelector;
