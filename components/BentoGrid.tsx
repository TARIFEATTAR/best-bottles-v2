
import React from "react";

interface BentoGridProps {
  onCollectionClick?: () => void;
  onPackagingIdeasClick?: () => void;
  onContractClick?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps & { onContractClick?: () => void }> = ({ onCollectionClick, onPackagingIdeasClick, onContractClick }) => {
    
  return (
    <div className="w-full px-5 md:px-10 flex justify-center">
      {/* 
        Mobile: grid-cols-2 for mosaic look (variable sizes).
        Desktop: grid-cols-4 as before.
       */}
      <div className="max-w-[1440px] w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[minmax(160px,auto)] md:auto-rows-[250px]">
        
        {/* 1. Classic & Elegant Roll On Bottles (Large Portrait - Left) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative col-span-2 md:col-span-2 md:row-span-2 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#D8C6B0] min-h-[280px] md:min-h-0 active:scale-[0.98] transition-transform"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-177c235a.jpg?v=1765653066"
             alt="Classic Roll On Bottles"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-0"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
          
          <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full z-20">
            <span className="text-[#C5A059] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">
              Flagship Series
            </span>
            <h2 className="text-white text-2xl md:text-5xl font-serif font-medium leading-tight mb-2 md:mb-4">
              Classic & Elegant <br />
              Roll On Bottles
            </h2>
            <p className="text-white/80 text-xs md:text-sm font-light max-w-sm mb-4 md:mb-6 line-clamp-2">
              Timeless clarity meets modern silhouette. Engineered for brands that demand presence.
            </p>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 w-fit">
              Explore Collection
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* 2. Atomizer Series (Vertical - Center) - REPLACED AMBER SERIES */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative col-span-1 md:col-span-1 md:row-span-2 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#151515] min-h-[180px] active:scale-[0.98] transition-transform"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548"
             alt="Atomizer Series"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full z-10">
            <span className="bg-[#4D4540] text-white text-[8px] md:text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider mb-2 md:mb-3 inline-block">
              Trending
            </span>
            <h3 className="text-white text-lg md:text-2xl font-serif font-medium mb-1">Atomizer Series</h3>
            <p className="text-white/70 text-[9px] md:text-xs font-light mb-2 hidden md:block">
              Portable Luxury.
            </p>
          </div>
        </div>

        {/* 3. Cream Jars (Square - Top Right) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative col-span-1 md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-black min-h-[140px] md:min-h-[180px] active:scale-[0.98] transition-transform"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-1a5ce90f_1.jpg?v=1765597664"
             alt="Cream Jars"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          <div className="absolute top-0 left-0 p-4 md:p-8 z-10 h-full flex flex-col justify-start">
            <h3 className="text-white text-base md:text-2xl font-bold font-serif mb-0.5">Cream Jars</h3>
            <p className="text-white/80 text-[8px] md:text-[10px] uppercase tracking-widest font-medium">
              Personal Care
            </p>
          </div>
        </div>

        {/* 4. Custom Packaging Ideas (Square - Bottom Right) */}
        <div 
            onClick={onPackagingIdeasClick}
            className="bento-card group relative col-span-1 md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#2D3648] hover:bg-[#374151] transition-colors min-h-[140px] md:min-h-[180px] active:scale-[0.98]"
        >
          {/* Subtle texture placeholder */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-8">
            <div>
                <span className="material-symbols-outlined text-[#C5A059] text-xl md:text-3xl mb-2 md:mb-4">
                edit_square
                </span>
                <h3 className="text-white text-lg md:text-3xl font-serif font-medium leading-tight">
                Design <br/> Ideas
                </h3>
            </div>
            
            <div className="flex items-center gap-1.5 text-white/70 text-[9px] md:text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                <span>View</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                chevron_right
                </span>
            </div>
          </div>
        </div>

        {/* 5. Wholesale (Wide - Bottom Left) - Updated Image & Width */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative col-span-2 md:col-span-2 md:row-span-1 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-black min-h-[140px] active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0">
               <img 
                 src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-dabd3843.jpg?v=1765665942" 
                 alt="Wholesale"
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
               />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
          </div>

          <div className="flex flex-col h-full justify-center p-5 md:p-8 relative z-10">
              <h3 className="text-white text-lg md:text-3xl font-serif font-medium mb-1 md:mb-3">
                Wholesale
              </h3>
              <p className="text-white/80 text-[11px] md:text-sm font-light mb-3 md:mb-6 leading-relaxed max-w-sm">
                Bulk pricing tailored to your scale.
              </p>
              <span className="text-white font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                Pricing
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </span>
          </div>
        </div>

        {/* 6. WEDDING FAVORS & EVENTS (Wide - Bottom Center) */}
        <div 
            onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-contract'));
            }}
            className="bento-card group relative col-span-2 md:col-span-2 md:row-span-1 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#1D1D1F] min-h-[180px] md:min-h-[220px] active:scale-[0.98] transition-transform"
        >
           <div className="absolute inset-0 opacity-60">
                <img 
                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-844152d1.jpg?v=1765598297"
                    alt="Wedding Favors & Events"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
           </div>
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
           
           <div className="relative z-10 p-5 md:p-8 flex flex-col justify-center h-full">
               <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                   <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                   <span className="text-[#C5A059] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">Events</span>
               </div>
               <h3 className="text-white text-xl md:text-3xl font-serif font-medium mb-1.5 md:mb-2">
                   Wedding Favors <br/> & Events
               </h3>
               <p className="text-white/80 text-xs md:text-sm font-light max-w-sm mb-3 md:mb-4 line-clamp-2">
                   Make it memorable. Custom filling & packaging for your special occasions.
               </p>
               <button className="bg-white text-black px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-colors w-fit">
                   View Options
               </button>
           </div>
        </div>

      </div>
    </div>
  );
};
