import React, { useState, useMemo, useEffect } from "react";
import type {
  ConfigurableProductCategory,
  ProductSelection
} from "../types";

// Import all product data
import rollOnData from "../data/roll-on-9ml-cylinder.json";
import sprayData from "../data/elegant-60ml-spray.json";
import atomizerData from "../data/travel-atomizer-10ml.json";

interface ProductDetailConfigurableProps {
  productId?: string;
  onBack?: () => void;
  onAddToCart?: (product: any, quantity: number) => void;
}

export const ProductDetailConfigurable: React.FC<ProductDetailConfigurableProps> = ({
  productId = "9ml-cylinder-roll-on", // Default
  onBack,
  onAddToCart
}) => {

  // 1. Select the correct data source based on ID
  const productData = useMemo(() => {
    switch (productId) {
      case "60ml-elegant-spray": return sprayData as unknown as ConfigurableProductCategory;
      case "travel-atomizer": return atomizerData as unknown as ConfigurableProductCategory;
      case "9ml-cylinder-roll-on":
      default: return rollOnData as unknown as ConfigurableProductCategory;
    }
  }, [productId]);

  // 2. Initialize Selection State
  // Reset selection when productData changes
  const [selection, setSelection] = useState<ProductSelection>({
    bottleId: productData.baseBottles[0]?.id,
    rollerId: productData.rollerOptions[0]?.id,
    capId: productData.capOptions[0]?.id,
    quantity: 1
  });

  // NOTE: Previous useEffect for state reset removed. 
  // Parent component (App.tsx) now uses key={productId} to force full remount on product change.

  const [isSaved, setIsSaved] = useState(false);

  // Get selected items (Safe access)
  const selectedBottle = useMemo(() =>
    productData.baseBottles.find(b => b.id === selection.bottleId) || productData.baseBottles[0],
    [selection.bottleId, productData]
  );

  const selectedRoller = useMemo(() =>
    productData.rollerOptions.find(r => r.id === selection.rollerId) || productData.rollerOptions[0],
    [selection.rollerId, productData]
  );

  const selectedCap = useMemo(() =>
    productData.capOptions.find(c => c.id === selection.capId) || productData.capOptions[0],
    [selection.capId, productData]
  );

  // Calculate pricing
  const pricingTiers = useMemo(() => {
    // Safety check for pricing matrix existence
    if (!productData?.pricingMatrix?.basePrices) return [];

    const basePrices = productData.pricingMatrix.basePrices[selection.bottleId];
    if (!basePrices) return [];

    const metalUpcharge = (selection.rollerId === 'metal-roller' && productData.pricingMatrix.metalRollerUpcharge)
      ? productData.pricingMatrix.metalRollerUpcharge
      : 0;

    return Object.entries(basePrices).map(([qty, price]) => ({
      quantity: parseInt(qty),
      price: price + metalUpcharge,
      label: `${qty} pcs - $${(price + metalUpcharge).toFixed(2)}/pc`
    })).sort((a, b) => a.quantity - b.quantity);
  }, [selection.bottleId, selection.rollerId, productData]);

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const selectedTier = pricingTiers[selectedTierIndex] || pricingTiers[0];

  // Auto-select best pricing tier based on quantity
  const handleQtyChange = (val: string) => {
    const num = parseInt(val) || 0;
    setSelection(s => ({ ...s, quantity: num }));

    // Find the best tier for this quantity
    const bestTierIndex = [...pricingTiers]
      .reverse()
      .findIndex(t => num >= t.quantity);

    if (bestTierIndex >= 0) {
      setSelectedTierIndex(pricingTiers.length - 1 - bestTierIndex);
    }
  };

  // Generate dynamic SKU
  const generatedSku = useMemo(() => {
    const skuEntry = productData.skuMatrix.find(
      entry => entry.bottle === selection.bottleId &&
        entry.roller === selection.rollerId &&
        entry.cap === selection.capId
    );

    if (skuEntry) return skuEntry.sku;

    // Fallback: construct from parts
    return `${selectedBottle.skuPrefix}${selectedRoller.skuCode}${selectedCap.skuCode}`;
  }, [selection, selectedBottle, selectedRoller, selectedCap, productData]);

  // Generate dynamic composite image URL based on bottle + roller + cap selection
  const compositeImageUrl = useMemo(() => {
    // If specific override exists (e.g. travel atomizer might just be the bottle image)
    if (productId === "travel-atomizer") {
      // For atomizer, usually the "bottle" image is the full unit. 
      // If "dotted" cap is selected, we try to switch image if available.
      if (selectedCap.id === "dot-cap") {
        // HACK: Construct dotted SKU from base. 
        // Assuming base is GBAtom10Sl -> Dotted is GBAtom10SlDot
        return selectedBottle.imageUrl.replace('.gif', 'Dot.gif');
      }
      return selectedBottle.imageUrl;
    }

    const baseUrl = 'https://www.bestbottles.com/images/store/enlarged_pics/';
    const capWithImage = selectedCap as typeof selectedCap & { imageCode?: string; hasCompositeImage?: boolean };

    // Standard Configurable Logic (Roll-on & Spray)
    if (capWithImage.hasCompositeImage && capWithImage.imageCode) {
      // Universal Logic: BottlePrefix + RollerCode (if any) + CapCode
      const middleCode = selectedRoller.skuCode || "";
      return `${baseUrl}${selectedBottle.skuPrefix}${middleCode}${capWithImage.imageCode}.gif`;
    }

    // Fallback to the default bottle + roller image (with BlkDot cap)
    if (selection.rollerId === 'metal-roller') {
      return (selectedBottle as any).imageUrlMetal || selectedBottle.imageUrl;
    }
    return (selectedBottle as any).imageUrlPlastic || selectedBottle.imageUrl;
  }, [selectedBottle, selectedRoller, selectedCap, selection.rollerId, productId]);

  // Check if current cap has a composite image
  const hasCompositeCapImage = useMemo(() => {
    // Atomizers are always "exact" because we swap the base image
    if (productId === "travel-atomizer") return true;
    return (selectedCap as any).hasCompositeImage === true;
  }, [selectedCap, productId]);

  const totalPrice = ((selection.quantity || 0) * (selectedTier?.price || 0)).toFixed(2);

  // Dynamic Product Name Construction
  const productName = useMemo(() => {
    if (productId === "travel-atomizer") {
      return `${selectedBottle.name} ${productData.categoryName}`;
    }
    return `${productData.sharedSpecs.capacity} ${selectedBottle.name} Bottle with ${selectedRoller.name} & ${selectedCap.name}`;
  }, [productId, selectedBottle, selectedRoller, selectedCap, productData]);


  const handleSaveProject = () => {
    setIsSaved(!isSaved);
  };

  const handleAddToCart = () => {
    const cartItem = {
      sku: generatedSku,
      name: productName,
      bottle: selectedBottle,
      roller: selectedRoller,
      cap: selectedCap,
      specs: productData.sharedSpecs,
      price: selectedTier?.price,
      image: compositeImageUrl,
      quantity: selection.quantity,
      totalPrice: parseFloat(totalPrice)
    };
    onAddToCart?.(cartItem, selection.quantity);
  };

  // Helper for dynamic labels from JSON metadata
  const labels = (productData as any).labels || { roller: "Component Type", cap: "Cap Style" };

  return (
    <main className="w-full bg-white dark:bg-background-dark min-h-screen font-sans pb-32 lg:pb-20 overflow-x-hidden">

      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden">

        {/* Mobile Header - Minimal */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onBack} className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {productData.categoryName}
            </span>
            <button className="text-gray-600 dark:text-gray-300">
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
          </div>
        </div>

        {/* Mobile: Product Image - Full Width, Taller */}
        <div className="relative bg-gradient-to-b from-gray-50 to-white dark:from-[#1A1A1A] dark:to-[#1E1E1E]">
          <div className="aspect-square max-h-[50vh] w-full flex items-center justify-center p-8 relative">
            <img
              src={compositeImageUrl}
              alt={productName}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />

            {/* Floating Cap Image (Hide for Atomizer) */}
            {productId !== "travel-atomizer" && !hasCompositeCapImage && (
              <div className="absolute bottom-4 right-4 w-16 h-16 bg-white dark:bg-[#252525] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center">
                <img
                  src={selectedCap.imageUrl}
                  alt={selectedCap.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Exact Preview Badge */}
            {hasCompositeCapImage && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                <i className="ph-thin ph-check" /> Exact Preview
              </div>
            )}
          </div>

          {/* Mobile: Glass/Body Color Selection - Pill Style */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {productData.baseBottles.map((bottle) => (
                <button
                  key={bottle.id}
                  onClick={() => setSelection(s => ({ ...s, bottleId: bottle.id }))}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${selection.bottleId === bottle.id
                    ? 'border-[#C5A065] bg-[#C5A065]/10 text-[#1e1e4b] dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                >
                  <img src={bottle.imageUrl} alt={bottle.name} className="w-6 h-6 object-contain" />
                  <span className="text-xs font-medium whitespace-nowrap">{bottle.color}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Product Info Card */}
        <div className="px-4 -mt-2">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

            {/* Product Title */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-lg font-serif font-bold text-[#1e1e4b] dark:text-white leading-tight">
                  {productName}
                </h1>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> In Stock
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-mono bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">SKU: {generatedSku}</span>
              </div>
            </div>

            {/* Config Option 2 (Roller/Spray/Insert) - Show only if >1 option */}
            {productData.rollerOptions.length > 1 && (
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  {labels.roller}
                </span>
                <div className="flex gap-2">
                  {productData.rollerOptions.map((roller) => (
                    <button
                      key={roller.id}
                      onClick={() => setSelection(s => ({ ...s, rollerId: roller.id }))}
                      className={`flex-1 py-3 px-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selection.rollerId === roller.id
                        ? 'border-[#C5A065] bg-[#C5A065]/5'
                        : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <span className={`material-symbols-outlined text-base ${selection.rollerId === roller.id ? 'text-[#C5A065]' : 'text-gray-400'
                        }`}>
                        {roller.type === 'metal' ? 'brightness_7' : 'circle'}
                      </span>
                      <span className={`text-xs font-bold ${selection.rollerId === roller.id ? 'text-[#1e1e4b] dark:text-white' : 'text-gray-500'
                        }`}>
                        {roller.name}
                      </span>
                      {roller.priceModifier > 0 && (
                        <span className="text-[10px] text-gray-400">+${roller.priceModifier.toFixed(2)}/pc</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing & Quantity */}
            <div className="p-4 bg-gray-50 dark:bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Purchase Tier</span>
              </div>

              {/* Tier Selector */}
              <div className="relative mb-4">
                <select
                  value={selectedTierIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedTierIndex(idx);
                    const tier = pricingTiers[idx];
                    if (tier && selection.quantity < tier.quantity) {
                      setSelection(s => ({ ...s, quantity: tier.quantity }));
                    }
                  }}
                  className="w-full appearance-none bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-[#1e1e4b] dark:text-white focus:border-[#C5A065] outline-none"
                >
                  {pricingTiers.map((tier, idx) => (
                    <option key={idx} value={idx}>{tier.label}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-gray-400">expand_more</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Qty</span>
                <div className="flex items-center bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelection(s => ({ ...s, quantity: Math.max(1, s.quantity - 1) }))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1e1e4b]"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={selection.quantity}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className="w-16 text-center border-x border-gray-200 dark:border-gray-700 py-2 text-sm font-bold bg-transparent dark:text-white outline-none"
                  />
                  <button
                    onClick={() => setSelection(s => ({ ...s, quantity: s.quantity + 1 }))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1e1e4b]"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500">Total Qty: <span className="font-bold text-[#1e1e4b] dark:text-white">{selection.quantity}</span></span>
                <span className="text-xs text-gray-500">Total Price: <span className="font-bold text-[#1e1e4b] dark:text-white text-base">${totalPrice}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Cap Style Selector (Full Width Grid) */}
        {productData.capOptions.length > 1 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{labels.cap}</span>
              <span className="text-[9px] text-green-500 flex items-center gap-1">
                <i className="ph-thin ph-circle-fill text-[6px]" /> Live preview available
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {productData.capOptions.map((cap) => {
                const capData = cap as typeof cap & { hasCompositeImage?: boolean };
                return (
                  <button
                    key={cap.id}
                    onClick={() => setSelection(s => ({ ...s, capId: cap.id }))}
                    className={`aspect-square rounded-xl border bg-white dark:bg-white/5 p-1.5 flex flex-col items-center justify-center gap-0.5 relative transition-all ${selection.capId === cap.id
                      ? 'border-[#C5A065] ring-2 ring-[#C5A065] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    {capData.hasCompositeImage && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    <img
                      src={cap.imageUrl}
                      alt={cap.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="text-[7px] text-gray-500 text-center leading-tight truncate w-full">{cap.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile: Expandable Specs */}
        <div className="px-4 pb-4">
          <details className="group">
            <summary className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800 cursor-pointer">
              <span className="text-sm font-bold text-[#1e1e4b] dark:text-white">Technical Specifications</span>
              <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="grid grid-cols-2 gap-3 py-3 text-sm">
              <div><span className="text-gray-500">Capacity:</span> <span className="font-medium dark:text-white">{productData.sharedSpecs.capacity}</span></div>
              <div><span className="text-gray-500">Height w/ Cap:</span> <span className="font-medium dark:text-white">{productData.sharedSpecs.heightWithCap}</span></div>
              <div><span className="text-gray-500">Height w/o Cap:</span> <span className="font-medium dark:text-white">{productData.sharedSpecs.heightWithoutCap}</span></div>
              <div><span className="text-gray-500">Diameter:</span> <span className="font-medium dark:text-white">{productData.sharedSpecs.diameter}</span></div>
              <div><span className="text-gray-500">Thread:</span> <span className="font-medium dark:text-white">{productData.sharedSpecs.neckThreadSize}</span></div>
              <div><span className="text-gray-500">Material:</span> <span className="font-medium dark:text-white capitalize">{selectedBottle.material}</span></div>
            </div>
          </details>

          {/* Configuration Summary */}
          <div className="bg-[#f8f6f3] dark:bg-white/5 p-3 rounded-xl border border-[#C5A065]/20 mt-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A065] mb-2 block">Your Configuration</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Bottle: <span className="text-[#1e1e4b] dark:text-white font-medium">{selectedBottle.name}</span></span>
              <span className="text-gray-500">Color: <span className="text-[#1e1e4b] dark:text-white font-medium">{selectedBottle.color}</span></span>
              {productId !== 'travel-atomizer' && (
                <span className="text-gray-500 flex items-center gap-1">{labels.cap}:
                  <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: selectedCap.color }}></span>
                  <span className="text-[#1e1e4b] dark:text-white font-medium">{selectedCap.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE STICKY ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 p-4 md:hidden z-50 flex items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Total Estimate</span>
          <span className="text-xl font-serif font-bold text-[#1e1e4b] dark:text-white">${totalPrice}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] py-3 rounded-lg text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Add To Cart
        </button>
      </div>

      {/* ===== DESKTOP LAYOUT (>= lg) ===== */}
      <div className="hidden lg:block">
        {/* Navigation / Breadcrumbs */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-6 border-b border-gray-100 dark:border-gray-800 mb-4 md:mb-8 sticky top-[72px] bg-white/90 dark:bg-background-dark/90 backdrop-blur z-30">
          <div className="text-xs font-bold tracking-widest uppercase text-gray-400 flex items-center space-x-2 md:space-x-3">
            <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            <span>/</span>
            <span className="hover:text-primary cursor-pointer">Categories</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">
              {productData.categoryName}
            </span>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-12 gap-8">

            {/* Left Column: Scrollable Variant Selectors */}
            <div className="col-span-2">
              <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">

                {/* Glass Color Selection - Compact horizontal */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">
                    {productData.baseBottles.length > 2 ? 'Color Selection' : 'Finish Selection'}
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {productData.baseBottles.map((bottle) => (
                      <button
                        key={bottle.id}
                        onClick={() => setSelection(s => ({ ...s, bottleId: bottle.id }))}
                        className={`aspect-square rounded-lg border bg-white dark:bg-white/5 p-1.5 transition-all flex flex-col items-center justify-center ${selection.bottleId === bottle.id
                          ? 'border-[#C5A065] ring-2 ring-[#C5A065] bg-[#C5A065]/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                          }`}
                        title={bottle.name}
                      >
                        <img
                          src={bottle.imageUrl}
                          alt={bottle.name}
                          className="w-8 h-8 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 text-center">
                    {productData.baseBottles.find(b => b.id === selection.bottleId)?.name}
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4"></div>

                {/* Cap Selection - Grid with scroll */}
                {productData.capOptions.length > 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">{labels.cap}</span>
                      {hasCompositeCapImage && productId !== 'travel-atomizer' && (
                        <span className="text-[8px] text-green-500 flex items-center gap-1"><i className="ph-thin ph-circle-fill" /> Live preview</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {productData.capOptions.map((cap) => {
                        const capData = cap as typeof cap & { hasCompositeImage?: boolean };
                        return (
                          <button
                            key={cap.id}
                            onClick={() => setSelection(s => ({ ...s, capId: cap.id }))}
                            className={`aspect-square rounded-lg border bg-white dark:bg-white/5 p-1 transition-all flex flex-col items-center justify-center gap-0.5 relative ${selection.capId === cap.id
                              ? 'border-[#C5A065] ring-2 ring-[#C5A065] bg-[#C5A065]/5'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                              }`}
                            title={`${cap.name}${capData.hasCompositeImage ? ' (Full Preview Available)' : ''}`}
                          >
                            {capData.hasCompositeImage && (
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                            )}
                            <img
                              src={cap.imageUrl}
                              alt={cap.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-inner hidden"
                              style={{ backgroundColor: cap.color }}
                            />
                            <span className="text-[7px] text-gray-500 dark:text-gray-400 text-center leading-tight truncate w-full px-0.5">
                              {cap.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Column: Main Product Image - STICKY */}
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-28">
                {/* Main Product Image - Dynamic Composite */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 w-full h-[55vh] max-h-[550px] flex items-center justify-center p-10 shadow-sm overflow-hidden group relative">

                  <img
                    src={compositeImageUrl}
                    alt={productName}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-500 group-hover:scale-105"
                  />

                  {/* Selection Badge */}
                  <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {selectedBottle.name}
                  </div>

                  {/* Cap Badge */}
                  {productId !== 'travel-atomizer' && (
                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-400"
                        style={{ backgroundColor: selectedCap.color }}
                      />
                      {selectedCap.name} {labels.cap.split(' ')[0]} {/* "Cap" or "Pump" hack if needed, but simple "Cap" remains nice default */}
                    </div>
                  )}

                  {/* Roller Badge */}
                  {productData.rollerOptions.length > 1 && (
                    <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      <i className={`ph-thin ${selectedRoller.type === 'metal' ? 'ph-circle-fill' : 'ph-circle'} mr-1`} />{selectedRoller.name}
                    </div>
                  )}

                  {hasCompositeCapImage && (
                    <div className="absolute bottom-6 right-6 bg-green-500/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                      <i className="ph-thin ph-check" /> Exact Preview
                    </div>
                  )}
                </div>

                {/* Cap Preview Section - Only show for non-composite caps */}
                {!hasCompositeCapImage && productId !== 'travel-atomizer' && (
                  <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-lg border border-amber-200 dark:border-amber-600 flex items-center justify-center p-2">
                        <img
                          src={selectedCap.imageUrl}
                          alt={selectedCap.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                          Selected Cap (Preview Only)
                        </div>
                        <div className="text-lg font-bold text-[#1e1e4b] dark:text-white">
                          {selectedCap.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {selectedCap.finish} finish
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg ring-2 ring-amber-200"
                        style={{ backgroundColor: selectedCap.color }}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Product Details & Order Form - STICKY */}
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-28 flex flex-col space-y-6">

                {/* Header Info */}
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    {productData.categoryName}
                  </span>
                  <h1 className="text-3xl font-serif font-bold text-[#1e1e4b] dark:text-white mt-2 mb-2">
                    {productName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
                      SKU: {generatedSku}
                    </span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> In Stock
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-l-2 border-[#C5A065] pl-4">
                  {productData.sharedSpecs.capacity} {selectedBottle.material} bottle.
                  Perfect for {productData.sharedSpecs.recommendedUse.slice(0, 3).join(', ')}.
                </p>

                {/* Roller/Spray Selection (Only if >1) */}
                {productData.rollerOptions.length > 1 && (
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-bold uppercase text-gray-500 mb-3 block">
                      {labels.roller}
                    </span>
                    <div className="flex gap-3">
                      {productData.rollerOptions.map((roller) => (
                        <button
                          key={roller.id}
                          onClick={() => setSelection(s => ({ ...s, rollerId: roller.id }))}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${selection.rollerId === roller.id
                            ? 'border-[#C5A065] bg-[#C5A065]/10'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                          <span className={`material-symbols-outlined text-lg ${selection.rollerId === roller.id ? 'text-[#C5A065]' : 'text-gray-400'
                            }`}>
                            {roller.type === 'metal' ? 'brightness_7' : 'circle'}
                          </span>
                          <span className={`text-sm font-bold ${selection.rollerId === roller.id ? 'text-[#1e1e4b] dark:text-white' : 'text-gray-500'
                            }`}>
                            {roller.name}
                          </span>
                          {roller.priceModifier > 0 && (
                            <span className="text-[10px] text-gray-400">
                              +${roller.priceModifier.toFixed(2)}/pc
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wholesale Order Box */}
                <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-inner">
                  <div className="grid grid-cols-12 gap-4 items-end mb-4">
                    {/* Tier Dropdown */}
                    <div className="col-span-8">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Purchase Tier</label>
                      <div className="relative">
                        <select
                          value={selectedTierIndex}
                          onChange={(e) => {
                            const idx = parseInt(e.target.value);
                            setSelectedTierIndex(idx);
                            const tier = pricingTiers[idx];
                            if (tier && selection.quantity < tier.quantity) {
                              setSelection(s => ({ ...s, quantity: tier.quantity }));
                            }
                          }}
                          className="w-full appearance-none bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-sm font-bold text-[#1e1e4b] dark:text-white focus:border-[#1e1e4b] outline-none shadow-sm"
                        >
                          {pricingTiers.map((tier, idx) => (
                            <option key={idx} value={idx}>{tier.label}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-sm text-gray-500">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Qty Input */}
                    <div className="col-span-4">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Order Qty</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={selection.quantity}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-sm font-bold text-center outline-none focus:border-[#1e1e4b] dark:text-white shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Totals Row */}
                  <div className="flex items-center justify-between bg-white dark:bg-black/10 p-4 rounded border border-gray-200 dark:border-gray-600 mb-4">
                    <div className="text-xs text-gray-500">
                      Total Qty: <span className="font-bold text-black dark:text-white text-sm ml-1">{selection.quantity}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Total Price: <span className="font-bold text-[#1e1e4b] dark:text-white text-lg ml-1">${totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProject}
                      className={`px-4 py-3 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${isSaved
                        ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                        : 'bg-white dark:bg-transparent text-[#1e1e4b] dark:text-white hover:bg-gray-50'
                        }`}
                    >
                      <span className={`material-symbols-outlined ${isSaved ? 'filled-icon' : ''}`}>favorite</span>
                      {isSaved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#1e1e4b] dark:bg-white text-white dark:text-[#1e1e4b] py-3 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                    >
                      Add To <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    </button>
                  </div>
                </div>

                {/* Specifications List */}
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-sm text-[#1e1e4b] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                    Technical Specifications
                  </h4>

                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1e1e4b] dark:text-white">Item Capacity:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">
                        {productData.sharedSpecs.capacity}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-[#1e1e4b] dark:text-white">Height with Cap:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">
                        {productData.sharedSpecs.heightWithCap}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-[#1e1e4b] dark:text-white">Height w/o Cap:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">
                        {productData.sharedSpecs.heightWithoutCap}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-[#1e1e4b] dark:text-white">Diameter:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs mt-1">
                        {productData.sharedSpecs.diameter}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};





