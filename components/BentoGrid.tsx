import React from "react";

interface BentoGridProps {
  onCollectionClick?: () => void;
  onPackagingIdeasClick?: () => void;
  onContractClick?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps & { onContractClick?: () => void }> = ({ onCollectionClick, onPackagingIdeasClick, onContractClick }) => {
    
  return (
    <div className="w-full px-4 md:px-10 flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] md:auto-rows-[250px]">
        
        {/* 1. Classic & Elegant Roll On Bottles (Large Portrait - Left) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden cursor-pointer bg-[#D8C6B0]"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-e4f78ebc.jpg?v=1765600574"
             alt="Classic Roll On Bottles"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-8 w-full z-10">
            <span className="text-[#C5A059] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">
              Flagship Series
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-serif font-medium leading-tight mb-4">
              Classic & Elegant <br />
              Roll On Bottles
            </h2>
            <p className="text-white/80 text-sm font-light max-w-sm mb-6 line-clamp-2">
              Timeless clarity meets modern silhouette. Engineered for brands that demand presence.
            </p>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 w-fit">
              Explore Collection
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* 2. Amber Series (Vertical - Center) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-2 rounded-3xl overflow-hidden cursor-pointer bg-[#2A1E16]"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548"
             alt="Amber Series"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full z-10">
            <span className="bg-[#4D4540] text-white text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider mb-3 inline-block">
              Trending
            </span>
            <h3 className="text-white text-2xl font-serif font-medium mb-1">Amber Series</h3>
            <p className="text-white/70 text-xs font-light mb-4">
              UV Protection meets style.
            </p>
          </div>
        </div>

        {/* 3. Cream Jars (Square - Top Right) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden cursor-pointer bg-black"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-1a5ce90f_1.jpg?v=1765597664"
             alt="Cream Jars"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
          <div className="absolute top-0 left-0 p-8 z-10 h-full flex flex-col justify-start">
            <h3 className="text-white text-2xl font-bold font-serif mb-1">Cream Jars</h3>
            <p className="text-white/80 text-[10px] uppercase tracking-widest font-medium">
              Personal Care Products
            </p>
          </div>
        </div>

        {/* 4. Custom Packaging Ideas (Square - Bottom Right) */}
        <div 
            onClick={onPackagingIdeasClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden cursor-pointer bg-[#2D3648] hover:bg-[#374151] transition-colors"
        >
          {/* Subtle texture placeholder */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div>
                <span className="material-symbols-outlined text-[#C5A059] text-3xl mb-4">
                edit_square
                </span>
                <h3 className="text-white text-3xl font-serif font-medium leading-tight">
                Packaging <br/> Ideas
                </h3>
            </div>
            
            <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                <span>View Concepts</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                chevron_right
                </span>
            </div>
          </div>
        </div>

        {/* 5. Wholesale (Standard - Bottom Left) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden cursor-pointer bg-white"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity">
               <img src="https://images.unsplash.com/photo-1556740758-90de2929450a?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale" />
          </div>

          <div className="flex flex-col h-full justify-center p-8 relative z-10">
              <h3 className="text-[#1D1D1F] text-3xl font-serif font-medium mb-3">
                Wholesale
              </h3>
              <p className="text-[#637588] text-sm font-light mb-6 leading-relaxed">
                Bulk pricing tailored to your scale.
              </p>
              <span className="text-[#405D68] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                View Pricing
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
            className="bento-card group relative md:col-span-2 md:row-span-1 rounded-3xl overflow-hidden cursor-pointer bg-[#1D1D1F]"
        >
           <div className="absolute inset-0 opacity-60">
                <img 
                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-844152d1.jpg?v=1765598297"
                    alt="Wedding Favors & Events"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
           </div>
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
           
           <div className="relative z-10 p-8 flex flex-col justify-center h-full">
               <div className="flex items-center gap-2 mb-2">
                   <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                   <span className="text-[#C5A059] text-[10px] font-bold tracking-[0.2em] uppercase">Events</span>
               </div>
               <h3 className="text-white text-3xl font-serif font-medium mb-2">
                   Wedding Favors <br/> & Events
               </h3>
               <p className="text-white/80 text-sm font-light max-w-sm mb-4">
                   Make it memorable. Custom filling & packaging for your special occasions.
               </p>
               <button className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-colors w-fit">
                   View Options
               </button>
           </div>
        </div>
        
        {/* Accessories - Small Tile */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-3xl overflow-hidden cursor-pointer bg-neutral-100 dark:bg-neutral-800"
        >
             <div className="flex flex-col h-full justify-center p-6 text-center">
                 <span className="material-symbols-outlined text-4xl mb-2 text-gray-400 group-hover:text-[#C5A065] transition-colors">category</span>
                 <h3 className="text-[#1D1D1F] dark:text-white font-bold">More</h3>
                 <span className="text-xs text-gray-500">Accessories & Caps</span>
             </div>
        </div>

      </div>
    </div>
  );
};