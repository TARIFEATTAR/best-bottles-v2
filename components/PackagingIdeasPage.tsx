
import React from "react";
import { ProductTransformation } from "./ProductTransformation";

interface PackagingIdeasPageProps {
  onBack?: () => void;
  onStartProject?: () => void;
}

export const PackagingIdeasPage: React.FC<PackagingIdeasPageProps> = ({ onBack, onStartProject }) => {
  return (
    <div className="w-full bg-white dark:bg-background-dark min-h-screen font-sans">
      {/* Navigation */}
      <div className="max-w-[1440px] mx-auto px-6 py-6 text-xs text-gray-500 flex items-center gap-2 sticky top-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md z-40 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-text-light dark:text-text-dark font-medium">Packaging Inspiration</span>
      </div>

      {/* Main Header */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-4 text-[#1e1e4b]">
          Product Packaging Ideas
        </h1>
        <p className="text-[#637588] dark:text-gray-400 uppercase tracking-widest text-xs md:text-sm font-bold">
          Glass Bottles for Eau De Parfum & Perfumes sprays Product Packaging
        </p>
      </div>

      {/* The New Interactive Demo Component */}
      <ProductTransformation />

      {/* CTA Footer for this page */}
      <div className="bg-[#1D1D1F] text-white py-20 text-center px-6 mt-12">
         <h2 className="text-3xl font-serif mb-6">Ready to bring these concepts to life?</h2>
         <button onClick={onStartProject} className="bg-[#C5A059] text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">
            Start Custom Project
         </button>
      </div>

    </div>
  );
};
