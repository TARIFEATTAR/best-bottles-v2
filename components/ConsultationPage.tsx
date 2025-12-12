import React, { useState } from "react";
import { PRODUCTS } from "../constants";

interface ConsultationPageProps {
  onBack?: () => void;
}

export const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'intake' | 'results' | 'review'>('intake');
  const [formData, setFormData] = useState({
    primaryCategory: "",
    subCategory: "",
    size: "",
    material: "",
    styles: [] as string[],
    weight: "",
    use: "",
    neck: ""
  });

  // Calculate completion for progress bar
  const requiredFields = ['primaryCategory', 'subCategory', 'size', 'material', 'weight', 'use'];
  const completedFields = requiredFields.filter(field => !!formData[field as keyof typeof formData]).length;
  const progress = (completedFields / requiredFields.length) * 100;

  // Review step state
  const [selectedCap, setSelectedCap] = useState("Standard Black");
  const [quantity, setQuantity] = useState(100);

  // Helper to find products for UI mapping
  const getProduct = (sku: string) => PRODUCTS.find(p => p.sku === sku);

  // Mapped Data
  const categoryOptions = [
    { sku: 'GBVAmb1DrmBlkDrpr', label: 'Perfume Vials', subtitle: '1.5ML - 4ML' },
    { sku: 'GB09BlackCapApp', label: 'Spray Bottle', subtitle: '9ML STANDARD' },
    { sku: 'GBTRDPClear', label: 'Glass Bottle', subtitle: 'TEARDROP STYLE' },
    { sku: 'GBMtlCylGl', label: 'Decorative', subtitle: 'LUXURY METAL' },
  ].map(opt => ({ ...opt, product: getProduct(opt.sku) }));

  const materialOptions = [
    { sku: 'GBVGr1DrmBlkDropper', label: 'Green Glass', desc: 'Natural & Earthy', colorClass: 'bg-green-900' },
    { sku: 'GBVAmb1DrmBlkDrpr', label: 'Amber Glass', desc: 'UV Protection', colorClass: 'bg-amber-900' },
    { sku: 'GBV1DrmBlkDropper', label: 'Clear Glass', desc: 'Pure & Visible', colorClass: 'bg-gray-800' },
    { sku: 'GBVBlu1DrmBlkDropper', label: 'Other Glass Types', desc: 'Specialty Finishes', colorClass: 'bg-blue-900' },
  ].map(opt => ({ ...opt, product: getProduct(opt.sku) }));

  // Mapped Data for Results Step
  const topPick = getProduct('GBVAmb1DrmBlkDrpr');
  const bestValue = getProduct('GBVialAmb1o5WhtCapSht');
  const ecoOption = getProduct('GBVGr1DrmBlkDropper');
  const premiumOption = getProduct('GBMtlCylGl'); // Added Premium Option

  // Cap Options for Review Step
  const CAP_OPTIONS = [
    { id: 'Standard Black', name: 'Standard Black Cap', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBahM7YX0L0v0oyIKIbTVMWX1F9kTdpmJ2ttfitYF9EEH0lioMyHlY1h0EuNVnSztRgflVQCVuH6-Tj1jYW4c_977vAjQiggE5UyhhwVsBit88GgciA7hKl4IXavVUcY0QtyWXPOU5zdcE6UHjMQe8pjJ-1FiSpjlwVk-iy9UV_ccgPD6vsAAIWviQfJ-n8BVUdVDmXMuOs6ZXMl_CntcK-cmNH_Kx_QW-PvZDlwQ7xy3al1jp06Q5-W1uTGjQS0Yx9Maw9dNFmx9I', price: 0 },
    { id: 'Glass Dropper', name: 'Glass Dropper', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAACEst3Z-MC9wsBtehYMhkOEOuEe8QftELCaEshY5i7AYLJj3_R909N-zLgp61oCdHkTLU0NLY7yUDInqoCVNHUkmufc4SpjdpmFsl-sAcETbpgWFXHDk33BnHt40t83yAeanv5mfoDtcRTLoPfSnxU2tu9Wqu3lNlbpX87Am4eJ36SYSp-8sgaW9j8Yiv4TOS7vvI_v5k33HRMe2KyEAmFjcziCtugObicyg-pfAuemDvlfQYCJV4u1HVKamlF9YgT4fMvGEQ1Qo', price: 0.25 },
    { id: 'Gold Cap', name: 'Gold Cap', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmPQVN1zfnL-pefbRaXs9ctvZS76b-DQUDFfWr3W7wW1EuQifDsxG8CDn1NGwXO2kEux9cNIgAB_nz4J7Hwsx9pFXmgmMVZ8X6565BTYHYusawwDiNxsWv8S2EHFoe4qtlufVppuTInVOktF60uOjaUvvAla01ITbTj9okzHJc4-aJXJVLhH3csu3sZwIUxGYsBKoV4vVWXXsvPhb7kO0rhzlYI1tMQPMjNkTrhl2G17v2yz__lsA9UbJFVjjH5jXe5U24GNArpkQ', price: 0.15 },
    { id: 'Wood Grain', name: 'Wood Grain', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDwv4czIreKFOH6Hkf_GaE5eXUqrYlRIuULDQt3PTGXpUBtQtMZGv1BHbkgLdtMr4b3Byo-u_uHouV2wMSMnTywM9B2h2xTzS0EWt8YrCylJHGCrc4P5QkPggb7dqErkf7VakoJ0RFfBK4Akzs_p1--BzLXPJWq097sNBthZaMPmfQa4h28sjAA6yHcS3wnJUX1iic20rXf3LEi8S840N6moqiYIpdDWBrHSlDvDkOrNiYnIdCXquI_M0K11i8XzlYgQKS4oKhsp4', price: 0.35 },
  ];

  const currentCap = CAP_OPTIONS.find(c => c.id === selectedCap) || CAP_OPTIONS[0];

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(style) 
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 'review') {
        setStep('results');
    } else if (step === 'results') {
        setStep('intake');
    } else {
        onBack?.();
    }
  };

  const startAnalysis = () => {
    setStep('results');
    window.scrollTo(0, 0);
  };

  const goToReview = () => {
    setStep('review');
    window.scrollTo(0, 0);
  };

  // Helper for conditional classes
  const getSelectionClass = (isSelected: boolean) => 
    isSelected 
      ? "bg-[#405D68] text-white shadow-xl ring-2 ring-[#405D68] ring-offset-2 transform scale-[1.02] border-transparent"
      : "bg-white dark:bg-surface-dark text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#405D68]/30";

  if (step === 'review') {
    return (
        <div className="min-h-screen bg-white dark:bg-background-dark font-sans flex flex-col pb-24">
            <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 px-6 py-4 shadow-sm">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackClick} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[#1D1D1F] dark:text-white">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-none">Configuration</h1>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Step 3 of 3</span>
                        </div>
                    </div>
                     <div className="hidden md:flex items-center gap-2">
                        {['Amber Glass', '1 Dram', 'Standard Neck'].map(chip => (
                            <span key={chip} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                {chip}
                            </span>
                        ))}
                     </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-3">
                     <span className="material-symbols-outlined text-[#405D68] dark:text-blue-300 mt-0.5">smart_toy</span>
                     <div>
                         <h2 className="text-sm font-bold text-[#405D68] dark:text-blue-200 mb-1">Top Match Found</h2>
                         <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            Based on your need for <strong>{formData.use || "essential oils"}</strong> and <strong>{formData.material || "Amber"}</strong> protection, we've configured this 1 Dram Vial with a compatible neck finish. Select a closure below to complete your setup.
                         </p>
                     </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Cap Options</h3>
                            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                                {CAP_OPTIONS.map((cap) => (
                                    <button 
                                        key={cap.id}
                                        onClick={() => setSelectedCap(cap.id)}
                                        className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-left w-full border ${
                                            selectedCap === cap.id
                                            ? "bg-gray-50 dark:bg-white/5 border-[#405D68] ring-1 ring-[#405D68]" 
                                            : "bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200"
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                            <div className="w-full h-full relative">
                                                <img 
                                                    src={cap.image} 
                                                    alt={cap.name} 
                                                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                        </div>
                                        <div className="hidden lg:block min-w-0">
                                            <span className={`block text-xs font-bold leading-tight truncate ${selectedCap === cap.id ? 'text-[#405D68]' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {cap.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {cap.price > 0 ? `+$${cap.price.toFixed(2)}` : 'Standard'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 order-1 lg:order-2">
                         <div className="sticky top-24 bg-gray-50 dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 aspect-[4/5] lg:aspect-square flex items-center justify-center p-8 lg:p-16 shadow-inner relative group overflow-hidden">
                             <div className="absolute top-4 left-4 z-10">
                                <span className="bg-[#405D68] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    Live Configuration
                                </span>
                             </div>
                             <div className="relative w-full h-full flex items-center justify-center">
                                 <img 
                                    src={topPick?.imageUrl || "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif"} 
                                    className="max-h-[80%] max-w-[80%] object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 z-10"
                                    alt="Bottle Base" 
                                 />
                                 <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/50 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                     Previewing: <span className="font-bold">{currentCap.name}</span>
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="lg:col-span-4 order-3 flex flex-col">
                         <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                             <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-2 leading-tight">
                                {topPick?.name || "Amber Vial"} Custom
                             </h1>
                             <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                 <span className="font-mono">{topPick?.sku}</span>
                                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                 <span className="text-green-600 font-bold">In Stock</span>
                             </div>
                             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                 Your configured unit features a {topPick?.capacity} {topPick?.color} glass body paired with a {currentCap.name}. Ideal for UV-sensitive formulations.
                             </p>
                         </div>

                         <div className="mb-8">
                             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">tune</span> Specs
                             </h3>
                             <div className="bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                                 <div className="flex justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                     <span className="text-gray-500">Capacity</span>
                                     <span className="font-medium text-gray-900 dark:text-white">{topPick?.capacity}</span>
                                 </div>
                                 <div className="flex justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                     <span className="text-gray-500">Material</span>
                                     <span className="font-medium text-gray-900 dark:text-white">{topPick?.color} Glass</span>
                                 </div>
                                 <div className="flex justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
                                     <span className="text-gray-500">Selected Cap</span>
                                     <span className="font-bold text-[#405D68] dark:text-blue-300">{currentCap.name}</span>
                                 </div>
                             </div>
                         </div>

                         <div className="mt-auto bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                             <div className="flex justify-between items-end mb-4">
                                 <div>
                                     <span className="text-xs text-gray-500 block mb-1">Total Estimated Cost</span>
                                     <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                         ${((parseFloat(topPick?.price?.replace('$','') || "0") + currentCap.price) * quantity).toFixed(2)}
                                     </span>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs text-gray-500">Unit Price</span>
                                     <span className="block font-medium">${(parseFloat(topPick?.price?.replace('$','') || "0") + currentCap.price).toFixed(2)}</span>
                                 </div>
                             </div>

                             <div className="flex items-center gap-4 mb-4">
                                 <div className="flex items-center bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-lg h-10 w-32">
                                     <button onClick={() => setQuantity(Math.max(50, quantity - 50))} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">-</button>
                                     <div className="flex-1 text-center text-sm font-bold">{quantity}</div>
                                     <button onClick={() => setQuantity(quantity + 50)} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">+</button>
                                 </div>
                                 <span className="text-xs text-gray-400">Min. 50 units</span>
                             </div>

                             <button className="w-full bg-[#405D68] hover:bg-[#344854] text-white py-4 rounded-lg text-sm font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                 <span className="material-symbols-outlined">shopping_cart</span>
                                 Add Configuration to Cart
                             </button>
                         </div>
                    </div>
                </div>
            </main>
             <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none z-50">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 p-2 flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#405D68] to-[#6B8E9B] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                         </div>
                         <div className="flex-1 px-2">
                            <input 
                                type="text" 
                                placeholder="Refine search (e.g., 'Show me frosted options')..." 
                                className="w-full bg-transparent border-none outline-none text-sm text-text-light dark:text-text-dark placeholder:text-gray-400"
                            />
                         </div>
                         <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl text-gray-600 dark:text-gray-300 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_upward</span>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (step === 'results') {
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-background-dark font-sans flex flex-col pb-32">
            
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 px-6 py-4 shadow-sm">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBackClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[#1D1D1F] dark:text-white">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-none">Analysis Results</h1>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">3 Matches Found</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('intake')} className="text-xs font-bold text-gray-500 hover:text-primary uppercase tracking-wide">Edit Criteria</button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1440px] mx-auto px-6 py-8 w-full">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Col: Main Winner */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Winner Card */}
                        <div onClick={goToReview} className="bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-xl shadow-[#405D68]/5 border border-[#405D68]/20 group cursor-pointer relative">
                             {/* Badge */}
                             <div className="absolute top-6 left-6 z-20 flex gap-2">
                                 <span className="bg-[#405D68] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">trophy</span> 98% Match
                                 </span>
                             </div>

                             <div className="flex flex-col md:flex-row h-full">
                                 {/* Image Section */}
                                 <div className="w-full md:w-5/12 bg-[#F9F9F9] dark:bg-black/20 p-8 flex items-center justify-center relative min-h-[300px]">
                                     <img 
                                        src={topPick?.imageUrl || "https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif"} 
                                        className="max-h-[80%] max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-transform duration-500 group-hover:scale-110"
                                        alt="Top Pick"
                                     />
                                 </div>
                                 
                                 {/* Info Section */}
                                 <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
                                     <div className="mb-6">
                                         <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-2 leading-tight">{topPick?.name}</h2>
                                         <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-mono font-bold text-[#1D1D1F] dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{topPick?.sku}</span>
                                            <span>•</span>
                                            <span className="text-[#405D68] font-bold">Best Seller</span>
                                         </div>
                                     </div>

                                     <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-6">
                                         <span className="flex items-center gap-2 text-xs font-bold text-[#405D68] dark:text-blue-300 uppercase tracking-wide mb-2">
                                            <span className="material-symbols-outlined text-sm">smart_toy</span> Why we chose this
                                         </span>
                                         <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                             Matches your request for <strong>{formData.material || 'Amber Glass'}</strong> to provide maximum UV protection. The <strong>{formData.size || '4ml'}</strong> capacity is industry standard for <strong>{formData.use || 'samples'}</strong>.
                                         </p>
                                     </div>

                                     <div className="grid grid-cols-2 gap-4 mb-8">
                                         <div>
                                             <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1">Availability</span>
                                             <span className="text-sm font-bold text-[#1D1D1F] dark:text-white flex items-center gap-1">
                                                 <span className="w-2 h-2 rounded-full bg-green-500"></span> In Stock
                                             </span>
                                         </div>
                                         <div>
                                             <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1">Price Tier</span>
                                             <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{topPick?.price} / unit</span>
                                         </div>
                                     </div>

                                     <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-sm font-bold tracking-wide uppercase shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                         Configure this Bottle
                                         <span className="material-symbols-outlined">arrow_forward</span>
                                     </button>
                                 </div>
                             </div>
                        </div>

                        {/* Extra Info / Tech Details Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Compatibility</h3>
                                <div className="flex gap-4">
                                     <div className="flex flex-col items-center gap-2">
                                         <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                             <span className="material-symbols-outlined">water_drop</span>
                                         </div>
                                         <span className="text-[10px] font-bold text-gray-500">Dropper</span>
                                     </div>
                                     <div className="flex flex-col items-center gap-2">
                                         <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                             <span className="material-symbols-outlined">spray</span>
                                         </div>
                                         <span className="text-[10px] font-bold text-gray-500">Mist</span>
                                     </div>
                                     <div className="flex flex-col items-center gap-2">
                                         <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                             <span className="material-symbols-outlined">expand_circle_down</span>
                                         </div>
                                         <span className="text-[10px] font-bold text-gray-500">Reducer</span>
                                     </div>
                                </div>
                            </div>
                            
                             <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Decorating Options</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm text-green-500">check</span> Silk Screening
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm text-green-500">check</span> Hot Stamping
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm text-green-500">check</span> Labeling
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Alternatives */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center justify-between pb-2">
                             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Other Strong Contenders</h3>
                             <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded">3 Found</span>
                        </div>

                        {/* Alt 1: Best Value */}
                        <div onClick={goToReview} className="bg-white dark:bg-surface-dark rounded-xl p-4 flex gap-4 border border-gray-200 dark:border-gray-800 hover:border-[#C5A065] transition-all cursor-pointer group shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                                <img src={bestValue?.imageUrl} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="Best Value" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A065] mb-1">Best Value</span>
                                <h4 className="font-serif font-bold text-[#1D1D1F] dark:text-white leading-tight mb-1">{bestValue?.name}</h4>
                                <span className="text-xs text-gray-500">{bestValue?.price} / unit</span>
                            </div>
                            <div className="flex items-center justify-center text-gray-300 group-hover:text-[#C5A065]">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </div>

                        {/* Alt 2: Eco Choice */}
                        <div onClick={goToReview} className="bg-white dark:bg-surface-dark rounded-xl p-4 flex gap-4 border border-gray-200 dark:border-gray-800 hover:border-green-600 transition-all cursor-pointer group shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                                <img src={ecoOption?.imageUrl} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="Eco Option" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Eco Choice</span>
                                <h4 className="font-serif font-bold text-[#1D1D1F] dark:text-white leading-tight mb-1">{ecoOption?.name}</h4>
                                <span className="text-xs text-gray-500">{ecoOption?.price} / unit</span>
                            </div>
                            <div className="flex items-center justify-center text-gray-300 group-hover:text-green-600">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </div>

                         {/* Alt 3: Premium */}
                         <div onClick={goToReview} className="bg-white dark:bg-surface-dark rounded-xl p-4 flex gap-4 border border-gray-200 dark:border-gray-800 hover:border-purple-600 transition-all cursor-pointer group shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                                <img src={premiumOption?.imageUrl} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="Premium Option" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1">Premium Upgrade</span>
                                <h4 className="font-serif font-bold text-[#1D1D1F] dark:text-white leading-tight mb-1">{premiumOption?.name}</h4>
                                <span className="text-xs text-gray-500">{premiumOption?.price} / unit</span>
                            </div>
                            <div className="flex items-center justify-center text-gray-300 group-hover:text-purple-600">
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </div>
                        </div>

                    </div>

                 </div>
            </main>

            {/* Chat Bar */}
            <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none z-50">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 p-2 flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#405D68] to-[#6B8E9B] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                         </div>
                         <div className="flex-1 px-2">
                            <input 
                                type="text" 
                                placeholder="Refine search (e.g., 'Show me frosted options')..." 
                                className="w-full bg-transparent border-none outline-none text-sm text-text-light dark:text-text-dark placeholder:text-gray-400"
                            />
                         </div>
                         <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl text-gray-600 dark:text-gray-300 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_upward</span>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // INTAKE STEP RENDER (Keep as is, but must be returned)
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-background-dark font-sans flex flex-col pb-32">
        {/* Compact Header */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 px-6 py-4 shadow-sm">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleBackClick} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#1D1D1F] dark:text-white">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-[#1D1D1F] dark:text-white leading-none">Bottle Specialist</h1>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Intake Form</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3">
                     <span className="text-xs font-bold text-[#405D68]">{Math.round(progress)}% Complete</span>
                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-[#405D68] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                </div>
            </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-8 w-full space-y-8">
            {/* 1. Primary Category */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">1. Select Category</h2>
                    {formData.primaryCategory && <span className="text-[#405D68] text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryOptions.map(item => {
                        const isSelected = formData.primaryCategory === item.label;
                        return (
                            <button
                                key={item.label}
                                onClick={() => setFormData({...formData, primaryCategory: item.label})}
                                className={`relative rounded-xl overflow-hidden aspect-[4/3] group transition-all duration-300 flex flex-col justify-end p-4 text-left border ${
                                    isSelected 
                                    ? 'border-[#405D68] ring-2 ring-[#405D68] ring-offset-2' 
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark'
                                }`}
                            >
                                <div className={`absolute inset-0 bg-white dark:bg-surface-dark transition-opacity ${isSelected ? 'opacity-0' : 'opacity-100'}`}></div>
                                <div className={`absolute inset-0 bg-[#405D68] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>
                                <img 
                                    src={item.product?.imageUrl} 
                                    className={`absolute right-0 top-0 h-3/4 w-auto object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300 ${isSelected ? 'opacity-20 scale-110' : 'opacity-100'}`} 
                                    alt={item.label} 
                                />
                                <div className="relative z-10">
                                    <span className={`block font-bold text-sm ${isSelected ? 'text-white' : 'text-[#1D1D1F] dark:text-white'}`}>{item.label}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{item.subtitle}</span>
                                </div>
                                {isSelected && <div className="absolute top-3 right-3 text-white"><span className="material-symbols-outlined">check_circle</span></div>}
                            </button>
                        );
                    })}
                </div>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2. Sub-Category */}
                <section>
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">2. Type</h2>
                        {formData.subCategory && <span className="text-[#405D68] text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Vials", icon: "vaccines" },
                            { label: "Perfume Tubes", icon: "science" },
                            { label: "Roll-Ons", icon: "radio_button_checked" },
                            { label: "Deco Bottles", icon: "diamond" },
                        ].map(sub => {
                            const isSelected = formData.subCategory === sub.label;
                            return (
                                <button 
                                    key={sub.label}
                                    onClick={() => setFormData({...formData, subCategory: sub.label})}
                                    className={`rounded-lg p-3 flex items-center gap-3 transition-all border ${getSelectionClass(isSelected)}`}
                                >
                                    <span className="material-symbols-outlined">{sub.icon}</span>
                                    <span className="text-xs font-bold">{sub.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
                {/* 3. Size */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">3. Capacity</h2>
                        {formData.size && <span className="text-[#405D68] text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                    </div>
                    <div className="flex flex-col gap-3">
                        {['1.5ml (2ml)', '4ml (1 dram)', 'Other Sizes'].map(size => {
                            const isSelected = formData.size === size;
                            return (
                                <button
                                    key={size}
                                    onClick={() => setFormData({...formData, size})}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold text-left transition-all border ${getSelectionClass(isSelected)}`}
                                >
                                    {size}
                                    {isSelected && <span className="float-right material-symbols-outlined text-sm">check</span>}
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* 4. Material */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">4. Material</h2>
                    {formData.material && <span className="text-[#405D68] text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Selected</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {materialOptions.map(mat => {
                            const isSelected = formData.material === mat.label;
                            return (
                                <button
                                key={mat.label}
                                onClick={() => setFormData({...formData, material: mat.label})}
                                className={`relative overflow-hidden rounded-xl p-4 text-left border transition-all ${
                                    isSelected 
                                    ? 'bg-[#405D68] border-[#405D68] ring-2 ring-[#405D68] ring-offset-2' 
                                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                                >
                                    <div className="relative z-10">
                                        <span className={`block font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-[#1D1D1F] dark:text-white'}`}>{mat.label}</span>
                                        <span className={`text-[10px] uppercase tracking-wide ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>{mat.desc}</span>
                                    </div>
                                    {isSelected && <div className="absolute top-2 right-2 text-white"><span className="material-symbols-outlined text-sm">check_circle</span></div>}
                                </button>
                            );
                        })}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* 5. Style Preferences */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">5. Style (Multi-select)</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Minimalist', 'Heavy-bottom', 'Vintage', 'Cylindrical', 'Square'].map(style => {
                            const isSelected = formData.styles.includes(style);
                            return (
                                <button
                                    key={style}
                                    onClick={() => toggleStyle(style)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border ${getSelectionClass(isSelected)}`}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                    </span>
                                    {style}
                                </button>
                            );
                        })}
                    </div>
                </section>
                
                {/* 6. Weight */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">6. Weight</h2>
                    <div className="flex gap-3">
                        {[
                            { id: 'Light', label: 'STD', icon: 'flight' },
                            { id: 'Medium', label: 'BAL', icon: 'balance' },
                            { id: 'Heavy', label: 'PREM', icon: 'fitness_center' },
                        ].map(w => {
                            const isSelected = formData.weight === w.id;
                            return (
                                <button
                                    key={w.id}
                                    onClick={() => setFormData({...formData, weight: w.id})}
                                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all border ${getSelectionClass(isSelected)}`}
                                >
                                    <span className="material-symbols-outlined text-xl mb-1">{w.icon}</span>
                                    <span className="text-xs font-bold">{w.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
            
             {/* 7. Use & Neck */}
             <section className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">7. Intended Use</h2>
                         <div className="flex flex-wrap gap-2">
                            {['Fragrance Oil', 'Essential Oil', 'Aromatherapy', 'Samples'].map(use => {
                                const isSelected = formData.use === use;
                                return (
                                    <button
                                        key={use}
                                        onClick={() => setFormData({...formData, use})}
                                        className={`px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border ${getSelectionClass(isSelected)}`}
                                    >
                                        {use}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                    <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">8. Neck Finish</h2>
                         <div className="relative">
                            <select 
                                 className="w-full bg-white dark:bg-surface-dark px-4 py-3 rounded-xl text-xs font-bold text-[#1D1D1F] dark:text-white outline-none focus:ring-2 focus:ring-[#405D68] border border-gray-200 dark:border-gray-700 appearance-none shadow-sm cursor-pointer"
                                 value={formData.neck}
                                 onChange={(e) => setFormData({...formData, neck: e.target.value})}
                            >
                                <option value="" disabled selected>Select specification...</option>
                                <option value="13-415">13-415 (Screw)</option>
                                <option value="18-400">18-400 (Dropper)</option>
                                <option value="20-410">20-410 (Pump)</option>
                            </select>
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 material-symbols-outlined text-sm">expand_more</span>
                         </div>
                    </div>
                </div>
            </section>

        </div>

        {/* BIGGER Start Button at Bottom */}
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="text-left hidden md:block">
                     <span className="block text-xs font-bold uppercase tracking-widest text-gray-400">Ready to proceed?</span>
                     <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">{progress < 100 ? `${requiredFields.length - completedFields} more fields recommended` : 'All details captured'}</span>
                 </div>
                 <button 
                    onClick={startAnalysis}
                    className={`w-full md:w-auto px-12 py-4 rounded-xl text-base font-bold uppercase tracking-widest shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${
                        progress > 0 
                        ? 'bg-[#405D68] hover:bg-[#344854] text-white shadow-[#405D68]/30' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={progress === 0}
                 >
                     Start Consultation
                     <span className="material-symbols-outlined text-xl">arrow_forward</span>
                 </button>
            </div>
        </div>

    </div>
  );
};