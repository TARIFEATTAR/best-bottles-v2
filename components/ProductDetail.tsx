import React, { useState, useRef } from "react";

interface ProductDetailProps {
  onBack?: () => void;
  onAddToCart?: (product: any, quantity: number) => void;
}

interface ProductVariant {
  id: string;
  name: string;
  image: string;
  type: 'Cap' | 'Bottle' | 'Accessory';
  priceMod: number;
  skuSuffix: string;
}

const PRODUCT = {
  name: "Boston Round 15ml Clear",
  skuBase: "GBBstn15",
  basePrice: 0.67,
  description: "Classic Boston Round design in high-clarity flint glass. This 15ml vessel features a standard 18-400 neck finish, making it compatible with a wide range of closures. Perfect for essential oils, herbal extracts, and high-end serums.",
  specs: {
    capacity: "15 ml (0.5 oz)",
    heightWithCap: "91 ±1 mm",
    heightWithoutCap: "68 ±1 mm",
    diameter: "25 ±0.5 mm",
    neckSize: "18-400",
    material: "Flint Glass (Type III)",
    weight: "32g"
  },
  variants: [
    {
      id: 'black-dropper',
      name: 'Black Dropper',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBahM7YX0L0v0oyIKIbTVMWX1F9kTdpmJ2ttfitYF9EEH0lioMyHlY1h0EuNVnSztRgflVQCVuH6-Tj1jYW4c_977vAjQiggE5UyhhwVsBit88GgciA7hKl4IXavVUcY0QtyWXPOU5zdcE6UHjMQe8pjJ-1FiSpjlwVk-iy9UV_ccgPD6vsAAIWviQfJ-n8BVUdVDmXMuOs6ZXMl_CntcK-cmNH_Kx_QW-PvZDlwQ7xy3al1jp06Q5-W1uTGjQS0Yx9Maw9dNFmx9I",
      type: 'Cap',
      priceMod: 0,
      skuSuffix: "BlkDrp"
    },
    {
      id: 'white-dropper',
      name: 'White Dropper',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAACEst3Z-MC9wsBtehYMhkOEOuEe8QftELCaEshY5i7AYLJj3_R909N-zLgp61oCdHkTLU0NLY7yUDInqoCVNHUkmufc4SpjdpmFsl-sAcETbpgWFXHDk33BnHt40t83yAeanv5mfoDtcRTLoPfSnxU2tu9Wqu3lNlbpX87Am4eJ36SYSp-8sgaW9j8Yiv4TOS7vvI_v5k33HRMe2KyEAmFjcziCtugObicyg-pfAuemDvlfQYCJV4u1HVKamlF9YgT4fMvGEQ1Qo",
      type: 'Cap',
      priceMod: 0,
      skuSuffix: "WhtDrp"
    },
    {
      id: 'gold-dropper',
      name: 'Gold/Glass Dropper',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmPQVN1zfnL-pefbRaXs9ctvZS76b-DQUDFfWr3W7wW1EuQifDsxG8CDn1NGwXO2kEux9cNIgAB_nz4J7Hwsx9pFXmgmMVZ8X6565BTYHYusawwDiNxsWv8S2EHFoe4qtlufVppuTInVOktF60uOjaUvvAla01ITbTj9okzHJc4-aJXJVLhH3csu3sZwIUxGYsBKoV4vVWXXsvPhb7kO0rhzlYI1tMQPMjNkTrhl2G17v2yz__lsA9UbJFVjjH5jXe5U24GNArpkQ",
      type: 'Cap',
      priceMod: 0.25,
      skuSuffix: "GldDrp"
    },
    {
      id: 'black-cap',
      name: 'Phenolic Cap',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A",
      type: 'Cap',
      priceMod: -0.10,
      skuSuffix: "BlkCap"
    },
    {
      id: 'silver-mist',
      name: 'Silver Mist Sprayer',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgc-N6bhQ9qBm4W3cs4_4tpiph1pE7Ps6W5ExSAiF1YfqXhK71QwuIGxFMFFhWvgBv93YT5i5SAJNtEWGMhrB8NhUA8q1Z7Z1km-YkVhE2DrWSyWcJ5zEDQY5dDz2upoSmfpUdFSfjBwmSFA0Qp-kfDhZTbGbYVHUqyjBExt2zauIUdjfydfG3nznSYTVpr_SY0vNhtc-0y0LQChpbRtTMmlo183J17pEKpmR9Uz1Kqbzf0mtujAac8L1EWIPKY3EJJ_CHGjle1jw",
      type: 'Cap',
      priceMod: 0.15,
      skuSuffix: "SlvMst"
    },
    {
      id: 'gold-pump',
      name: 'Gold Treatment Pump',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDwv4czIreKFOH6Hkf_GaE5eXUqrYlRIuULDQt3PTGXpUBtQtMZGv1BHbkgLdtMr4b3Byo-u_uHouV2wMSMnTywM9B2h2xTzS0EWt8YrCylJHGCrc4P5QkPggb7dqErkf7VakoJ0RFfBK4Akzs_p1--BzLXPJWq097sNBthZaMPmfQa4h28sjAA6yHcS3wnJUX1iic20rXf3LEi8S840N6moqiYIpdDWBrHSlDvDkOrNiYnIdCXquI_M0K11i8XzlYgQKS4oKhsp4",
      type: 'Cap',
      priceMod: 0.20,
      skuSuffix: "GldPmp"
    }
  ] as ProductVariant[],
  pricingTiers: [
    { qty: 1, discount: 0 },
    { qty: 100, discount: 0.15 },
    { qty: 500, discount: 0.25 },
    { qty: 1000, discount: 0.35 },
  ]
};

const RELATED_ITEMS = [
  { name: "10ml Cobalt Blue", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAhV3ApYaNTFGT_ExgArZ2q1TLgpJUXsDY7nTE2FEtURzAuOGQKLs-v0QnFX7qUU0-eWoKnFzZJeIhD7oBaW8dF1lj65pU2m80UTEhFYF7q9RofL8PcEDBPNfnxHx1F80SpOHrf47jWssaqDqnA68ZEXh_3RB8GoAkXoIUNDDG6IDrlPvv_-T8gWkkQ_49et3VG2ca2f67VQtGOcl56RJW_l7Yj4oSjemcbs-hMgRrxwps2yWjo0Ut0VXFN67MiBYlDKMf7fgShBM" },
  { name: "30ml Amber Round", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A" },
  { name: "50ml Clear Boston", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqWM45PYPPB2Zy73EsR2EW_4ebrNLWrHH3urJIkzUTNbYsQ0kWUXHKcqn0IPQj-QYTHYOwW6cF7dztUXzMDAzBx-xaw8Fg4RXehcYlcINeVjEZWYLtVbtUrhx8t9_6LRrraIRWcYIocubk70JcgGFbzZ-JnOpd5rzDYNexf4qP2_Eh0-aN0Zx89996TKVLx4ByEv4bzDiHww8rLEcOyLVR47myFr3bjNlOL8EYuKxZm6ZjN-umH5DkExOpA59VLOGWGPjCQC5OmgU" }
];

const BeforeAfter = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">Transformation</span>
            <h3 className="font-serif text-xl text-gray-900 dark:text-white">Visualize the Potential</h3>
        </div>
        
        <div 
            ref={containerRef}
            className="relative w-full aspect-square rounded-xl overflow-hidden cursor-col-resize select-none bg-gray-50 dark:bg-black/20"
            onMouseDown={() => isDragging.current = true}
            onMouseUp={() => isDragging.current = false}
            onMouseLeave={() => isDragging.current = false}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onClick={(e) => handleMove(e.clientX)}
        >
            {/* AFTER Image (Background - Full width) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="relative w-[60%] h-[80%]">
                     {/* Base Image Tinted to simulate Pink liquid */}
                     <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A"
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90"
                        style={{ filter: 'sepia(1) saturate(5) hue-rotate(300deg)' }} 
                        alt="After"
                     />
                     {/* Label Overlay */}
                     <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] bg-white border border-gray-300 shadow-sm px-4 py-3 flex flex-col items-center text-center">
                        <div className="border border-black p-1 w-full h-full flex flex-col items-center justify-center">
                             <span className="font-serif text-[10px] font-bold uppercase tracking-widest text-black">Red Rose</span>
                             <span className="text-xl text-rose-500 material-symbols-outlined my-1">local_florist</span>
                             <span className="text-[8px] font-sans text-gray-600 uppercase font-bold">Body Oil</span>
                             <span className="text-[6px] font-sans text-gray-400 mt-1">1 fl oz</span>
                        </div>
                     </div>
                 </div>
                 <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">After</span>
            </div>

            {/* BEFORE Image (Foreground - Clipped) */}
            <div 
                className="absolute inset-0 bg-white dark:bg-[#1E1E1E] flex items-center justify-center pointer-events-none border-r-2 border-white shadow-xl"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                 <div className="relative w-[60%] h-[80%]">
                     <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A"
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-100 grayscale"
                        alt="Before"
                     />
                 </div>
                 <span className="absolute top-4 left-4 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm">Before</span>
            </div>

            {/* Slider Handle */}
            <div 
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100">
                    <span className="material-symbols-outlined text-sm">compare_arrows</span>
                </div>
            </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-wide">Drag slider to see branding effect</p>
      </div>
  );
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ onBack, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
  const [quantity, setQuantity] = useState(100);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBack?.();
  };

  const handleAddToCart = () => {
    const productToAdd = {
        name: PRODUCT.name,
        variant: selectedVariant.name,
        quantity: quantity,
        price: unitPrice,
        image: selectedVariant.image
    };
    console.log("Adding to order:", productToAdd);
    onAddToCart?.(productToAdd, quantity);
  };

  const currentTier = PRODUCT.pricingTiers.reduce((prev, curr) => {
    return (quantity >= curr.qty) ? curr : prev;
  });

  const baseUnitPrice = PRODUCT.basePrice + selectedVariant.priceMod;
  const unitPrice = baseUnitPrice * (1 - currentTier.discount);
  const totalPrice = unitPrice * quantity;
  const savings = (baseUnitPrice * quantity) - totalPrice;

  const fullSku = `${PRODUCT.skuBase}${selectedVariant.skuSuffix}`;

  return (
    <main className="w-full bg-white dark:bg-background-dark min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-6 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="text-xs font-medium tracking-wide text-gray-500 flex items-center space-x-2">
            <button onClick={handleBackClick} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <button onClick={handleBackClick} className="hover:text-primary transition-colors">Vials & Bottles</button>
            <span>/</span>
            <span className="text-text-light dark:text-text-dark font-bold">{PRODUCT.name}</span>
          </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Component Selection Grid (Thumbnails) */}
          <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">
             <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Cap Options</h3>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                    {PRODUCT.variants.map((variant) => (
                        <button 
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-left w-full border ${
                                selectedVariant.id === variant.id 
                                ? "bg-gray-50 dark:bg-white/5 border-primary ring-1 ring-primary" 
                                : "bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200"
                            }`}
                        >
                            <div className="w-12 h-12 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                <img 
                                    src={variant.image} 
                                    alt={variant.name} 
                                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform"
                                />
                            </div>
                            <div className="hidden lg:block min-w-0">
                                <span className={`block text-xs font-bold leading-tight truncate ${selectedVariant.id === variant.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {variant.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {variant.priceMod > 0 ? `+$${variant.priceMod.toFixed(2)}` : variant.priceMod < 0 ? `-$${Math.abs(variant.priceMod).toFixed(2)}` : 'Included'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
             </div>
             
             {/* Additional Info Block for Desktop */}
             <div className="hidden lg:block bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-2">Need a different size?</h4>
                <p className="text-[10px] text-gray-500 mb-3">We have 30ml, 50ml and 100ml options available in the same style.</p>
                <button className="text-[10px] font-bold text-primary underline">View Series</button>
             </div>
          </div>

          {/* Center Column: Main Stage */}
          <div className="lg:col-span-6 order-1 lg:order-2">
             <div className="sticky top-24 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 aspect-[4/5] lg:aspect-square flex items-center justify-center p-8 lg:p-16 shadow-sm overflow-hidden group">
                 {/* Main Product Image */}
                 <img 
                    src={selectedVariant.image} 
                    alt={`${PRODUCT.name} with ${selectedVariant.name}`}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                 />
                 
                 {/* Floating Actions */}
                 <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary">
                        <span className="material-symbols-outlined text-lg">zoom_in</span>
                     </button>
                     <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                     </button>
                 </div>
             </div>
          </div>

          {/* Right Column: Details & Configuration */}
          <div className="lg:col-span-4 order-3 flex flex-col">
             
             {/* Header Info */}
             <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                 <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-light dark:text-text-dark mb-2 leading-tight">{PRODUCT.name}</h1>
                 
                 <div className="flex items-center justify-between mb-4">
                     <span className="text-sm font-mono text-gray-500 dark:text-gray-400">SKU: <span className="font-bold text-gray-900 dark:text-white">{fullSku}</span></span>
                     <div className="flex text-gold text-sm">
                         <span className="material-symbols-outlined filled-icon text-[18px]">star</span>
                         <span className="material-symbols-outlined filled-icon text-[18px]">star</span>
                         <span className="material-symbols-outlined filled-icon text-[18px]">star</span>
                         <span className="material-symbols-outlined filled-icon text-[18px]">star</span>
                         <span className="material-symbols-outlined text-[18px]">star_half</span>
                         <span className="ml-1 text-gray-400 text-xs">(124)</span>
                     </div>
                 </div>

                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {PRODUCT.description}
                 </p>
                 
                 {/* Selected Variant Summary */}
                 <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Configured:</span>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">{selectedVariant.name}</span>
                 </div>
             </div>

             {/* Specifications Table (As requested) */}
             <div className="mb-8">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">tune</span> Product Specifications
                 </h3>
                 <div className="bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                     <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                         <div className="px-4 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-white/5">Capacity</div>
                         <div className="px-4 py-2 font-medium text-gray-900 dark:text-white">{PRODUCT.specs.capacity}</div>
                     </div>
                     <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                         <div className="px-4 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-white/5">Neck Finish</div>
                         <div className="px-4 py-2 font-medium text-gray-900 dark:text-white">{PRODUCT.specs.neckSize}</div>
                     </div>
                     <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                         <div className="px-4 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-white/5">Height (w/ Cap)</div>
                         <div className="px-4 py-2 font-medium text-gray-900 dark:text-white">{PRODUCT.specs.heightWithCap}</div>
                     </div>
                     <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                         <div className="px-4 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-white/5">Height (Bottle)</div>
                         <div className="px-4 py-2 font-medium text-gray-900 dark:text-white">{PRODUCT.specs.heightWithoutCap}</div>
                     </div>
                     <div className="grid grid-cols-2">
                         <div className="px-4 py-2 text-gray-500 border-r border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-white/5">Diameter</div>
                         <div className="px-4 py-2 font-medium text-gray-900 dark:text-white">{PRODUCT.specs.diameter}</div>
                     </div>
                 </div>
             </div>

             {/* Pricing & Cart */}
             <div className="mt-auto bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-lg shadow-gray-100 dark:shadow-none">
                 
                 <div className="flex justify-between items-baseline mb-4">
                     <span className="text-sm font-medium text-gray-500">Unit Price:</span>
                     <div className="text-right">
                         <span className="block text-2xl font-bold text-gray-900 dark:text-white">${unitPrice.toFixed(2)}</span>
                         {currentTier.discount > 0 && (
                             <span className="text-xs text-green-600 font-bold line-through mr-2">${baseUnitPrice.toFixed(2)}</span>
                         )}
                         <span className="text-[10px] text-gray-400">per piece</span>
                     </div>
                 </div>

                 {/* Volume Pricing Indicator */}
                 <div className="flex gap-1 mb-6">
                     {PRODUCT.pricingTiers.map((tier, i) => (
                         <div 
                            key={i} 
                            onClick={() => setQuantity(tier.qty)}
                            className={`flex-1 h-1 rounded-full cursor-pointer transition-all ${quantity >= tier.qty ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                            title={`${tier.qty}+ units: ${tier.discount * 100}% off`}
                         ></div>
                     ))}
                 </div>

                 <div className="flex items-center gap-4 mb-4">
                     <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg h-12 w-32">
                         <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 50))} 
                            className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
                        >
                            <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                         <input 
                            type="number" 
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                            className="flex-1 h-full text-center border-none bg-transparent font-bold text-gray-900 dark:text-white focus:ring-0 p-0"
                         />
                         <button 
                            onClick={() => setQuantity(quantity + 50)} 
                            className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                     </div>
                     <div className="flex-1 text-right">
                         <span className="block text-xs text-gray-500">Total</span>
                         <span className="block text-lg font-bold text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                     </div>
                 </div>

                 {savings > 0 && (
                     <div className="mb-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-2 rounded text-center">
                         You save ${savings.toFixed(2)} with volume pricing!
                     </div>
                 )}

                 <button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#111418] dark:bg-white text-white dark:text-[#111418] py-4 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
                 >
                     <span className="material-symbols-outlined">shopping_cart</span>
                     Add to Order
                 </button>
                 
                 <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                     <span className="material-symbols-outlined text-[12px] text-green-500">local_shipping</span>
                     In Stock. Ships within 24 hours.
                 </p>
             </div>
             
          </div>

        </div>

        {/* Tabbed Info Section (Reviews, etc) */}
        <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-10">
             <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-8">
                 {['Description', 'Specs', 'Shipping'].map((tab) => (
                     <button 
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab.toLowerCase() ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                         {tab}
                         {activeTab === tab.toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
                     </button>
                 ))}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="prose prose-sm dark:prose-invert">
                     <p>
                        Our {PRODUCT.name} sets the standard for packaging excellence. Manufactured in ISO-certified facilities, this bottle offers exceptional clarity and chemical resistance, making it suitable for a wide array of formulations including essential oils, tinctures, and cosmetics.
                     </p>
                     <p>
                        The matching {selectedVariant.name} is precision-engineered to provide a secure seal, preventing leakage and ensuring product integrity during transit.
                     </p>
                     
                     {/* Show Before/After only in Description tab, but effectively activeTab handles display logic implicitly if we were rendering different content per tab. 
                         Currently, this layout assumes left col is description/content. 
                         If tabs switched completely, we'd wrap this. For now, it's just here. */}
                     {activeTab === 'description' && (
                         <div className="mt-12">
                            <BeforeAfter />
                         </div>
                     )}

                     {activeTab === 'specs' && (
                         <div className="mt-8">
                             <h4 className="font-bold mb-4">Detailed Dimensions</h4>
                             <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                                 <li>Weight: {PRODUCT.specs.weight}</li>
                                 <li>Material: {PRODUCT.specs.material}</li>
                                 <li>Neck Finish: {PRODUCT.specs.neckSize}</li>
                             </ul>
                         </div>
                     )}
                     
                     {activeTab === 'shipping' && (
                         <div className="mt-8">
                             <h4 className="font-bold mb-4">Shipping Information</h4>
                             <p className="text-gray-600 dark:text-gray-400">
                                 Standard shipping via UPS Ground. Expedited options available at checkout.
                                 Bulk orders over 5000 units may ship via freight carrier.
                             </p>
                         </div>
                     )}

                 </div>
                 <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl">
                     <h4 className="font-bold text-sm mb-4">Why choose this bottle?</h4>
                     <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                         <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check</span> BPA Free & Lead Free</li>
                         <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check</span> Medical Grade Glass (Type III)</li>
                         <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check</span> Compatible with all 18-400 closures</li>
                         <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-sm">check</span> 100% Recyclable</li>
                     </ul>
                 </div>
             </div>
        </div>

      </div>
    </main>
  );
};