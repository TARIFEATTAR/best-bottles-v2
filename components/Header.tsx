import React, { useState, useEffect, useRef } from "react";

interface HeaderProps {
  onHomeClick?: () => void;
  onConsultationClick?: () => void;
  onCollectionsClick?: () => void;
  onCustomClick?: () => void;
  onJournalClick?: () => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onConsultationClick, 
  onCollectionsClick,
  onCustomClick,
  onJournalClick,
  cartCount = 0
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 150);
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-[#151515] transition-colors duration-300">
      
      {/* 0. Utility Bar (Contact Info) */}
      <div className="bg-[#405D68] text-white px-6 py-2 text-[11px] font-bold tracking-wider uppercase flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 md:gap-8 transition-colors">
         <div className="flex items-center gap-6">
             <a href="mailto:sales@nematinternational.com" className="hover:text-[#C5A065] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                sales@nematinternational.com
             </a>
             <a href="tel:5104450300" className="hover:text-[#C5A065] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">call</span>
                (510) 445-0300
             </a>
         </div>
      </div>

      <header className="border-b border-gray-200 dark:border-gray-800 shadow-sm relative bg-white dark:bg-[#151515]">
        <div className="max-w-[1800px] mx-auto">
          
          {/* TOP ROW: Logo | Search | Actions */}
          <div className="flex items-center justify-between px-6 py-5 gap-6 md:gap-8">
              
              {/* 1. Logo */}
              <a
                  className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-text-light dark:text-text-dark cursor-pointer flex-shrink-0"
                  href="#"
                  onClick={(e) => { e.preventDefault(); onHomeClick?.(); }}
              >
                  Best Bottles
              </a>

              {/* 2. Large Search Bar (Center) */}
              <div className="hidden md:flex flex-1 max-w-2xl relative mx-auto">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                  <input 
                      type="text" 
                      placeholder="Search Best Bottles..." 
                      className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none transition-all text-sm text-text-light dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  />
              </div>

              {/* 3. Actions (Right) */}
              <div className="flex items-center gap-4 md:gap-4 flex-shrink-0">
                   
                   {/* Login / Sign Up */}
                   <div className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-light dark:text-white mr-2">
                       <button className="hover:text-[#C5A065] transition-colors">Log In</button>
                       <button className="hover:text-[#C5A065] transition-colors">Sign Up</button>
                   </div>

                   {/* Bottle Specialist Button */}
                   <button 
                      onClick={onConsultationClick}
                      className="hidden md:flex bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-5 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm items-center gap-2"
                   >
                      Bottle Specialist
                   </button>

                   {/* Cart */}
                   <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors group">
                      <span className="material-symbols-outlined text-[24px] text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">shopping_bag</span>
                      {cartCount > 0 && (
                          <span className="absolute top-0 right-0 w-4 h-4 bg-[#C5A065] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white dark:border-[#151515]">
                              {cartCount}
                          </span>
                      )}
                   </button>
              </div>
          </div>

          {/* BOTTOM ROW: Navigation (Centered) */}
          <div className="hidden md:flex justify-center border-t border-gray-100 dark:border-gray-800">
              <nav className="flex items-center space-x-12 text-xs font-bold uppercase tracking-[0.15em] text-text-light/80 dark:text-text-dark/80">
                  <a 
                      className="hover:text-[#C5A065] transition-colors cursor-pointer py-4 border-b-2 border-transparent hover:border-[#C5A065]" 
                      href="#"
                      onClick={(e) => { e.preventDefault(); onHomeClick?.(); }}
                  >
                      Shop
                  </a>
                  
                  {/* Mega Menu Trigger */}
                  <div 
                      className="h-full flex items-center"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                  >
                      <a 
                          className={`hover:text-[#C5A065] transition-colors cursor-pointer py-4 border-b-2 border-transparent hover:border-[#C5A065] flex items-center gap-1 ${isMegaMenuOpen ? 'text-[#C5A065] border-[#C5A065]' : ''}`}
                          href="#collections"
                          onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }}
                      >
                          Collections
                          <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                      </a>
                  </div>

                  <a 
                      className="hover:text-[#C5A065] transition-colors cursor-pointer py-4 border-b-2 border-transparent hover:border-[#C5A065]" 
                      href="#custom"
                      onClick={(e) => { e.preventDefault(); onCustomClick?.(); }}
                  >
                      Custom
                  </a>
                  <a 
                      className="hover:text-[#C5A065] transition-colors cursor-pointer py-4 border-b-2 border-transparent hover:border-[#C5A065]" 
                      href="#journal"
                      onClick={(e) => { e.preventDefault(); onJournalClick?.(); }}
                  >
                      Journal
                  </a>
              </nav>
          </div>
        </div>

        {/* Mega Menu Content */}
        <div 
             className={`absolute top-full left-0 w-full bg-white dark:bg-[#151515] border-t border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-300 origin-top overflow-hidden z-40 ${
                 isMegaMenuOpen ? 'opacity-100 max-h-[600px] visible' : 'opacity-0 max-h-0 invisible'
             }`}
             onMouseEnter={handleMouseEnter}
             onMouseLeave={handleMouseLeave}
          >
           <div className="max-w-[1600px] mx-auto px-6 py-12">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                   
                   {/* Col 1: Categories */}
                   <div className="col-span-2">
                       <h4 className="font-serif text-lg text-text-light dark:text-white mb-6">By Category</h4>
                       <ul className="space-y-3">
                           {['Glass Bottles', 'Plastic Bottles', 'Aluminum', 'Vials & Tubes', 'Jars & Pots', 'Roll-Ons'].map(item => (
                               <li key={item}>
                                   <a href="#" onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }} className="text-xs font-bold text-gray-500 hover:text-[#C5A065] uppercase tracking-wide transition-colors block">
                                       {item}
                                   </a>
                               </li>
                           ))}
                       </ul>
                   </div>

                   {/* Col 2: Closures */}
                   <div className="col-span-2">
                       <h4 className="font-serif text-lg text-text-light dark:text-white mb-6">Closures & More</h4>
                       <ul className="space-y-3">
                           {['Caps & Closures', 'Droppers', 'Fine Mist Sprayers', 'Treatment Pumps', 'Orifice Reducers', 'Packaging Accessories'].map(item => (
                               <li key={item}>
                                   <a href="#" onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }} className="text-xs font-bold text-gray-500 hover:text-[#C5A065] uppercase tracking-wide transition-colors block">
                                       {item}
                                   </a>
                               </li>
                           ))}
                       </ul>
                   </div>

                    {/* Col 3: Visual Link 1 */}
                   <div className="col-span-4 group cursor-pointer" onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }}>
                       <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4 bg-gray-100">
                           <img 
                                src="https://images.unsplash.com/photo-1605218427368-2454a7cce69b?auto=format&fit=crop&q=80&w=600"
                                alt="Amber Collection"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                       </div>
                       <h4 className="font-serif text-lg text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">The Amber Collection</h4>
                       <p className="text-xs text-gray-500 mt-1">UV protection meets timeless apothecary aesthetics.</p>
                   </div>

                   {/* Col 4: Visual Link 2 */}
                   <div className="col-span-4 group cursor-pointer" onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }}>
                       <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4 bg-gray-100">
                           <img 
                                src="https://images.unsplash.com/photo-1594056980590-410e30932239?auto=format&fit=crop&q=80&w=600"
                                alt="Luxury Glass"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                       </div>
                       <h4 className="font-serif text-lg text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">Luxury Perfumery</h4>
                       <p className="text-xs text-gray-500 mt-1">Heavy-based glass for premium fragrance brands.</p>
                   </div>

               </div>
               
               {/* Footer of Mega Menu */}
               <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                   <div className="text-xs text-gray-400">
                       Looking for custom molds? <button onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCustomClick?.(); }} className="text-text-light dark:text-white font-bold underline hover:text-[#C5A065]">Start a bespoke project</button>
                   </div>
                   <button onClick={(e) => { e.preventDefault(); setIsMegaMenuOpen(false); onCollectionsClick?.(); }} className="text-xs font-bold text-[#C5A065] uppercase tracking-widest flex items-center gap-2 hover:opacity-80">
                       View All Collections <span className="material-symbols-outlined text-sm">arrow_forward</span>
                   </button>
               </div>
           </div>
      </div>
      </header>
    </div>
  );
};