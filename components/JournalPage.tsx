import React from "react";

const ARTICLES = [
  {
    category: "Design",
    date: "Oct 12, 2023",
    title: "The Renaissance of Metal in Modern Packaging",
    excerpt: "Why premium brands are returning to aluminum and brass for weight, texture, and recyclability.",
    image: "https://images.unsplash.com/photo-1550524514-9c7b69a37a98?auto=format&fit=crop&q=80&w=1600",
    featured: true
  },
  {
    category: "Sustainability",
    date: "Sep 28, 2023",
    title: "Beyond Recycling: The PCR Revolution",
    excerpt: "Understanding Post-Consumer Recycled glass and its impact on the luxury supply chain.",
    image: "https://images.unsplash.com/photo-1532153354457-5fbe1a3bb0b4?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    category: "Trends",
    date: "Sep 15, 2023",
    title: "Minimalism vs. Maximalism: 2024 Forecast",
    excerpt: "The industry is splitting into two distinct aesthetic directions. Which one fits your brand?",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    category: "Innovation",
    date: "Aug 30, 2023",
    title: "The Science of Atomization",
    excerpt: "How spray pattern and droplet size affect the olfactory experience of fine fragrance.",
    image: "https://images.unsplash.com/photo-1595855709940-fa1d4f243029?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    category: "Sourcing",
    date: "Aug 12, 2023",
    title: "Navigating Global Supply Chains",
    excerpt: "Strategies for resilience in an era of logistical uncertainty.",
    image: "https://images.unsplash.com/photo-1566576912322-7e830d7126c7?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
];

export const JournalPage: React.FC = () => {
  const featuredArticle = ARTICLES.find(a => a.featured);
  const regularArticles = ARTICLES.filter(a => !a.featured);

  return (
    <div className="w-full bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <div className="pt-20 pb-12 px-6 max-w-7xl mx-auto text-center border-b border-gray-200 dark:border-gray-800">
        <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase mb-4 block">The Edit</span>
        <h1 className="text-5xl md:text-7xl font-serif font-medium text-text-light dark:text-text-dark mb-6">
          The Bottle Journal
        </h1>
        <p className="text-text-gray max-w-2xl mx-auto text-lg font-light">
          Insights on packaging design, sustainability, and the art of fragrance presentation.
        </p>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] group cursor-pointer">
            <img 
              src={featuredArticle.image} 
              alt={featuredArticle.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
              <div className="flex items-center gap-4 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded">{featuredArticle.category}</span>
                <span>{featuredArticle.date}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                {featuredArticle.title}
              </h2>
              <p className="text-white/80 text-lg mb-8 font-light max-w-xl">
                {featuredArticle.excerpt}
              </p>
              <span className="text-white border-b border-white/40 pb-1 text-sm font-bold uppercase tracking-widest group-hover:border-white transition-colors">
                Read Story
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Categories Bar */}
      <div className="sticky top-[72px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
         <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-8 py-4 min-w-max text-sm font-medium text-text-gray">
               <button className="text-primary font-bold">Latest</button>
               <button className="hover:text-primary transition-colors">Design</button>
               <button className="hover:text-primary transition-colors">Sustainability</button>
               <button className="hover:text-primary transition-colors">Innovation</button>
               <button className="hover:text-primary transition-colors">Interviews</button>
            </div>
         </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-16">
            {regularArticles.map((article, idx) => (
               <article key={idx} className="group cursor-pointer flex flex-col h-full">
                  <div className="aspect-[3/2] overflow-hidden rounded-xl mb-6 relative">
                     <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-text-gray mb-3">
                     <span className="text-gold">{article.category}</span>
                     <span>•</span>
                     <span>{article.date}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-medium text-text-light dark:text-text-dark mb-3 group-hover:text-primary transition-colors leading-tight">
                     {article.title}
                  </h3>
                  <p className="text-text-gray font-light mb-4 line-clamp-3">
                     {article.excerpt}
                  </p>
                  <div className="mt-auto pt-4">
                     <span className="inline-flex items-center gap-2 text-sm font-bold text-text-light dark:text-text-dark group-hover:translate-x-2 transition-transform">
                        Read Article <span className="material-symbols-outlined text-base">arrow_forward</span>
                     </span>
                  </div>
               </article>
            ))}
         </div>
      </div>

      {/* Newsletter */}
      <div className="bg-[#1D1D1F] text-white py-24 px-6">
         <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-serif mb-4">Subscribe to the Journal</h3>
            <p className="text-white/60 mb-8 font-light">Get the latest insights on packaging trends delivered to your inbox weekly.</p>
            <div className="flex flex-col sm:flex-row gap-4">
               <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:ring-1 focus:ring-gold outline-none"
               />
               <button className="bg-gold hover:bg-gold-light text-black font-bold px-8 py-3 rounded-lg transition-colors">
                  Subscribe
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};