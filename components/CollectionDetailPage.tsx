import React, { useState, useMemo } from "react";
import { PRODUCTS } from "../constants";
import { Product } from "../types";

interface CollectionDetailPageProps {
  onBack: () => void;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ onBack, onProductClick, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Extract categories for filter
  const categories = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))], []);
  
  // Filter products
  const filteredProducts = PRODUCTS.filter(product => {
     return selectedCategory === "All" || product.category === selectedCategory;
  });

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart?.(product, 1);
  };

  return (
    <div className="w-full bg-white dark:bg-background-dark min-h-screen font-sans">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-6 py-6 text-xs text-gray-500 flex items-center gap-2">
        <button onClick={onBack} className="hover:text-primary transition-colors">Home</button>
        <span className="text-gray-300">›</span>
        <button onClick={onBack} className="hover:text-primary transition-colors">Collections</button>
        <span className="text-gray-300">›</span>
        <span className="text-text-light dark:text-text-dark font-medium">All Products</span>
      </div>

      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-text-light dark:text-text-dark mb-4">
          Classic & Elegant Roll On Bottles
        </h1>
        <p className="text-[#637588] dark:text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
          Curated premium glass and sustainable packaging solutions designed for the world's finest fragrances. 
          Each piece is crafted with precision to elevate your brand identity.
        </p>
        <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
            <span>Showing {filteredProducts.length} results</span>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
        </div>
      </div>

      {/* Filters & Toolbar */}
      <div className="sticky top-[72px] z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left: Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
             <div className="relative group">
                 <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-xs font-bold uppercase tracking-wide text-text-light dark:text-text-dark hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                 >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select>
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-sm text-gray-400">expand_more</span>
             </div>
             
             {/* Additional mock filters for visuals */}
             {['Capacity', 'Neck Finish'].map(filter => (
                 <button key={filter} className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-text-light dark:hover:text-white hover:border-gray-300 transition-colors flex items-center gap-2">
                    {filter}
                    <span className="material-symbols-outlined text-sm text-gray-400">expand_more</span>
                 </button>
             ))}
             
             <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-xs font-bold uppercase tracking-wide flex items-center gap-2 ml-2">
                 In Stock Only
             </button>
          </div>

          {/* Right: Sort */}
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Sort by:</span>
             <button className="text-xs font-bold text-text-light dark:text-text-dark flex items-center gap-1 hover:text-primary transition-colors">
                 Featured
                 <span className="material-symbols-outlined text-sm">sort</span>
             </button>
          </div>

        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
         {filteredProducts.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                    <div 
                        key={product.sku} 
                        className="group cursor-pointer flex flex-col h-full"
                        onClick={() => onProductClick?.(product)}
                    >
                        {/* Image Card */}
                        <div className="relative aspect-[4/5] bg-[#F5F5F7] dark:bg-[#1E1E1E] rounded-xl overflow-hidden mb-5 border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                <img 
                                    src={product.imageUrl} 
                                    alt={product.name}
                                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {product.bulkPrice && (
                                    <span className="bg-white/90 dark:bg-black/60 backdrop-blur text-text-light dark:text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-gray-100 dark:border-gray-700 shadow-sm">
                                        Bulk Savings
                                    </span>
                                )}
                            </div>

                            {/* Floating Quick View (Icon) */}
                            <button
                                onClick={(e) => handleQuickView(e, product)}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white translate-y-2 group-hover:translate-y-0"
                                title="Quick View"
                            >
                                <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>

                            {/* Quick Action Overlay (Add to Cart) */}
                            <div className="absolute bottom-4 left-0 w-full px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-[#C5A059] dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{product.category}</span>
                                <span className="text-sm font-bold font-mono text-text-light dark:text-text-dark">{product.price}</span>
                            </div>
                            
                            <h3 className="text-base font-serif font-medium text-text-light dark:text-text-dark mb-2 leading-tight group-hover:text-primary transition-colors">
                                {product.name}
                            </h3>
                            
                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                                <span>{product.capacity}</span>
                                <span>{product.color}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
         ) : (
             <div className="py-20 text-center">
                 <p className="text-gray-500">No products found in this category.</p>
                 <button 
                    onClick={() => setSelectedCategory("All")}
                    className="text-primary font-bold mt-4 hover:underline"
                 >
                    View All Products
                 </button>
             </div>
         )}

         {/* Pagination / Load More */}
         <div className="mt-20 flex flex-col items-center">
             <div className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-widest">
                Showing {filteredProducts.length} of {PRODUCTS.length} products
             </div>
             
             {/* Progress Bar */}
             <div className="w-48 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                 <div className="w-full h-full bg-[#1D1D1F] dark:bg-white rounded-full"></div>
             </div>

             <button className="px-10 py-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold uppercase tracking-widest text-text-light dark:text-text-dark hover:shadow-lg hover:border-primary transition-all active:scale-95">
                 Load More
             </button>
         </div>
      </div>
      
      {/* Quick View Modal */}
      {quickViewProduct && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeQuickView}></div>
            <div className="relative bg-white dark:bg-[#1e2732] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-fade-up">
               <button onClick={closeQuickView} className="absolute top-4 right-4 z-10 p-2 bg-white/50 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black transition-colors text-text-light dark:text-text-dark">
                  <span className="material-symbols-outlined">close</span>
               </button>
               
               {/* Image Side */}
               <div className="w-full md:w-1/2 bg-gray-50 dark:bg-black/20 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                  <img src={quickViewProduct.imageUrl} alt={quickViewProduct.name} className="max-h-[300px] md:max-h-[400px] object-contain mix-blend-multiply dark:mix-blend-normal" />
               </div>

               {/* Details Side */}
               <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">{quickViewProduct.category}</span>
                  <h2 className="text-3xl font-serif font-bold text-[#111418] dark:text-white mb-4 leading-tight">{quickViewProduct.name}</h2>
                  <div className="flex items-center gap-4 mb-6">
                      <span className="text-2xl font-medium text-[#111418] dark:text-white">{quickViewProduct.price}</span>
                      {quickViewProduct.bulkPrice && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">
                              {quickViewProduct.bulkPrice}
                          </span>
                      )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
                      {quickViewProduct.description}
                  </p>

                  <div className="space-y-4 mb-8 text-sm bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-500 font-medium">Capacity</span>
                          <span className="font-semibold text-[#111418] dark:text-white">{quickViewProduct.capacity}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-500 font-medium">Color</span>
                          <span className="font-semibold text-[#111418] dark:text-white">{quickViewProduct.color}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-500 font-medium">SKU</span>
                          <span className="font-mono text-xs font-semibold text-[#111418] dark:text-white">{quickViewProduct.sku}</span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                      <button 
                        onClick={(e) => {
                            handleAddToCart(e, quickViewProduct);
                            closeQuickView();
                        }}
                        className="w-full bg-[#111418] dark:bg-white text-white dark:text-[#111418] py-3.5 rounded-lg font-bold uppercase text-xs tracking-wider hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
                      >
                          <span className="material-symbols-outlined text-sm">shopping_cart</span>
                          Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                            closeQuickView();
                            onProductClick?.(quickViewProduct);
                        }}
                        className="w-full py-3.5 border border-gray-200 dark:border-gray-700 rounded-lg font-bold uppercase text-xs tracking-wider text-[#111418] dark:text-white hover:border-primary hover:text-primary transition-colors"
                      >
                          View Full Details
                      </button>
                  </div>
               </div>
            </div>
         </div>
       )}

      {/* Mini Footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 mt-20">
          <div className="flex items-center gap-2 opacity-50">
             <span className="material-symbols-outlined text-xl">change_history</span>
             <span className="font-serif font-bold">Best Bottles</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">© 2024 Best Bottles Inc.</span>
      </div>
    </div>
  );
};