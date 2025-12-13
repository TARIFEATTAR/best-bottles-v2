import React, { useEffect, useState } from "react";
import { FINDER_CATEGORIES, FEATURES, JOURNAL_POSTS } from "../constants";
import { BentoGrid } from "./BentoGrid";
import { LuxuryPackageSlider } from "./LuxuryPackageSlider";
import { Reveal } from "./Reveal";
import { Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface ModernHomeProps {
  onProductClick?: () => void;
  onConsultationClick?: () => void;
  onCollectionClick?: () => void;
  onPackagingIdeasClick?: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

const BRANDS = [
  "LUMIÈRE", "VOGUE", "ELIXIR", "AURA", "ZENITH", "NOIR", "SOLSTICE", "PRISMA", "VELVET", "OASIS"
];

// Scene Data for the Home Slider
const HOME_SLIDER_SCENES = [
    {
        // Scene 1: Plain vs Branded
        before: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142", 
        after: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-a04d7c57.jpg?v=1765532762", 
        labelBefore: "Before",
        labelAfter: "After"
    }
];

export const ModernHome: React.FC<ModernHomeProps> = ({ 
  onProductClick, 
  onConsultationClick, 
  onCollectionClick, 
  onPackagingIdeasClick,
  onAddToCart
}) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("Listening...");

  // Parallax Effect Hook
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleVoiceInteraction = () => {
    setIsListening(true);
    setVoiceText("Listening...");
    
    // Simulate Voice Processing Flow
    setTimeout(() => {
        setVoiceText("Analyzing request...");
    }, 2000);

    setTimeout(() => {
        setVoiceText("Finding matching bottles...");
    }, 3500);

    setTimeout(() => {
        setIsListening(false);
        // Redirect to consultation page with context
        onConsultationClick?.();
    }, 4500);
  };

  return (
    <div className="w-full bg-[#F5F3EF] dark:bg-background-dark overflow-x-hidden transition-colors duration-500">
      
      {/* 1. Hero Section: Cinematic Full-Bleed with Parallax */}
      <section className="relative w-full h-[95vh] min-h-[700px] flex items-center px-6 md:px-10 lg:px-20 overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div 
            className="absolute inset-0 z-0 will-change-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ y: offsetY * 0.5 }} // Combining framer motion initial animation with scroll parallax
        >
             <div className="absolute inset-0 transform scale-105">
                 {/* Updated Hero Image: Antique Bottle on Right, Negative Space on Left */}
                 <img 
                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-23e11813.jpg?v=1765598795" 
                    alt="Antique Perfume Bottle" 
                    className="w-full h-full object-cover object-[70%_center] md:object-center brightness-[0.8] dark:brightness-[0.7]"
                 />
                 {/* Stronger gradient on the left to ensure text readability against the open space */}
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
             </div>
        </motion.div>

        {/* Content Overlay - Strictly aligned to left 50% for open negative space feel */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto pl-4 md:pl-0 grid grid-cols-1 md:grid-cols-2">
             <div className="md:col-span-1 max-w-2xl">
                 <Reveal delay={0.2} effect="fade">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-[1px] w-12 bg-[#C5A065]"></div>
                        <span className="text-white/90 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                            Premium Packaging Solutions
                        </span>
                    </div>
                 </Reveal>
                 
                 <div className="mb-8 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-semibold text-white leading-[0.95] tracking-tight drop-shadow-lg">
                            Beautifully <br/>
                            <span className="text-[#e0ded6]">Contained</span>
                        </h1>
                    </motion.div>
                 </div>
                 
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                 >
                     <p className="text-white/95 text-xl md:text-2xl font-light leading-relaxed max-w-xl mb-12 border-l border-white/30 pl-6">
                        Premium packaging solutions for brands ready to grow.
                     </p>
                 </motion.div>
                 
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                 >
                     <div className="flex flex-col sm:flex-row gap-4">
                         <button 
                            onClick={onCollectionClick}
                            className="bg-white text-[#1D1D1F] px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg min-w-[200px] hover:scale-105 duration-300"
                         >
                            Explore Collections
                         </button>
                         <button 
                            onClick={onConsultationClick}
                            className="backdrop-blur-md bg-white/10 border border-white/30 text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1D1D1F] transition-all min-w-[200px] hover:scale-105 duration-300"
                         >
                            Start Project
                         </button>
                     </div>
                 </motion.div>
             </div>
             {/* Right column is intentionally empty to respect the "open space" and show the bottle */}
             <div className="hidden md:block"></div>
        </div>
      </section>

      {/* 2. Social Proof Ticker (Subtle) */}
      <section className="border-b border-[#E5E0D8] dark:border-gray-800 bg-[#F5F3EF] dark:bg-background-dark py-8 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap items-center">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div key={i} className="mx-16 flex items-center justify-center opacity-30 dark:opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default hover:scale-110">
                <span className="text-xl font-serif font-bold text-[#2D3A3F] dark:text-white tracking-widest">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2.5 Finder Strip & Search (Wide, Conversation-Driven) */}
      <section className="bg-white dark:bg-[#1A1D21] py-16 border-b border-gray-100 dark:border-gray-800 relative z-20">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            
            {/* Expanded Smart Search Bar - "Command Center" Style */}
            <div className="w-full mx-auto mb-16 relative z-30">
                 <Reveal effect="scale" width="100%">
                    <div className="relative group bg-white dark:bg-[#0F0F0F] rounded-full border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center p-2 min-h-[72px]">
                        
                        {/* Voice / Listening Overlay */}
                        <AnimatePresence>
                        {isListening && (
                            <motion.div 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "100%" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="absolute inset-0 z-50 bg-green-500 rounded-full flex items-center justify-center gap-4 overflow-hidden"
                            >
                                <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
                                <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-75"></span>
                                <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></span>
                                <span className="text-white font-mono text-sm tracking-widest uppercase font-bold">{voiceText}</span>
                            </motion.div>
                        )}
                        </AnimatePresence>

                        {/* Left: Input & Mic (Flex Grow) */}
                        <div className="flex-1 w-full flex items-center relative md:border-r border-gray-100 dark:border-gray-800 px-4">
                             <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#C5A065] transition-colors text-2xl ml-2">search</span>
                             <input 
                                type="text" 
                                placeholder="Describe your project (e.g. 'Blue glass for essential oils')" 
                                className="w-full py-4 pl-4 pr-16 bg-transparent border-none outline-none text-lg text-[#1D1D1F] dark:text-white placeholder:text-gray-400"
                            />
                             {/* Best Bottles Brain / Mic Trigger */}
                             <button 
                                onClick={handleVoiceInteraction}
                                className={`absolute right-2 p-3 rounded-full transition-all duration-500 flex items-center justify-center overflow-visible ${
                                    isListening 
                                    ? "bg-green-500 text-white scale-110 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                                    : "text-[#F59E0B] hover:bg-gray-100 dark:hover:bg-white/10"
                                }`}
                                title="Ask Best Bottles Brain"
                             >
                                 {/* Idle Glow/Breathing - Reduced opacity from 20 to 10 */}
                                 {!isListening && (
                                     <span className="absolute inset-0 rounded-full bg-[#F59E0B]/10 blur-md animate-pulse"></span>
                                 )}
                                 
                                 {/* Active Waves */}
                                 {isListening && (
                                     <>
                                        <span className="absolute inset-0 rounded-full border border-white/50 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                        <span className="absolute inset-0 rounded-full border border-white/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></span>
                                     </>
                                 )}

                                 {/* Icon Drop Shadow - Reduced opacity from 0.8 to 0.4 */}
                                 <span className={`material-symbols-outlined filled-icon text-2xl relative z-10 ${
                                     !isListening ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" : ""
                                 }`}>mic</span>
                             </button>
                        </div>

                        {/* Right: Smart Filters + Action (Auto width) */}
                        <div className="w-full md:w-auto flex items-center justify-between md:justify-end px-2 md:px-6 py-2 gap-4">
                            
                            {/* Desktop Filters */}
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="relative group/filter">
                                    <button className="flex items-center gap-2 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                        <span>Bottle Type</span>
                                        <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                    </button>
                                </div>
                                <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                                <div className="relative group/filter">
                                    <button className="flex items-center gap-2 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                        <span>Cap Style</span>
                                        <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                    </button>
                                </div>
                                <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                                <div className="relative group/filter">
                                    <button className="flex items-center gap-2 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                        <span>Capacity</span>
                                        <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                    </button>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button className="flex-shrink-0 w-12 h-12 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center hover:bg-[#C5A065] transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>

                    </div>
                 </Reveal>
            </div>

            {/* Categories Grid (Ultra Wide) */}
            <div className="w-full mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-start justify-items-center">
              {FINDER_CATEGORIES.map((cat, idx) => {
                // Check if this category has a special image background
                let customImageUrl = null;
                if (cat.icon === 'spray') {
                    customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142";
                } else if (cat.icon === 'gesture') {
                    customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-39b140c0.jpg?v=1765595835";
                }

                return (
                <Reveal key={idx} delay={idx * 0.1} effect="scale" width="100%">
                    <button 
                      onClick={onCollectionClick}
                      className="group flex flex-col items-center gap-4 w-full"
                    >
                       <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 overflow-hidden relative ${
                           customImageUrl 
                           ? "bg-white border border-gray-100 dark:border-gray-800" 
                           : "bg-gray-50 dark:bg-white/5 text-[#2D3A3F] dark:text-gray-300 group-hover:bg-[#1D1D1F] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1D1D1F]"
                       }`}>
                           {/* Hover Overlay Tint - Applies to all types for unity */}
                           <div className="absolute inset-0 bg-[#405D68] mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10 pointer-events-none"></div>

                           {/* Conditionally render custom Image for 'spray' and 'roll-on' icons */}
                           {customImageUrl ? (
                               <>
                                   <img 
                                       src={customImageUrl}
                                       alt={cat.label}
                                       // Updated to fill container completely (object-cover) and toggle Grayscale
                                       className="w-full h-full object-cover transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-110" 
                                   />
                                   {/* Subtle tint on hover for image specifically */}
                                   <div className="absolute inset-0 bg-[#C5A065]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                               </>
                           ) : (
                               <span className="material-symbols-outlined text-4xl md:text-5xl font-light transition-transform group-hover:scale-110 relative z-20">
                                  {cat.icon}
                               </span>
                           )}
                       </div>
                       <span className="text-xs md:text-sm font-bold tracking-[0.1em] uppercase text-center text-gray-500 group-hover:text-[#C5A065] transition-colors">
                          {cat.label}
                       </span>
                    </button>
                </Reveal>
              );
              })}
            </div>
         </div>
      </section>

      {/* 3. Intro/Sustainability Section: 2-Column Structure */}
      <section className="py-32 px-6 md:px-10 lg:px-20 bg-[#F5F3EF] dark:bg-background-dark relative">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start border-t border-[#E5E0D8] dark:border-gray-800 pt-16">
             <div className="max-w-md sticky top-32">
                 <Reveal effect="slide-up">
                     <h2 className="text-5xl md:text-6xl font-serif text-[#2D3A3F] dark:text-white leading-tight">
                        Sustainable <br/> Elegance
                     </h2>
                 </Reveal>
             </div>
             <div>
                 <Reveal delay={0.2}>
                     <p className="text-[#637588] dark:text-gray-400 font-light leading-relaxed text-lg md:text-xl mb-10">
                        We believe the vessel is as vital as the scent it holds. Our "Muted Luxury" line blends timeless artisanal craftsmanship with modern sustainable practices, creating bottles that are not merely containers, but objects of desire.
                     </p>
                 </Reveal>
                 <Reveal delay={0.4}>
                     <button onClick={onCollectionClick} className="group flex items-center gap-3 text-[#C5A065] text-xs font-bold uppercase tracking-widest hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                        Read Our Philosophy
                        <span className="w-12 h-[1px] bg-[#C5A065] group-hover:w-20 transition-all duration-300"></span>
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                     </button>
                 </Reveal>
             </div>
         </div>
      </section>

      {/* 4. Curated Selections (Bento Grid) - Moved Up */}
      <section id="collections" className="py-24 bg-[#F5F3EF] dark:bg-background-dark">
         <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-16 flex justify-between items-end">
             <Reveal>
                 <div>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#2D3A3F] dark:text-white mb-3">
                        Curated Selections
                    </h2>
                    <p className="text-[#637588] dark:text-gray-400 text-sm font-light">
                        Defined aesthetic lines for the modern perfumer.
                    </p>
                 </div>
             </Reveal>
             <Reveal delay={0.2}>
                 <button 
                    onClick={onCollectionClick}
                    className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D3A3F] dark:text-white hover:text-[#C5A065] transition-colors"
                 >
                    View Full Catalog
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </button>
             </Reveal>
         </div>
         
         {/* Bento Grid gets a generic fade reveal */}
         <Reveal delay={0.3} width="100%">
             <BentoGrid 
                onCollectionClick={onCollectionClick} 
                onPackagingIdeasClick={onPackagingIdeasClick}
             />
         </Reveal>
      </section>

      {/* 4.5 Packaging Inspiration Teaser (UPDATED WITH SLIDER) */}
      <section className="bg-[#EBE7DD] dark:bg-[#2A2A2A] py-32 border-y border-[#D8C6B0] dark:border-gray-700 overflow-hidden">
         <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 order-2 md:order-1">
                <Reveal>
                    <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 block">Inspiration Gallery</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-6">
                        See what's possible.
                    </h2>
                    <p className="text-[#637588] dark:text-gray-300 mb-10 max-w-md leading-relaxed text-lg">
                        Explore our curated mood boards for specific fragrance profiles like "Rose Eau De Parfum". Visualize your brand on our bottles before you buy.
                    </p>
                    <button 
                        onClick={onPackagingIdeasClick}
                        className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg hover:scale-105 duration-300"
                    >
                        View Packaging Ideas
                    </button>
                </Reveal>
            </div>
            
            {/* Interactive Slider Showcase - Slight rotation and hover effect for interactivity */}
            <div className="flex-1 w-full max-w-xl order-1 md:order-2">
                <Reveal effect="scale" delay={0.2}>
                    <div className="aspect-square bg-white dark:bg-black/20 rounded-xl shadow-2xl border border-white dark:border-gray-700 overflow-hidden transform md:rotate-2 hover:rotate-0 transition-all duration-700 hover:shadow-3xl hover:scale-[1.02]">
                        <LuxuryPackageSlider scenes={HOME_SLIDER_SCENES} />
                    </div>
                </Reveal>
            </div>
         </div>
      </section>

      {/* 5. Custom Metal Shell Atomizers (Replaces old Finder Strip Section) */}
      <section id="custom" className="bg-[#1D1D1F] dark:bg-[#15191C] text-white py-32">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            {/* Left Image Mockup */}
            <div className="relative group perspective-1000">
                <Reveal effect="scale">
                    <div className="aspect-[4/5] lg:aspect-square bg-[#2A2E35] rounded-sm shadow-2xl overflow-hidden relative">
                        <img 
                            src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537" 
                            alt="Metal Shell Atomizers" 
                            className="w-full h-full object-cover opacity-90 transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                        
                        {/* Overlay Text */}
                        <div className="absolute bottom-12 left-12 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                            <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-2 block">Signature Series</span>
                            <h3 className="text-3xl font-serif">Laser Engraved Atomizers</h3>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Right Content */}
            <div>
                <Reveal>
                    <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Custom Fabrication</span>
                    <h2 className="text-5xl md:text-7xl font-serif font-medium mb-8 leading-[0.9]">
                        Laser Engraved <br/> Atomizers
                    </h2>
                </Reveal>
                
                <Reveal delay={0.2}>
                    <p className="text-white/70 text-lg font-light leading-relaxed mb-12 max-w-lg">
                        Laser engraving transforms our metal shell atomizers into distinct, personalized keepsakes. Perfect for fragrance promotions, wedding favors, or corporate gifting.
                    </p>
                </Reveal>

                <div className="space-y-8 mb-16">
                    <Reveal delay={0.3}>
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">diamond</span>
                            </div>
                            <span className="text-base font-medium tracking-wide">360° Precision Laser Engraving</span>
                        </div>
                    </Reveal>
                    <Reveal delay={0.4}>
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">palette</span>
                            </div>
                            <span className="text-base font-medium tracking-wide">Premium Anodized Finishes</span>
                        </div>
                    </Reveal>
                    <Reveal delay={0.5}>
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                <span className="material-symbols-outlined text-lg">fitness_center</span>
                            </div>
                            <span className="text-base font-medium tracking-wide">Luxury Weighted Feel</span>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.6}>
                    <button 
                      onClick={onConsultationClick}
                      className="bg-white text-[#1D1D1F] px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg hover:shadow-[#C5A059]/30"
                    >
                        Request Sample Kit
                    </button>
                </Reveal>
            </div>
        </div>
      </section>

      {/* 7. Journal Preview */}
      <section className="py-32 max-w-[1440px] mx-auto px-6 bg-[#F5F3EF] dark:bg-background-dark">
        <Reveal>
            <div className="flex justify-between items-baseline mb-16">
                <h2 className="text-4xl font-serif text-[#2D3A3F] dark:text-white">Journal</h2>
                <a href="#" className="text-xs font-bold tracking-widest uppercase text-[#637588] hover:text-[#C5A065] transition-colors relative group">
                    View Archive
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C5A065] group-hover:w-full transition-all duration-300"></span>
                </a>
            </div>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {JOURNAL_POSTS.map((post, idx) => (
                <Reveal key={idx} delay={idx * 0.2}>
                    <article className="group cursor-pointer">
                        <div className="aspect-[3/2] overflow-hidden rounded-md mb-8 bg-gray-200 relative">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                            <img 
                                src={post.image} 
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                            />
                        </div>
                        <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest block mb-3">{post.date}</span>
                        <h3 className="text-2xl font-serif font-medium text-[#2D3A3F] dark:text-white mb-4 leading-snug group-hover:text-[#C5A065] transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-sm text-[#637588] line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    </article>
                </Reveal>
            ))}
        </div>
      </section>

    </div>
  );
};