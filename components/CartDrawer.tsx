import React, { useMemo } from "react";
import { PRODUCTS } from "../constants";

interface CartItem {
  product: any; // Handles both strict Product type and custom object from ProductDetail
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onAddToCart: (product: any, quantity: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onUpdateQuantity,
  onAddToCart 
}) => {
  
  // --- Calculations ---
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      // Normalize price (handle string "$0.00" vs number)
      let price = 0;
      if (typeof item.product.price === 'number') {
        price = item.product.price;
      } else if (typeof item.product.price === 'string') {
        price = parseFloat(item.product.price.replace('$', ''));
      }
      return acc + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  const FREE_SHIPPING_THRESHOLD = 200;
  const progressToFree = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFree = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  // --- Upsell Logic ---
  const upsellRecommendations = useMemo(() => {
    // 1. Identify what's in the cart
    const hasBottles = cartItems.some(i => i.product.name.toLowerCase().includes('bottle') || i.product.category?.includes('Bottle'));
    const hasClosures = cartItems.some(i => i.product.name.toLowerCase().includes('cap') || i.product.name.toLowerCase().includes('pump') || i.product.variant?.toLowerCase().includes('cap'));
    
    const suggestions = [];

    // 2. Logic: If Bottles but no Closures, suggest Closures
    if (hasBottles && !hasClosures) {
        suggestions.push({
            name: "Gold Mist Sprayer",
            price: 0.45,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgc-N6bhQ9qBm4W3cs4_4tpiph1pE7Ps6W5ExSAiF1YfqXhK71QwuIGxFMFFhWvgBv93YT5i5SAJNtEWGMhrB8NhUA8q1Z7Z1km-YkVhE2DrWSyWcJ5zEDQY5dDz2upoSmfpUdFSfjBwmSFA0Qp-kfDhZTbGbYVHUqyjBExt2zauIUdjfydfG3nznSYTVpr_SY0vNhtc-0y0LQChpbRtTMmlo183J17pEKpmR9Uz1Kqbzf0mtujAac8L1EWIPKY3EJJ_CHGjle1jw",
            reason: "Complete the look"
        });
    }

    // 3. Logic: General Luxury Add-ons (always suggest if cart not empty)
    if (cartItems.length > 0) {
        suggestions.push({
            name: "Velvet Travel Pouch",
            price: 2.50,
            image: "https://images.unsplash.com/photo-1615634260167-c8c9c313880b?auto=format&fit=crop&q=80&w=200",
            reason: "Protect your glass"
        });
        suggestions.push({
            name: "Mini Funnel Set",
            price: 4.00,
            image: "https://images.unsplash.com/photo-1585675100412-42b100619297?auto=format&fit=crop&q=80&w=200",
            reason: "Easy filling"
        });
    }

    return suggestions.slice(0, 2); // Return top 2
  }, [cartItems]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#F9F8F6] dark:bg-[#161616] shadow-2xl z-[100] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col border-l border-gray-200 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-white dark:bg-[#1D1D1F] p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1D1D1F] dark:text-white">Your Cart ({cartItems.reduce((a,c) => a + c.quantity, 0)})</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            {/* Free Shipping Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    {amountToFree > 0 ? (
                        <span className="text-[#C5A059]">Add ${amountToFree.toFixed(2)} for Free Shipping</span>
                    ) : (
                        <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Free Shipping Unlocked</span>
                    )}
                    <span className="text-gray-400">{Math.floor(progressToFree)}%</span>
                </div>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#1D1D1F] dark:bg-[#C5A059] transition-all duration-500 ease-out"
                        style={{ width: `${progressToFree}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                    <span className="material-symbols-outlined text-6xl">shopping_basket</span>
                    <p className="text-lg font-serif">Your cart is empty.</p>
                    <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest underline decoration-[#C5A065]">Continue Shopping</button>
                </div>
            ) : (
                cartItems.map((item, idx) => {
                    const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price.replace('$', ''));
                    const image = item.product.image || item.product.imageUrl;
                    const variantName = item.product.variant || (item.product.color !== 'All' ? item.product.color : null);

                    return (
                        <div key={idx} className="flex gap-4 group">
                            <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shrink-0">
                                <img src={image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white leading-tight">{item.product.name}</h4>
                                        <span className="text-sm font-medium">${(price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {variantName && <span className="text-xs text-gray-500">{variantName}</span>}
                                    {/* Mock availability */}
                                    <span className="text-[10px] text-green-600 dark:text-green-400 block mt-1">In Stock</span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded h-8">
                                        <button 
                                            onClick={() => onUpdateQuantity(idx, Math.max(0, item.quantity - 1))}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                                        >
                                            <span className="material-symbols-outlined text-xs">remove</span>
                                        </button>
                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                                        >
                                            <span className="material-symbols-outlined text-xs">add</span>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onRemoveItem(idx)}
                                        className="text-[10px] uppercase font-bold text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Perfect Pairings Upsell Section */}
            {cartItems.length > 0 && upsellRecommendations.length > 0 && (
                <div className="mt-8 pt-8 border-t border-dashed border-gray-300 dark:border-gray-700 animate-fade-up">
                    <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white mb-4">Perfect Pairings</h3>
                    <div className="space-y-4">
                        {upsellRecommendations.map((upsell, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-black/20 rounded-lg p-1 shrink-0">
                                    <img src={upsell.image} alt={upsell.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">{upsell.reason}</span>
                                    <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white leading-tight mb-1">{upsell.name}</h4>
                                    <span className="text-xs text-gray-500">+${upsell.price.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => onAddToCart({ name: upsell.name, price: upsell.price, imageUrl: upsell.image, category: 'Accessory' }, 1)}
                                    className="w-8 h-8 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
            <div className="bg-white dark:bg-[#1D1D1F] p-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="font-bold text-lg text-[#1D1D1F] dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">Shipping</span>
                    <span className="text-sm text-gray-900 dark:text-white">{amountToFree <= 0 ? 'Free' : 'Calculated at checkout'}</span>
                </div>
                
                <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Secure Checkout
                </button>
                <div className="flex justify-center gap-2 mt-4 opacity-50 grayscale">
                    {/* Simple CC Icons using text/symbols for demo */}
                    <span className="material-symbols-outlined text-xl">credit_card</span>
                    <span className="material-symbols-outlined text-xl">payments</span>
                    <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
            </div>
        )}
      </div>
    </>
  );
};
