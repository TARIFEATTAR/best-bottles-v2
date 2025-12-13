import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onHomeClick?: () => void;
  onConsultationClick?: () => void;
  onCollectionsClick?: () => void;
  onCustomClick?: () => void;
  onJournalClick?: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onCartClick?: () => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onConsultationClick, 
  onCollectionsClick,
  onCustomClick,
  onJournalClick,
  onLoginClick,
  onSignUpClick,
  onCartClick,
  cartCount = 0
}) => {
  // We use a string to track WHICH menu is open: 'shop', 'collections', or null
  const [activeMenu, setActiveMenu] = useState<'shop' | 'collections' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menu: 'shop' | 'collections') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-[#151515] transition-colors duration-300">
      
      <header className="border-b border-gray-200 dark:border-gray-800 shadow-sm relative bg-white dark:bg-[#151515]">
        <div className="max-w-[1800px] mx-auto">
          
          {/* TOP ROW: Logo | Search | Actions */}
          <div className="flex items-center justify-between px-6 py-5 gap-6 md:gap-8">
              
              {/* 1. Logo */}
              <a
                  className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-text-light dark:text-text-dark cursor-pointer flex-shrink-0 uppercase"
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
                      placeholder="Search items, SKUs, or categories..." 
                      className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none transition-all text-sm text-text-light dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  />
              </div>

              {/* 3. Actions (Right) */}
              <div className="flex items-center gap-4 md:gap-4 flex-shrink-0">
                   
                   {/* Login / Sign Up */}
                   <div className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-light dark:text-white mr-2">
                       <button onClick={onLoginClick} className="hover:text-[#C5A065] transition-colors">Log In</button>
                       <button onClick={onSignUpClick} className="hover:text-[#C5A065] transition-colors">Sign Up</button>
                   </div>

                   {/* Bottle Specialist Button */}
                   <motion.button 
                      onClick={onConsultationClick}
                      className="hidden md:flex bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-5 py-3 rounded-md text-xs font-bold uppercase tracking-widest shadow-sm items-center gap-2"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left - rect.width / 2) / 10;
                        const y = (e.clientY - rect.top - rect.height / 2) / 10;
                        setMousePosition({ x, y });
                      }}
                      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
                      animate={{
                        x: mousePosition.x,
                        y: mousePosition.y,
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 15 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                   >
                      Bottle Specialist
                   </motion.button>

                   {/* Cart */}
                   <button 
                      onClick={onCartClick}
                      className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors group"
                   >
                      <span className="material-symbols-outlined text-[24px] text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">shopping_bag</span>
                      {cartCount > 0 && (
                          <span className="absolute top-0 right-0 w-4 h-4 bg-[#C5A065] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white dark:border-[#151515]">
                              {cartCount}
                          </span>
                      )}
                   </button>
              </div>
          </div>

          {/* BOTTOM ROW: Navigation (Centered) & Contact Info (Right) */}
          <div className="hidden md:flex items-center justify-between px-6 border-t border-gray-100 dark:border-gray-800 h-[60px]">
              
              {/* Left Spacer to balance the layout for centering nav */}
              <div className="flex-1 hidden lg:block"></div>

              {/* Navigation */}
              <nav className="flex items-center space-x-12 text-xs font-bold uppercase tracking-[0.15em] text-text-light/80 dark:text-text-dark/80 mx-auto h-full">
                  
                  {/* SHOP MENU TRIGGER (Functional/Categories) */}
                  <div 
                      className="h-full flex items-center"
                      onMouseEnter={() => handleMouseEnter('shop')}
                      onMouseLeave={handleMouseLeave}
                  >
                      <a 
                          className={`h-full flex items-center gap-1 transition-colors cursor-pointer border-b-2 border-transparent ${
                              activeMenu === 'shop' ? 'text-[#C5A065] border-[#C5A065]' : 'hover:text-[#C5A065]'
                          }`}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setActiveMenu(null); onHomeClick?.(); }}
                      >
                          Shop Products
                          <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${activeMenu === 'shop' ? 'rotate-180' : ''}`}>expand_more</span>
                      </a>
                  </div>
                  
                  {/* COLLECTIONS MENU TRIGGER (Thematic/Visual) */}
                  <div 
                      className="h-full flex items-center"
                      onMouseEnter={() => handleMouseEnter('collections')}
                      onMouseLeave={handleMouseLeave}
                  >
                      <a 
                          className={`h-full flex items-center gap-1 transition-colors cursor-pointer border-b-2 border-transparent ${
                              activeMenu === 'collections' ? 'text-[#C5A065] border-[#C5A065]' : 'hover:text-[#C5A065]'
                          }`}
                          href="#collections"
                          onClick={(e) => { e.preventDefault(); setActiveMenu(null); onCollectionsClick?.(); }}
                      >
                          Collections
                          <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${activeMenu === 'collections' ? 'rotate-180' : ''}`}>expand_more</span>
                      </a>
                  </div>

                  <a 
                      className="h-full flex items-center hover:text-[#C5A065] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#C5A065]" 
                      href="#custom"
                      onClick={(e) => { e.preventDefault(); onCustomClick?.(); }}
                  >
                      Custom
                  </a>
                  <a 
                      className="h-full flex items-center hover:text-[#C5A065] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#C5A065]" 
                      href="#journal"
                      onClick={(e) => { e.preventDefault(); onJournalClick?.(); }}
                  >
                      Journal
                  </a>
              </nav>

              {/* Contact Info (Right Aligned) */}
              <div className="flex-1 flex justify-end gap-6 text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
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
        </div>

        {/* --- SHOP MEGA MENU (Functional) --- */}
        <AnimatePresence>
            {activeMenu === 'shop' && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full bg-white dark:bg-[#151515] border-t border-gray-100 dark:border-gray-800 shadow-2xl z-40"
                    onMouseEnter={() => handleMouseEnter('shop')}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="max-w-[1600px] mx-auto px-6 py-12">
                        <div className="grid grid-cols-4 gap-8">
                            
                            {/* Col 1: Containers */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                    <span className="material-symbols-outlined">view_in_ar</span>
                                    <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Bottles & Vials</h4>
                                </div>
                                <ul className="space-y-3">
                                    {['Glass Bottles', 'Plastic Bottles', 'Aluminum Bottles', 'Glass Vials (Drams)', 'Roll-On Bottles', 'Jars & Pots'].map(item => (
                                        <li key={item}>
                                            <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 2: Closures */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Closures & Dispensers</h4>
                                </div>
                                <ul className="space-y-3">
                                    {['Caps (Phenolic & Metal)', 'Fine Mist Sprayers', 'Treatment Pumps', 'Lotion Pumps', 'Droppers & Pipettes', 'Orifice Reducers'].map(item => (
                                        <li key={item}>
                                            <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 3: Accessories */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                    <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Packaging Accessories</h4>
                                </div>
                                <ul className="space-y-3">
                                    {['Velvet Pouches', 'Gift Boxes', 'Funnels', 'Shipping Supplies', 'Labels & Decor'].map(item => (
                                        <li key={item}>
                                            <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 4: Featured Action */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 flex flex-col justify-between">
                                <div>
                                    <span className="bg-[#1D1D1F] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">New Arrival</span>
                                    <h4 className="font-serif text-xl text-text-light dark:text-white mb-2">Metal Shell Atomizers</h4>
                                    <p className="text-xs text-gray-500 mb-4">Laser-engravable aluminum shells for ultimate brand customization.</p>
                                </div>
                                <img src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537" className="w-full h-32 object-cover rounded-lg mb-4 opacity-80" alt="Metal Atomizers" />
                                <button onClick={() => { setActiveMenu(null); onCustomClick?.(); }} className="text-xs font-bold uppercase tracking-widest text-[#C5A065] hover:text-text-light dark:hover:text-white transition-colors flex items-center gap-2">
                                    Explore Series <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- COLLECTIONS MEGA MENU (Thematic) --- */}
        <AnimatePresence>
            {activeMenu === 'collections' && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full bg-white dark:bg-[#151515] border-t border-gray-100 dark:border-gray-800 shadow-2xl z-40"
                    onMouseEnter={() => handleMouseEnter('collections')}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="max-w-[1600px] mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* Visual Collection 1 */}
                            <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                    <img 
                                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548" 
                                        alt="Amber Collection"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <h4 className="font-serif text-lg text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">The Amber Collection</h4>
                                <p className="text-xs text-gray-500 mt-1">UV protection meets timeless apothecary aesthetics.</p>
                            </div>

                            {/* Visual Collection 2 */}
                            <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                    <img 
                                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-48628740_1.jpg?v=1765524503" 
                                        alt="Luxury Glass"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <h4 className="font-serif text-lg text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">Luxury Perfumery</h4>
                                <p className="text-xs text-gray-500 mt-1">Heavy-based glass for premium fragrance brands.</p>
                            </div>

                            {/* Visual Collection 3 */}
                            <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                    <img 
                                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142" 
                                        alt="Clear Series"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <h4 className="font-serif text-lg text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">Crystal Clear</h4>
                                <p className="text-xs text-gray-500 mt-1">Showcase the purity of your product.</p>
                            </div>

                            {/* List of Other Collections */}
                            <div className="col-span-3 flex flex-col justify-center border-l border-gray-100 dark:border-gray-800 pl-8">
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">More Series</h4>
                                <ul className="space-y-4">
                                    {['Cobalt Blue', 'Emerald Green', 'Frosted Editions', 'Travel Size (1-5ml)', 'Sample Vials'].map(item => (
                                        <li key={item}>
                                            <a href="#" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }} className="text-sm font-medium text-text-light dark:text-white hover:text-[#C5A065] flex items-center justify-between group">
                                                {item}
                                                <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }} className="mt-8 text-xs font-bold text-[#C5A065] uppercase tracking-widest hover:underline text-left">
                                    View Full Catalog
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </header>
    </div>
  );
};