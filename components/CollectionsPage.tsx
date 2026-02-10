import React from "react";
import { ShopifyProductGrid } from "./ShopifyProductGrid";


interface CollectionsPageProps {
  onCollectionClick?: () => void;
}

// Data structure defining layout size and content for each collection
const COLLECTIONS_GRID = [
  // Featured / Large Items
  {
    id: "perfume-vials",
    title: "Perfume Vials & Bottles",
    description: "The foundation of fine fragrance. From 1ml samples to 100ml flacons.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaJq01s8u8k7wXQ4u9c36d5m6X6006e8m5e4r9c2k1q7l0j8n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f8g7h6i5j4k3l2m1n0o9p8q7r6s5t4u3v2w1x0y9z8a7b6c5d4e3f2g1h0",
    size: "tall", // row-span-2
    theme: "dark"
  },
  {
    id: "roll-on",
    title: "Roll-On Series",
    description: "Precision fitments for oils and aromatherapy blends.",
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-177c235a.jpg?v=1765653066",
    size: "tall",
    theme: "dark"
  },
  {
    id: "cream-jars",
    title: "Cream Jars & Pumps",
    description: "Heavy-base glass jars designed for premium skincare formulations.",
    image: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-1a5ce90f_1.jpg?v=1765597664",
    size: "wide", // col-span-2
    theme: "light"
  },

  // Standard Items
  {
    id: "sprayers",
    title: "Fine Mist Sprayers",
    description: "Engineered for the perfect cloud.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgc-N6bhQ9qBm4W3cs4_4tpiph1pE7Ps6W5ExSAiF1YfqXhK71QwuIGxFMFFhWvgBv93YT5i5SAJNtEWGMhrB8NhUA8q1Z7Z1km-YkVhE2DrWSyWcJ5zEDQY5dDz2upoSmfpUdFSfjBwmSFA0Qp-kfDhZTbGbYVHUqyjBExt2zauIUdjfydfG3nznSYTVpr_SY0vNhtc-0y0LQChpbRtTMmlo183J17pEKpmR9Uz1Kqbzf0mtujAac8L1EWIPKY3EJJ_CHGjle1jw",
    size: "standard",
    theme: "dark"
  },
  {
    id: "accessories",
    title: "Accessories",
    description: "Caps, collars, and decorative charms.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmPQVN1zfnL-pefbRaXs9ctvZS76b-DQUDFfWr3W7wW1EuQifDsxG8CDn1NGwXO2kEux9cNIgAB_nz4J7Hwsx9pFXmgmMVZ8X6565BTYHYusawwDiNxsWv8S2EHFoe4qtlufVppuTInVOktF60uOjaUvvAla01ITbTj9okzHJc4-aJXJVLhH3csu3sZwIUxGYsBKoV4vVWXXsvPhb7kO0rhzlYI1tMQPMjNkTrhl2G17v2yz__lsA9UbJFVjjH5jXe5U24GNArpkQ",
    size: "standard",
    theme: "dark"
  },
  {
    id: "apothecary",
    title: "Apothecary Styles",
    description: "Vintage aesthetics for modern brands.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDwv4czIreKFOH6Hkf_GaE5eXUqrYlRIuULDQt3PTGXpUBtQtMZGv1BHbkgLdtMr4b3Byo-u_uHouV2wMSMnTywM9B2h2xTzS0EWt8YrCylJHGCrc4P5QkPggb7dqErkf7VakoJ0RFfBK4Akzs_p1--BzLXPJWq097sNBthZaMPmfQa4h28sjAA6yHcS3wnJUX1iic20rXf3LEi8S840N6moqiYIpdDWBrHSlDvDkOrNiYnIdCXquI_M0K11i8XzlYgQKS4oKhsp4",
    size: "standard",
    theme: "dark"
  },

  // Compact / Text-based Items (The "Other Categories")
  { id: "small-bottles", title: "Small Perfume Bottles", size: "compact", icon: "science" },
  { id: "large-bottles", title: "Large Perfume Bottles", size: "compact", icon: "water_drop" },
  { id: "metal-deco", title: "Metal & Beads Deco", size: "compact", icon: "diamond" },
  { id: "metal-shell", title: "Metal Shell Atomizers", size: "compact", icon: "shield" },
  { id: "alum-bottles", title: "Brushed Aluminum", size: "compact", icon: "texture" },
  { id: "plastic-mist", title: "Plastic Mist Sprayers", size: "compact", icon: "spray" },
  { id: "classic-spray", title: "Classic Spray Bottles", size: "compact", icon: "history_edu" },
  { id: "bulb-spray", title: "Antique Bulb Sprayers", size: "compact", icon: "lightbulb" },
  { id: "funnels", title: "Funnels & Droppers", size: "compact", icon: "filter_alt" },
  { id: "pouches", title: "Velveteen Pouches", size: "compact", icon: "shopping_bag" },
  { id: "gift-boxes", title: "Gift Boxes", size: "compact", icon: "card_giftcard" },
  { id: "diffuser", title: "Aromatherapy Diffusers", size: "compact", icon: "air" },
  { id: "bags-boxes", title: "Shipping Supplies", size: "compact", icon: "local_shipping" },
  { id: "closures", title: "Caps & Plugs", size: "compact", icon: "check_circle" },
  { id: "lotion", title: "Lotion Pumps", size: "compact", icon: "water_drop" },
];

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onCollectionClick }) => {
  return (
    <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen">

      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-6 pt-20 pb-12 text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-[#C5A065] uppercase mb-4 block">Our Catalog</span>
        <h1 className="text-5xl md:text-6xl font-serif font-medium text-[#1D1D1F] dark:text-white mb-6">
          The Collection
        </h1>
        <p className="text-[#637588] dark:text-gray-400 max-w-2xl mx-auto text-lg font-light">
          Explore our comprehensive range of glass and packaging solutions. <br className="hidden md:block" />
          Designed for beauty, engineered for performance.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-[1600px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">

          {COLLECTIONS_GRID.map((item, idx) => {
            // Determine Grid Spans based on size
            let spanClasses = "";
            if (item.size === "tall") spanClasses = "sm:row-span-2";
            if (item.size === "wide") spanClasses = "sm:col-span-2";
            if (item.size === "standard") spanClasses = "row-span-1";
            if (item.size === "compact") spanClasses = "row-span-1"; // Compacts share cell size but differ in styling

            return (
              <div
                key={item.id}
                onClick={onCollectionClick}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl ${spanClasses} ${item.size === 'compact' ? 'bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 hover:border-[#C5A065] dark:hover:border-[#C5A065]' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                {/* Render for Image Cards (Tall, Wide, Standard) */}
                {item.image && (
                  <>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300"></div>

                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-serif font-bold mb-2 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/80 text-sm font-light max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                          {item.description}
                        </p>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-sm">arrow_outward</span>
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Render for Compact Cards (No Image, Icon based) */}
                {!item.image && (
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-[#C5A065] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-[#1D1D1F] dark:text-white font-bold text-lg leading-tight group-hover:text-[#C5A065] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-400 mt-2 block flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Products <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* Live Catalog Integration */}
      <div className="max-w-[1600px] mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#C5A065] uppercase mb-4 block">Storefront API</span>
            <h2 className="text-4xl font-serif font-medium text-[#1D1D1F] dark:text-white">Live Production Inventory</h2>
          </div>
        </div>
        <ShopifyProductGrid limit={8} />
      </div>

      {/* Custom Molding Banner */}

      <div className="max-w-[1600px] mx-auto px-6 pb-24">
        <div className="bg-[#1D1D1F] rounded-3xl p-8 md:p-20 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">

          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1D1D1F] to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-20 max-w-2xl">
            <span className="text-[#C5A059] font-bold tracking-widest uppercase text-xs mb-4 block">Bespoke Manufacturing</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Need a custom mold?</h2>
            <p className="text-white/70 text-lg font-light leading-relaxed">
              We specialize in bringing unique visions to life. From 3D rendering to mold fabrication and mass production, partnering with global brands to create iconic silhouettes.
            </p>
          </div>
          <div className="relative z-20">
            <button className="bg-white text-[#1D1D1F] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#C5A059] hover:text-white transition-all shadow-lg transform hover:scale-105 active:scale-95">
              Start Custom Project
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
