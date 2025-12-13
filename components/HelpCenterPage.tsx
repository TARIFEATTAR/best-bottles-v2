import React, { useState } from "react";
import { FAQ_DATA } from "../constants";

interface HelpCenterPageProps {
  onBack?: () => void;
  onContactClick?: () => void;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onBack, onContactClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  // Default all categories to open initially for better discoverability
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(FAQ_DATA.map(c => c.category)));

  // Search Filtering
  const filteredData = FAQ_DATA.map(category => {
    const matchingItems = category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, items: matchingItems };
  }).filter(category => category.items.length > 0);

  const toggleItem = (question: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category: string) => {
      const isSame = category === activeCategory;
      setActiveCategory(isSame ? null : category);
      
      if (!isSame) {
          // Ensure the selected category is expanded
          const newExpanded = new Set(expandedCategories);
          newExpanded.add(category);
          setExpandedCategories(newExpanded);

          // Smooth scroll to the category
          setTimeout(() => {
              const element = document.getElementById(`faq-cat-${category.replace(/\s+/g, '')}`);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }, 100);
      }
  };

  return (
    <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen font-sans pb-24">
      
      {/* Hero / Search Section */}
      <div className="bg-[#1D1D1F] text-white pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1D1D1F]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="text-[#C5A059] font-bold tracking-[0.2em] uppercase text-xs mb-4 block animate-fade-up">Help Center</span>
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-8 animate-fade-up delay-100">
                How can we help?
            </h1>
            
            <div className="max-w-2xl mx-auto relative animate-fade-up delay-200">
                <input 
                    type="text" 
                    placeholder="Search for answers (e.g. shipping, returns, breakage)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-white/50 focus:bg-white focus:text-[#1D1D1F] focus:placeholder:text-gray-400 outline-none transition-all shadow-xl"
                />
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">search</span>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
        
        {/* Quick Categories Navigation (Desktop) */}
        {!searchQuery && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {FAQ_DATA.map((cat, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleCategoryClick(cat.category)}
                        className={`bg-white dark:bg-[#2A2E35] p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-transparent ${activeCategory === cat.category ? 'border-[#C5A065] ring-1 ring-[#C5A065]' : 'hover:border-gray-200 dark:hover:border-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-[#C5A065] text-2xl mb-3 block">
                            {idx === 0 ? 'payments' : idx === 1 ? 'local_shipping' : idx === 2 ? 'change_circle' : 'science'}
                        </span>
                        <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-white">{cat.category}</h3>
                        <span className="text-xs text-gray-400 mt-1 block">{cat.items.length} articles</span>
                    </button>
                ))}
            </div>
        )}

        {/* FAQ List */}
        <div className="space-y-6">
            {filteredData.length > 0 ? (
                filteredData.map((category) => {
                    // If searching, force open categories that have matches
                    const isCategoryOpen = expandedCategories.has(category.category) || searchQuery.length > 0;
                    
                    return (
                        <div 
                            key={category.category} 
                            id={`faq-cat-${category.category.replace(/\s+/g, '')}`}
                            className="bg-white dark:bg-[#1A1D21] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            {/* Category Header (Collapsible Trigger) */}
                            <button 
                                onClick={() => toggleCategory(category.category)}
                                className="w-full px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
                            >
                                <h2 className="text-xl font-serif font-bold text-[#1D1D1F] dark:text-white flex items-center gap-2">
                                    {category.category}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-white dark:bg-black/20 px-2 py-1 rounded">
                                        {category.items.length} Qs
                                    </span>
                                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-[#C5A065]' : ''}`}>
                                        expand_more
                                    </span>
                                </div>
                            </button>

                            {/* Category Content (Collapsible Body) */}
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCategoryOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {category.items.map((item, idx) => {
                                        const isOpen = expandedItems.has(item.question) || searchQuery.length > 0; // Auto expand on search
                                        return (
                                            <div key={idx} className="group bg-white dark:bg-[#1A1D21]">
                                                <button 
                                                    onClick={() => toggleItem(item.question)}
                                                    className="w-full text-left px-8 py-5 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
                                                >
                                                    <span className={`font-bold text-sm pr-8 leading-relaxed transition-colors ${isOpen ? 'text-[#C5A065]' : 'text-[#1D1D1F] dark:text-gray-200'}`}>
                                                        {item.question}
                                                    </span>
                                                    <span className={`material-symbols-outlined text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#C5A065]' : ''}`}>
                                                        add
                                                    </span>
                                                </button>
                                                <div 
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    <div className="px-8 pb-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                                                        {item.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or browse the categories.</p>
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="mt-6 text-[#C5A065] font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>

        {/* Still need help? */}
        <div className="mt-16 text-center bg-[#EBE7DD] dark:bg-[#2A2E35] rounded-2xl p-10 md:p-16 border border-[#D8C6B0] dark:border-gray-700">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-4">
                Still need support?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
                Our bottle specialists are available Monday through Friday, 9am - 5pm EST to answer your technical questions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                    onClick={onContactClick}
                    className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                >
                    Contact Support
                </button>
                <button className="bg-transparent border border-[#1D1D1F] dark:border-white text-[#1D1D1F] dark:text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#1D1D1F] hover:text-white dark:hover:bg-white dark:hover:text-[#1D1D1F] transition-colors">
                    Email Sales
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};