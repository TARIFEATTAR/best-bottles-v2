import React from "react";
import { Reveal } from "./Reveal";

// Enhanced Article Data with REAL brand assets from CDN
const ARTICLES = [
  {
    category: "Video Series",
    type: "video",
    date: "New Release",
    title: "Behind the Glass: The Art of Manufacturing",
    excerpt: "Watch our exclusive documentary on how we achieve optical clarity in our premium flint glass collection.",
    // Real Hero Image from CDN
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-1dbf4984.jpg?v=1765505302", 
    videoUrl: "#", 
    featured: true
  },
  {
    category: "Sustainability",
    type: "article",
    date: "Sep 28, 2023",
    title: "Beyond Recycling: The PCR Revolution",
    excerpt: "Understanding Post-Consumer Recycled glass and its impact on the luxury supply chain.",
    // Real Amber Bottle Scene
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548", 
    featured: false
  },
  {
    category: "Design",
    type: "article",
    date: "Oct 12, 2023",
    title: "The Renaissance of Metal",
    excerpt: "Why premium brands are returning to aluminum and brass for weight, texture, and recyclability.",
    // Real Metal/Gold Product Scene
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-48628740_1.jpg?v=1765524503", 
    featured: false
  },
  {
    category: "Trends",
    type: "article",
    date: "Sep 15, 2023",
    title: "Minimalism vs. Maximalism",
    excerpt: "The industry is splitting into two distinct aesthetic directions. Which one fits your brand?",
    // Real Clear Bottle Scene
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142", 
    featured: false
  },
];

// Mock Social Media Feed using Actual Product Images to simulate a brand feed
const INSTAGRAM_FEED = [
    "https://www.bestbottles.com/images/store/enlarged_pics/GB6TPlGl.gif", // Gold Octagonal
    "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlCylGl.gif", // Royal Cylinder
    "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-a04d7c57.jpg?v=1765532762", // Lifestyle Shot
    "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif", // Amber Vial
    "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537", // Metal Atomizer
    "https://www.bestbottles.com/images/store/enlarged_pics/GBMtlMrblSmall.gif" // Marble Bottle
];

export const JournalPage: React.FC = () => {
  const featuredArticle = ARTICLES.find(a => a.featured);
  const regularArticles = ARTICLES.filter(a => !a.featured);

  return (
    <div className="w-full bg-background-light dark:bg-background-dark min-h-screen font-sans">
      
      {/* 1. Header - Compact */}
      <div className="pt-16 pb-12 px-6 max-w-[1440px] mx-auto border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-end gap-6">
        <Reveal effect="fade">
            <span className="text-xs font-bold tracking-[0.2em] text-[#C5A065] uppercase mb-2 block">The Collective</span>
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-text-light dark:text-text-dark">
            The Bottle Journal
            </h1>
        </Reveal>
        <Reveal delay={0.1}>
             <p className="text-text-gray max-w-md text-sm md:text-base font-light leading-relaxed text-right md:text-left">
                Exploring the intersection of craftsmanship, brand building, and visual culture.
             </p>
        </Reveal>
      </div>

      {/* 2. Featured Content - Split Layout (Fixing "Too Big") */}
      {featuredArticle && (
        <section className="max-w-[1440px] mx-auto px-6 py-12">
          <Reveal width="100%">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Video Column */}
                <div className="lg:col-span-8">
                    <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer bg-black shadow-2xl">
                        {/* Simulated Video Background / Poster */}
                        <img 
                            src={featuredArticle.image} 
                            alt={featuredArticle.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-3xl text-white pl-1">play_arrow</span>
                            </div>
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                            04:32
                        </div>
                    </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-4 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest mb-4 text-[#C5A065]">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {featuredArticle.category}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">{featuredArticle.date}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-6 leading-tight">
                        {featuredArticle.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">
                        {featuredArticle.excerpt}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button className="flex items-center justify-between w-full p-4 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-700 hover:border-[#C5A065] transition-colors group">
                            <span className="font-bold text-sm text-[#1D1D1F] dark:text-white">Watch Episode</span>
                            <span className="material-symbols-outlined text-[#C5A065] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <div className="flex gap-3">
                             <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white border-b border-gray-200 dark:border-gray-800 hover:border-current transition-colors text-left">
                                Share
                             </button>
                             <button className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white border-b border-gray-200 dark:border-gray-800 hover:border-current transition-colors text-left">
                                Save for later
                             </button>
                        </div>
                    </div>
                </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 3. Recent Stories Grid (Compact) */}
      <section className="bg-[#F9F8F6] dark:bg-[#111111] py-20 border-y border-gray-200 dark:border-gray-800">
         <div className="max-w-[1440px] mx-auto px-6">
             <div className="flex justify-between items-end mb-10">
                <h3 className="text-2xl font-serif text-[#1D1D1F] dark:text-white">Latest Stories</h3>
                <a href="#" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#C5A065]">View Archive</a>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {regularArticles.map((article, idx) => (
                   <Reveal key={idx} delay={idx * 0.1}>
                       <article className="group cursor-pointer flex flex-col h-full bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-[3/2] overflow-hidden relative">
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded text-[#1D1D1F] dark:text-white">
                                        {article.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{article.date}</span>
                                <h3 className="text-lg font-serif font-bold text-[#1D1D1F] dark:text-white mb-2 leading-tight group-hover:text-[#C5A065] transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
                                    {article.excerpt}
                                </p>
                                <span className="text-xs font-bold text-[#1D1D1F] dark:text-white underline decoration-gray-200 group-hover:decoration-[#C5A065] underline-offset-4">Read More</span>
                            </div>
                        </article>
                   </Reveal>
                ))}
             </div>
         </div>
      </section>

      {/* 4. Family of Brands - Compact Sidebar Style Layout */}
      <section className="py-20 max-w-[1440px] mx-auto px-6">
          <Reveal>
            <div className="mb-12 flex items-center gap-4">
                <span className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></span>
                <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Our Ecosystem</span>
                <span className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></span>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nemat Fragrances */}
              <Reveal delay={0.1} width="100%">
                <a href="https://nematperfumes.com/" target="_blank" rel="noopener noreferrer" className="group relative block rounded-xl overflow-hidden aspect-[3/1] md:aspect-[4/1] bg-[#F5F3EF]">
                    <img 
                        src="https://images.unsplash.com/photo-1595855709940-fa1d4f243029?auto=format&fit=crop&q=80&w=1200" 
                        alt="Nemat Fragrances" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-row items-center justify-between p-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-serif text-white mb-1">Nemat Fragrances</h3>
                            <p className="text-white/70 text-xs font-light">Perfume oils & Attars</p>
                        </div>
                        <span className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                            <span className="material-symbols-outlined text-lg">arrow_outward</span>
                        </span>
                    </div>
                </a>
              </Reveal>

              {/* Nemat International */}
              <Reveal delay={0.2} width="100%">
                <div className="group relative block rounded-xl overflow-hidden aspect-[3/1] md:aspect-[4/1] bg-[#1D1D1F]">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 flex flex-row items-center justify-between p-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-serif text-white mb-1">Nemat International</h3>
                            <p className="text-white/70 text-xs font-light">Industrial Supply & Import</p>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-[#C5A065] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">apartment</span>
                        </span>
                    </div>
                </div>
              </Reveal>
          </div>
      </section>

      {/* 5. Social Media Footprint - Tighter Grid */}
      <section className="bg-white dark:bg-background-dark pb-24">
          <div className="max-w-[1440px] mx-auto px-6">
              <Reveal>
                <div className="flex items-center justify-between mb-8 border-t border-gray-100 dark:border-gray-800 pt-12">
                    <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#C5A065]">public</span> Social Footprint
                    </h2>
                    <a href="#" className="text-xs font-bold text-gray-400 hover:text-[#C5A065]">@BestBottles</a>
                </div>
              </Reveal>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {INSTAGRAM_FEED.map((img, i) => (
                      <Reveal key={i} delay={i * 0.05} effect="scale">
                        <a href="#" className="group relative block aspect-square overflow-hidden bg-gray-100 rounded-lg">
                            <img 
                                src={img} 
                                alt="Instagram Post" 
                                className="w-full h-full object-contain p-2 bg-gray-50 dark:bg-black/20 transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-lg">open_in_new</span>
                            </div>
                        </a>
                      </Reveal>
                  ))}
              </div>
          </div>
      </section>

    </div>
  );
};