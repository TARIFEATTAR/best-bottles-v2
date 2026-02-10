import React, { useState, useRef, useEffect } from "react";

// Configuration / Variables
const CONFIG = {
  main_bottle_plain_url: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142", 
  main_bottle_lifestyle_url: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-a04d7c57.jpg?v=1765532762", 
  variety_size_1_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
  variety_size_2_url: "https://images.unsplash.com/photo-1571781565036-d3f759be73e4?q=80&w=600&auto=format&fit=crop"
};

export const ProductTransformation: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    }
  };

  const onMouseDown = () => (isDragging.current = true);
  const onMouseUp = () => (isDragging.current = false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  // Global mouse up to catch drags that leave the container
  useEffect(() => {
    const handleGlobalMouseUp = () => (isDragging.current = false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, []);

  return (
    <section className="w-full max-w-[1000px] mx-auto py-16 px-6 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 my-12">
      
      {/* Typography */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a1a] dark:text-white mb-2 uppercase tracking-tight">
          From Inventory to Icon
        </h2>
        <p className="text-[#6e6e6e] dark:text-gray-400 font-light text-lg">
          See how our 60ml Amber Boston Round transforms with your branding.
        </p>
      </div>

      {/* 1. Comparison Slider */}
      <div 
        className="relative w-full max-w-[600px] mx-auto aspect-square bg-[#f8f8f8] dark:bg-gray-800 rounded-lg overflow-hidden cursor-col-resize select-none group"
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        onClick={(e) => handleMove(e.clientX)}
      >
        {/* Background Layer (Branded Product - After) - Visible on Right */}
        <div className="absolute inset-0 w-full h-full">
            <img 
                src={CONFIG.main_bottle_lifestyle_url} 
                alt="After Transformation" 
                className="w-full h-full object-contain p-8 pointer-events-none"
            />
            <span className="absolute top-5 right-5 bg-white/90 text-[#1a1a1a] px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded shadow-sm z-10 backdrop-blur-sm">
                After
            </span>
        </div>

        {/* Foreground Layer (Plain Bottle - Before) - Clipped/Revealed on Left */}
        <div 
            className="absolute inset-0 w-full h-full border-r-2 border-white z-20 overflow-hidden bg-[#f4f4f4] dark:bg-gray-800"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
            <img 
                src={CONFIG.main_bottle_plain_url} 
                alt="Before Transformation" 
                className="absolute inset-0 w-full h-full object-contain p-8 pointer-events-none"
            />
            <span className="absolute top-5 left-5 bg-white/90 text-[#1a1a1a] px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded shadow-sm backdrop-blur-sm">
                Before
            </span>
        </div>

        {/* Drag Handle */}
        <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-30 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{ left: `${sliderPosition}%` }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1a1a1a] border-4 border-white/20 bg-clip-padding">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8L22 12L18 16" />
                    <path d="M6 8L2 12L6 16" />
                </svg>
            </div>
        </div>
      </div>

      {/* 2. Product Family Gallery */}
      <div className="mt-12">
        <p className="text-sm text-[#6e6e6e] dark:text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 mb-6">
            Available Sizes: Also shown: 30ml and 10ml variety options.
        </p>
        <div className="grid grid-cols-2 gap-6">
            <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-black/20">
                    <img 
                        src={CONFIG.variety_size_1_url} 
                        alt="30ml Variant" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
                <div className="p-4 text-center">
                    <span className="block text-sm font-bold text-[#1a1a1a] dark:text-white">30ml Variant</span>
                    <span className="text-xs text-[#6e6e6e] dark:text-gray-500">Amber Round</span>
                </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-black/20">
                    <img 
                        src={CONFIG.variety_size_2_url} 
                        alt="10ml Variant" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
                <div className="p-4 text-center">
                    <span className="block text-sm font-bold text-[#1a1a1a] dark:text-white">10ml Variant</span>
                    <span className="text-xs text-[#6e6e6e] dark:text-gray-500">Amber Round</span>
                </div>
            </div>
        </div>
      </div>

    </section>
  );
};