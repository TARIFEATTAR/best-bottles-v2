import React, { useState, useEffect } from "react";
import { Reveal } from "./Reveal";

interface ConsultationPageProps {
  onBack?: () => void;
}

// --- Builder Data ---
const CATEGORIES = [
    { id: 'perfume', label: 'Perfume / Fragrance', icon: 'scent' },
    { id: 'oil', label: 'Essential Oils', icon: 'spa' },
    { id: 'serum', label: 'Serum / Skincare', icon: 'water_drop' }
];

const VESSELS = [
    { id: 'amber-vial', name: 'Amber Dram Vial', capacity: '4ml', price: 0.25, img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif' },
    { id: 'blue-vial', name: 'Cobalt Blue Vial', capacity: '4ml', price: 0.30, img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVBlu1DrmBlkDropper.gif' },
    { id: 'green-vial', name: 'Emerald Green Vial', capacity: '4ml', price: 0.30, img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVGr1DrmBlkDropper.gif' },
    { id: 'clear-boston', name: 'Flint Boston Round', capacity: '15ml', price: 0.55, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A' },
    { id: 'frosted-square', name: 'Frosted Square', capacity: '30ml', price: 1.20, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600' },
];

const FITMENTS = [
    { id: 'none', name: 'No Fitment', description: 'Open neck pouring', price: 0.00, icon: 'block' },
    { id: 'reducer', name: 'Orifice Reducer', description: 'Controlled drip for oils', price: 0.05, icon: 'remove_circle_outline' },
    { id: 'roller-metal', name: 'Stainless Roller', description: 'Premium cooling application', price: 0.15, icon: 'radio_button_checked' },
    { id: 'roller-plastic', name: 'Plastic Roller', description: 'Standard smooth application', price: 0.08, icon: 'circle' },
    { id: 'spray', name: 'Mist Atomizer', description: 'Fine mist for fragrance', price: 0.25, icon: 'spray' },
    { id: 'dropper', name: 'Glass Pipette', description: 'Precision dosing', price: 0.35, icon: 'water_drop' },
];

const CAPS = [
    { id: 'black-phenolic', name: 'Matte Black', material: 'Plastic', price: 0.10, color: '#222' },
    { id: 'gold-alum', name: 'Polished Gold', material: 'Aluminum', price: 0.25, color: '#D4AF37' },
    { id: 'silver-alum', name: 'Brushed Silver', material: 'Aluminum', price: 0.25, color: '#C0C0C0' },
    { id: 'white-smooth', name: 'Gloss White', material: 'Plastic', price: 0.10, color: '#F0F0F0' },
    { id: 'wood-ash', name: 'Ash Wood', material: 'Wood', price: 0.45, color: '#A08060' },
];

export const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack }) => {
  // Mode: 'brief' (intake) -> 'studio' (builder) -> 'summary' (checkout)
  const [mode, setMode] = useState<'brief' | 'studio' | 'summary'>('brief');
  const [context, setContext] = useState<string | null>(null);
  
  // Builder State
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0); // 0: Vessel, 1: Fitment, 2: Closure
  const [selections, setSelections] = useState<{
      vessel: typeof VESSELS[0] | null,
      fitment: typeof FITMENTS[0] | null,
      closure: typeof CAPS[0] | null
  }>({
      vessel: null,
      fitment: null,
      closure: null
  });

  // Helper to advance steps
  const handleSelect = (type: 'vessel' | 'fitment' | 'closure', item: any) => {
      setSelections(prev => ({ ...prev, [type]: item }));
      // Auto-advance logic (optional, creates flow)
      if (type === 'vessel') setTimeout(() => setActiveStep(1), 400);
      if (type === 'fitment') setTimeout(() => setActiveStep(2), 400);
  };

  const calculateTotal = () => {
      const base = selections.vessel?.price || 0;
      const fit = selections.fitment?.price || 0;
      const cap = selections.closure?.price || 0;
      return (base + fit + cap).toFixed(2);
  };

  // --- Render: Briefing (Intake) ---
  if (mode === 'brief') {
      return (
        <div className="min-h-screen bg-white dark:bg-background-dark font-sans flex flex-col items-center justify-center p-6 animate-fade-in">
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Exit Studio
             </button>

             <div className="max-w-2xl w-full text-center">
                 <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Project Builder</span>
                 <h1 className="text-4xl md:text-5xl font-serif text-[#1D1D1F] dark:text-white mb-12">What are you creating today?</h1>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {CATEGORIES.map(cat => (
                         <button 
                            key={cat.id}
                            onClick={() => { setContext(cat.id); setMode('studio'); }}
                            className="group relative h-48 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:border-gold dark:hover:border-gold transition-all duration-300 flex flex-col items-center justify-center gap-4 overflow-hidden"
                         >
                             <div className="w-16 h-16 rounded-full bg-white dark:bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-gold group-hover:scale-110 transition-all duration-300 shadow-sm">
                                 <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                             </div>
                             <span className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">{cat.label}</span>
                             <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </button>
                     ))}
                 </div>
                 
                 <button onClick={() => setMode('studio')} className="mt-12 text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-current transition-colors">
                     Skip to Catalogue
                 </button>
             </div>
        </div>
      );
  }

  // --- Render: Studio (Builder) ---
  if (mode === 'studio') {
      return (
        <div className="h-screen bg-[#F5F5F7] dark:bg-background-dark flex flex-col md:flex-row overflow-hidden animate-fade-in">
            
            {/* Left: The Canvas (Preview) */}
            <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-white dark:bg-[#151515] relative flex flex-col justify-center items-center p-8 md:p-20 shadow-xl z-10">
                <button onClick={() => setMode('brief')} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Restart
                </button>

                {/* Live Kit Preview */}
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                    {/* Dynamic Image Layering (Concept) */}
                    <div className="relative w-full h-full flex items-center justify-center transition-all duration-700">
                         {/* Base Bottle */}
                         {selections.vessel ? (
                            <img 
                                src={selections.vessel.img} 
                                className="h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal z-10 drop-shadow-2xl animate-fade-up" 
                                alt="Selected Vessel" 
                            />
                         ) : (
                             <div className="text-center opacity-30">
                                 <span className="material-symbols-outlined text-6xl mb-2">science</span>
                                 <p className="text-xs font-bold uppercase tracking-widest">Select a Vessel to begin</p>
                             </div>
                         )}
                         
                         {/* Cap Overlay (Simplified visual logic for demo) */}
                         {selections.closure && selections.vessel && (
                             <div className="absolute top-[10%] right-[10%] bg-white/90 dark:bg-black/60 backdrop-blur-md p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg flex items-center gap-3 animate-slide-up">
                                 <div className="w-8 h-8 rounded-full border border-gray-200" style={{ background: selections.closure.color }}></div>
                                 <div className="text-left">
                                     <span className="block text-[10px] uppercase font-bold text-gray-500">Paired With</span>
                                     <span className="block text-xs font-bold text-[#1D1D1F] dark:text-white">{selections.closure.name}</span>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* Kit Summary Overlay (Bottom Left) */}
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 flex flex-col gap-2">
                     <div className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Current Kit</div>
                     <div className="flex flex-col gap-1 text-sm text-[#1D1D1F] dark:text-white">
                         <span className={selections.vessel ? "" : "text-gray-400 opacity-50"}>
                            1. Vessel: {selections.vessel?.name || "Pending..."}
                         </span>
                         <span className={selections.fitment ? "" : "text-gray-400 opacity-50"}>
                            2. Fitment: {selections.fitment?.name || "Pending..."}
                         </span>
                         <span className={selections.closure ? "" : "text-gray-400 opacity-50"}>
                            3. Closure: {selections.closure?.name || "Pending..."}
                         </span>
                     </div>
                </div>

                {/* Price Ticker */}
                <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-right">
                    <span className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Unit Price</span>
                    <span className="block text-3xl font-serif text-[#1D1D1F] dark:text-white">${calculateTotal()}</span>
                </div>
            </div>

            {/* Right: The Palette (Controls) */}
            <div className="w-full md:w-1/2 h-[60vh] md:h-full overflow-y-auto bg-[#F9F8F6] dark:bg-background-dark border-l border-gray-200 dark:border-gray-800 flex flex-col">
                
                {/* Steps Navigation */}
                <div className="sticky top-0 z-30 bg-[#F9F8F6]/95 dark:bg-background-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 md:px-12 py-6 flex justify-between items-center">
                     <div className="flex gap-6 md:gap-8">
                         {['Vessel', 'Fitment', 'Closure'].map((step, idx) => (
                             <button
                                key={step}
                                onClick={() => setActiveStep(idx as any)}
                                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-all relative ${
                                    activeStep === idx 
                                    ? 'text-[#1D1D1F] dark:text-white' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                             >
                                 {idx + 1}. {step}
                                 {activeStep === idx && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></span>}
                             </button>
                         ))}
                     </div>
                     
                     <button 
                        onClick={() => setMode('summary')}
                        disabled={!selections.vessel || !selections.fitment || !selections.closure}
                        className={`hidden md:flex bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity ${
                            (!selections.vessel || !selections.fitment || !selections.closure) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                     >
                         Complete
                     </button>
                </div>

                {/* Options Grid */}
                <div className="p-6 md:p-12 pb-32">
                    
                    {/* Step 1: Vessels */}
                    {activeStep === 0 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-serif text-[#1D1D1F] dark:text-white mb-6">Choose your Foundation</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {VESSELS.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleSelect('vessel', item)}
                                        className={`group relative aspect-[4/5] bg-white dark:bg-white/5 rounded-xl border transition-all duration-300 p-4 flex flex-col items-center justify-between hover:shadow-lg ${
                                            selections.vessel?.id === item.id 
                                            ? 'border-gold ring-1 ring-gold shadow-md' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-400">{item.capacity}</div>
                                        <img 
                                            src={item.img} 
                                            className="h-[60%] object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform" 
                                            alt={item.name} 
                                        />
                                        <div className="w-full text-center">
                                            <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white mb-1">{item.name}</span>
                                            <span className="block text-xs text-gray-500">${item.price.toFixed(2)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Fitments */}
                    {activeStep === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-serif text-[#1D1D1F] dark:text-white mb-6">Select Application Method</h2>
                            <div className="space-y-3">
                                {FITMENTS.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleSelect('fitment', item)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            selections.fitment?.id === item.id 
                                            ? 'bg-white dark:bg-white/10 border-gold ring-1 ring-gold shadow-md' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selections.fitment?.id === item.id ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                <span className="material-symbols-outlined">{item.icon}</span>
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">{item.name}</span>
                                                <span className="block text-xs text-gray-400">{item.description}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                                            {item.price === 0 ? 'Included' : `+$${item.price.toFixed(2)}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Closures */}
                    {activeStep === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-serif text-[#1D1D1F] dark:text-white mb-6">Final Touch: Closures</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {CAPS.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleSelect('closure', item)}
                                        className={`group relative p-6 rounded-xl border transition-all text-center flex flex-col items-center gap-4 hover:shadow-md ${
                                            selections.closure?.id === item.id 
                                            ? 'bg-white dark:bg-white/10 border-gold ring-1 ring-gold' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div 
                                            className="w-16 h-16 rounded-full shadow-inner" 
                                            style={{ backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.1)' }}
                                        ></div>
                                        <div>
                                            <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">{item.name}</span>
                                            <span className="block text-xs text-gray-400 mt-1">{item.material}</span>
                                            <span className="block text-xs font-bold text-primary mt-2">
                                                {item.price === 0 ? 'Included' : `+$${item.price.toFixed(2)}`}
                                            </span>
                                        </div>
                                        {selections.closure?.id === item.id && (
                                            <div className="absolute top-3 right-3 text-gold">
                                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Mobile Floating Action Button */}
                <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-black/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 z-50">
                     <button 
                        onClick={() => {
                            if (activeStep < 2) setActiveStep((prev) => (prev + 1) as any);
                            else setMode('summary');
                        }}
                        disabled={activeStep === 2 && !selections.closure}
                        className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
                     >
                         {activeStep < 2 ? 'Next Step' : 'Finish Kit'}
                     </button>
                </div>

            </div>
        </div>
      );
  }

  // --- Render: Summary (Checkout) ---
  if (mode === 'summary') {
      return (
          <div className="min-h-screen bg-white dark:bg-background-dark font-sans flex items-center justify-center p-6 animate-fade-in">
              <div className="max-w-2xl w-full bg-[#F9F8F6] dark:bg-white/5 rounded-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
                  <button onClick={() => setMode('studio')} className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary">
                      Edit Kit
                  </button>

                  <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="material-symbols-outlined text-3xl">check</span>
                      </div>
                      <h2 className="text-3xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-2">Kit Configured</h2>
                      <p className="text-gray-500 text-sm">Your custom SKU has been generated.</p>
                  </div>

                  <div className="bg-white dark:bg-black/20 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-500">Vessel</span>
                          <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.vessel?.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-500">Mechanism</span>
                          <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.fitment?.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-500">Closure</span>
                          <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.closure?.name}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 mt-2">
                          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Total / Unit</span>
                          <span className="text-2xl font-serif font-bold text-[#1D1D1F] dark:text-white">${calculateTotal()}</span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3">
                      <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 shadow-lg">
                          Add Kit to Cart
                      </button>
                      <button 
                        onClick={() => setMode('brief')}
                        className="w-full py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white"
                      >
                          Start New Project
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};
