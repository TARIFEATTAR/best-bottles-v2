import React from "react";

interface BentoGridProps {
  onCollectionClick?: () => void;
  onPackagingIdeasClick?: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onCollectionClick, onPackagingIdeasClick }) => {
  return (
    <div className="w-full px-4 md:px-10 flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] md:auto-rows-[250px]">
        
        {/* 1. Signature Glass Collection (Large Portrait - Left) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden cursor-pointer bg-[#D8C6B0]"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-48628740_1.jpg?v=1765524503"
             alt="Signature Collection"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-8 w-full z-10">
            <span className="text-[#C5A059] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">
              Flagship Series
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-serif font-medium leading-tight mb-4">
              Signature <br />
              Glass Collection
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
            className="bento-card group relative md:col-span-1 md:row-span-2 rounded-2xl overflow-hidden cursor-pointer bg-[#2A1E16]"
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

        {/* 3. New Arrivals (Square - Top Right) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden cursor-pointer bg-black"
        >
          <img 
             src="https://images.unsplash.com/photo-1616400619175-5beda3a17896?q=80&w=800&auto=format&fit=crop"
             alt="New Arrivals"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
          />
          <div className="absolute top-0 left-0 p-6 z-10">
            <h3 className="text-white text-lg font-bold font-serif">New Arrivals</h3>
            <p className="text-white/60 text-[10px] mt-1 uppercase tracking-widest">
              Frosted Editions
            </p>
          </div>
        </div>

        {/* 4. Custom Packaging Ideas (Square - Bottom Right) */}
        <div 
            onClick={onPackagingIdeasClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden cursor-pointer bg-[#334155] flex flex-col justify-between p-6 hover:bg-[#405D68] transition-colors"
        >
          <div>
            <span className="material-symbols-outlined text-[#C5A059] text-3xl mb-3">
              edit_square
            </span>
            <h3 className="text-white text-xl font-serif font-medium leading-tight">
              Packaging
              <br />
              Ideas
            </h3>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
            <span>View Concepts</span>
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
              chevron_right
            </span>
          </div>
        </div>

        {/* 5. Wholesale (Wide - Bottom Left) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-2 md:row-span-1 rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-[#1E1E1E]"
        >
          <div className="flex h-full items-center relative z-10">
            <div className="w-3/5 p-8 flex flex-col justify-center h-full">
              <h3 className="text-[#1D1D1F] dark:text-white text-2xl font-serif font-medium mb-2">
                Wholesale
              </h3>
              <p className="text-[#637588] dark:text-gray-400 text-sm font-light mb-4 line-clamp-2">
                Bulk pricing tailored to your scale. From boutique to mass market.
              </p>
              <span className="text-[#405D68] dark:text-[#C5A059] font-bold text-xs uppercase tracking-wide flex items-center gap-1 group-hover:underline">
                Apply Now
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </span>
            </div>
            
            <div className="absolute right-0 top-0 w-2/5 h-full">
                 <img 
                    src="https://images.unsplash.com/photo-1542037169-2f2267885b9b?q=80&w=800&auto=format&fit=crop" 
                    className="w-full h-full object-cover mask-gradient-left" 
                    alt="Wholesale"
                    style={{ maskImage: 'linear-gradient(to right, transparent, black)' }}
                />
            </div>
          </div>
        </div>

        {/* 6. Eco-Friendly (Square) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden cursor-pointer bg-[#EBE7DD] dark:bg-[#3d3d3a]"
        >
          <img 
             src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-f2838873_1.jpg?v=1765532281"
             alt="Eco-Friendly"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
            <span className="material-symbols-outlined text-white text-4xl mb-3 opacity-90 drop-shadow-md">
              eco
            </span>
            <h3 className="text-white text-lg font-serif font-medium drop-shadow-md">
              Eco-Friendly
            </h3>
            <p className="text-white/90 text-xs mt-1 drop-shadow-md font-medium">
              100% Recycled Materials
            </p>
          </div>
        </div>

        {/* 7. Accessories (Square) */}
        <div 
            onClick={onCollectionClick}
            className="bento-card group relative md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden cursor-pointer bg-black"
        >
           <img 
             src="https://images.unsplash.com/photo-1615634260167-c8c9c313880b?q=80&w=800&auto=format&fit=crop"
             alt="Accessories"
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-0 left-0 p-5 z-10">
            <h3 className="text-white text-lg font-serif font-medium">Accessories</h3>
            <p className="text-white/70 text-xs">Pumps, Caps & More</p>
          </div>
        </div>

      </div>
    </div>
  );
};