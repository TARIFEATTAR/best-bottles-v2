import React, { useState, useMemo } from "react";
import { PRODUCTS } from "../constants";
import { Product } from "../types";

interface ProductSectionProps {
  onProductClick?: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ onProductClick, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedCapacity, setSelectedCapacity] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Extract unique values for filters
  const categories = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))], []);
  const colors = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map(p => p.color)))], []);
  const capacities = useMemo(() => ["All", ...Array.from(new Set(PRODUCTS.map(p => p.capacity)))], []);

  // Filter products
  const filteredProducts = PRODUCTS.filter(product => {
    const matchCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchColor = selectedColor === "All" || product.color === selectedColor;
    const matchCapacity = selectedCapacity === "All" || product.capacity === selectedCapacity;
    return matchCategory && matchColor && matchCapacity;
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
    console.log("Adding to cart:", product.name);
    onAddToCart?.(product, 1);
  };

  return (
    <section id="shop" className="w-full bg-[#f6f7f8] dark:bg-[#111921] py-16 relative">
      <div className="layout-container mx-auto px-6 md:px-10 max-w-[1440px]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#111418] dark:text-white">
              Shop Collections
            </h2>
            <p className="text-[#637588] dark:text-gray-400 mt-2 max-w-2xl">
              Explore our selection of premium glass vials, bottles, and decorative
              containers.
            </p>
          </div>
          <button 
            onClick={onProductClick}
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            View Full Catalog
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-10 p-4 bg-white dark:bg-[#1e2732] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</label>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Color</label>
                <select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
                >
                    {colors.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Capacity</label>
                <select 
                    value={selectedCapacity}
                    onChange={(e) => setSelectedCapacity(e.target.value)}
                    className="bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
                >
                    {capacities.map(cap => <option key={cap} value={cap}>{cap}</option>)}
                </select>
            </div>
            {/* Reset Filter Button */}
            {(selectedCategory !== "All" || selectedColor !== "All" || selectedCapacity !== "All") && (
                <div className="flex flex-col justify-end">
                    <button 
                        onClick={() => {
                            setSelectedCategory("All");
                            setSelectedColor("All");
                            setSelectedCapacity("All");
                        }}
                        className="text-sm text-red-500 hover:text-red-600 px-3 py-2 font-medium"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
                <div
                key={product.sku}
                onClick={onProductClick}
                className="group bg-white dark:bg-[#1e2732] rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                >
                <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-50 dark:border-gray-700">
                    <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.bulkPrice && (
                        <div className="absolute top-2 left-2 bg-[#C5A059] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            BULK
                        </div>
                    )}
                    
                    {/* Quick View Button */}
                    <button
                      onClick={(e) => handleQuickView(e, product)}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 text-[#111418] dark:text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-primary hover:text-white border border-gray-200 dark:border-gray-700"
                    >
                      Quick View
                    </button>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <div className="mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#637588] dark:text-gray-500 font-semibold">{product.category}</span>
                        <h3 className="text-[#111418] dark:text-white font-bold text-sm leading-tight mt-1 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                        </h3>
                    </div>
                    <div className="text-xs text-[#637588] dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                        {product.description}
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-[#111418] dark:text-white">{product.price}</span>
                            <span className="text-xs text-[#637588] dark:text-gray-400">{product.capacity}</span>
                        </div>
                        {product.bulkPrice && (
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-3">
                                {product.bulkPrice}
                            </p>
                        )}
                        <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-[#111418] dark:bg-white text-white dark:text-[#111418] py-2 rounded text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white dark:bg-[#1e2732] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">filter_list_off</span>
                <p className="text-gray-500">No products match your selected filters.</p>
                <button 
                     onClick={() => {
                        setSelectedCategory("All");
                        setSelectedColor("All");
                        setSelectedCapacity("All");
                    }}
                    className="mt-4 text-primary font-medium hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        )}
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
               <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar">
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
                        className="w-full bg-[#111418] dark:bg-white text-white dark:text-[#111418] py-3.5 rounded-lg font-bold uppercase text-xs tracking-wider hover:opacity-90 transition-opacity shadow-lg"
                      >
                          Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                            closeQuickView();
                            onProductClick?.();
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
    </section>
  );
};