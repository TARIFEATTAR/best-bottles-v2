import React from "react";
import { FINDER_CATEGORIES, FEATURES, JOURNAL_POSTS } from "../constants";
import { BentoGrid } from "./BentoGrid";
import { LuxuryPackageSlider } from "./LuxuryPackageSlider";
import { ProductSection } from "./ProductSection";
import { Product } from "../types";

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
  return (
    <div className="w-full bg-[#F5F3EF] dark:bg-background-dark overflow-x-hidden transition-colors duration-500">
      
      {/* 1. Hero Section: Cinematic Full-Bleed */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center px-6 md:px-10 lg:px-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
             <img 
                src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-1dbf4984.jpg?v=1765505302" 
                alt="Cinematic Perfume Bottle" 
                className="w-full h-full object-cover brightness-[0.85] dark:brightness-[0.7]"
             />
             {/* Enhanced gradient for center text visibility */}
             <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>

        {/* Content Overlay - Raised & Organized */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto animate-fade-up pl-4 md:pl-0">
             <div className="max-w-3xl">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] w-12 bg-[#C5A065]"></div>
                    <span className="text-white/90 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                        Premium Packaging Solutions
                    </span>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white leading-[0.9] mb-8 tracking-tight shadow-sm">
                    Form meets <br/> Fragrance
                 </h1>
                 
                 <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-10 border-l-2 border-white/20 pl-6">
                    Bottles designed for fragrance houses that demand presence. <br className="hidden md:block" />
                    Elevate your brand with our curated collection of luxury vessels.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4">
                     <button 
                        onClick={onCollectionClick}
                        className="bg-white text-[#1D1D1F] px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg min-w-[200px]"
                     >
                        Explore Collections
                     </button>
                     <button 
                        onClick={onConsultationClick}
                        className="backdrop-blur-md bg-white/10 border border-white/30 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1D1D1F] transition-all min-w-[200px]"
                     >
                        Work With Us
                     </button>
                 </div>
             </div>
        </div>
      </section>

      {/* 2. Social Proof Ticker (Subtle) - Moved Here */}
      <section className="border-b border-[#E5E0D8] dark:border-gray-800 bg-[#F5F3EF] dark:bg-background-dark py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap items-center">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div key={i} className="mx-16 flex items-center justify-center opacity-30 dark:opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default">
                <span className="text-xl font-serif font-bold text-[#2D3A3F] dark:text-white tracking-widest">{brand}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Intro/Sustainability Section: 2-Column Structure */}
      <section className="py-24 px-6 md:px-10 lg:px-20 bg-[#F5F3EF] dark:bg-background-dark">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start border-t border-[#E5E0D8] dark:border-gray-800 pt-10">
             <div className="max-w-md">
                 <h2 className="text-4xl md:text-5xl font-serif text-[#2D3A3F] dark:text-white leading-tight">
                    Sustainable <br/> Elegance
                 </h2>
             </div>
             <div>
                 <p className="text-[#637588] dark:text-gray-400 font-light leading-relaxed text-lg mb-8">
                    We believe the vessel is as vital as the scent it holds. Our "Muted Luxury" line blends timeless artisanal craftsmanship with modern sustainable practices, creating bottles that are not merely containers, but objects of desire.
                 </p>
                 <button onClick={onCollectionClick} className="group flex items-center gap-2 text-[#C5A065] text-xs font-bold uppercase tracking-widest hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                    Read Our Philosophy
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                 </button>
             </div>
         </div>
      </section>

      {/* 4. Curated Selections (Bento Grid) - Moved Up */}
      <section id="collections" className="py-24 bg-[#F5F3EF] dark:bg-background-dark">
         <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-12 flex justify-between items-end">
             <div>
                <h2 className="text-4xl font-serif text-[#2D3A3F] dark:text-white mb-2">
                    Curated Selections
                </h2>
                <p className="text-[#637588] dark:text-gray-400 text-sm font-light">
                    Defined aesthetic lines for the modern perfumer.
                </p>
             </div>
             <button 
                onClick={onCollectionClick}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D3A3F] dark:text-white hover:text-[#C5A065] transition-colors"
             >
                View Full Catalog
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
             </button>
         </div>
         <BentoGrid 
            onCollectionClick={onCollectionClick} 
            onPackagingIdeasClick={onPackagingIdeasClick}
         />
      </section>

      {/* 4.5 Packaging Inspiration Teaser (UPDATED WITH SLIDER) */}
      <section className="bg-[#EBE7DD] dark:bg-[#2A2A2A] py-20 border-y border-[#D8C6B0] dark:border-gray-700">
         <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 block">Inspiration Gallery</span>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-6">
                    See what's possible.
                </h2>
                <p className="text-[#637588] dark:text-gray-300 mb-8 max-w-md leading-relaxed">
                    Explore our curated mood boards for specific fragrance profiles like "Rose Eau De Parfum". Visualize your brand on our bottles before you buy.
                </p>
                <button 
                    onClick={onPackagingIdeasClick}
                    className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg"
                >
                    View Packaging Ideas
                </button>
            </div>
            
            {/* Interactive Slider Showcase */}
            <div className="flex-1 w-full max-w-lg aspect-square bg-white dark:bg-black/20 rounded-xl shadow-2xl border border-white dark:border-gray-700 overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
                <LuxuryPackageSlider scenes={HOME_SLIDER_SCENES} />
            </div>
         </div>
      </section>

      {/* Product Section inserted here */}
      <ProductSection 
        onProductClick={onProductClick} 
        onAddToCart={onAddToCart}
      />

      {/* 5. Finder Strip (Clean) - Moved Below Collections */}
      <section className="bg-white dark:bg-[#1A1D21] py-16 border-y border-gray-100 dark:border-gray-800">
         <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {FINDER_CATEGORIES.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={onCollectionClick}
                  className="group flex flex-col items-center gap-4 text-[#2D3A3F] dark:text-gray-300 hover:text-[#C5A065] dark:hover:text-[#C5A065] transition-colors"
                >
                   <span className="material-symbols-outlined text-4xl font-light group-hover:-translate-y-1 transition-transform duration-300">
                      {cat.icon}
                   </span>
                   <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-center">
                      {cat.label}
                   </span>
                </button>
              ))}
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                <button 
                  onClick={onConsultationClick}
                  className="inline-flex items-center gap-2 text-sm text-[#637588] dark:text-gray-400 hover:text-[#2D3A3F] dark:hover:text-white transition-colors"
                >
                   <span className="material-symbols-outlined text-lg">help_outline</span>
                   <span>Not sure what you need? <span className="underline underline-offset-4 decoration-gray-300 hover:decoration-[#C5A065] font-medium">Let our specialist guide you.</span></span>
                </button>
            </div>
         </div>
      </section>

      {/* 6. Custom Metal Shell Atomizers (Replaced Bespoke Section) */}
      <section id="custom" className="bg-[#1D1D1F] dark:bg-[#15191C] text-white py-24 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Image Mockup */}
            <div className="relative aspect-[4/3] lg:aspect-square bg-[#2A2E35] rounded-sm shadow-2xl overflow-hidden group">
                <img 
                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537" 
                    alt="Metal Shell Atomizers" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                {/* Overlay Text */}
                <div className="absolute bottom-12 left-12">
                    <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-2 block">Signature Series</span>
                    <h3 className="text-2xl font-serif">Laser Engraved Atomizers</h3>
                </div>
            </div>

            {/* Right Content */}
            <div>
                <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Custom Fabrication</span>
                <h2 className="text-4xl md:text-6xl font-serif font-medium mb-8 leading-tight">
                    Laser Engraved <br/> Atomizers
                </h2>
                <p className="text-white/70 text-lg font-light leading-relaxed mb-10 max-w-lg">
                    Laser engraving transforms our metal shell atomizers into distinct, personalized keepsakes. Perfect for fragrance promotions, wedding favors, or corporate gifting, these high-quality, useful vessels offer a unique way to ensure your brand or special event is remembered long after the moment has passed.
                </p>

                <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] transition-all">
                            <span className="material-symbols-outlined text-sm">diamond</span>
                        </div>
                        <span className="text-sm font-medium tracking-wide">360° Precision Laser Engraving</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] transition-all">
                            <span className="material-symbols-outlined text-sm">palette</span>
                        </div>
                        <span className="text-sm font-medium tracking-wide">Premium Anodized Finishes</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] transition-all">
                            <span className="material-symbols-outlined text-sm">fitness_center</span>
                        </div>
                        <span className="text-sm font-medium tracking-wide">Luxury Weighted Feel</span>
                    </div>
                </div>

                <button 
                  onClick={onConsultationClick}
                  className="bg-white text-[#1D1D1F] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg"
                >
                    Request Sample Kit
                </button>
            </div>
        </div>
      </section>

      {/* 7. Journal Preview */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 bg-[#F5F3EF] dark:bg-background-dark">
        <div className="flex justify-between items-baseline mb-12">
            <h2 className="text-2xl font-serif text-[#2D3A3F] dark:text-white">Journal</h2>
            <a href="#" className="text-xs font-bold tracking-widest uppercase text-[#637588] hover:text-[#C5A065] transition-colors">View Archive</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {JOURNAL_POSTS.map((post, idx) => (
                <article key={idx} className="group cursor-pointer">
                    <div className="aspect-[3/2] overflow-hidden rounded-sm mb-6 bg-gray-200">
                        <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                        />
                    </div>
                    <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest block mb-2">{post.date}</span>
                    <h3 className="text-xl font-serif font-medium text-[#2D3A3F] dark:text-white mb-3 leading-snug group-hover:text-[#C5A065] transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-sm text-[#637588] line-clamp-2">{post.excerpt}</p>
                </article>
            ))}
        </div>
      </section>

    </div>
  );
};