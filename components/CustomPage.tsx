import React from "react";

export const CustomPage: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-background-dark min-h-screen font-sans">
      
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1615634260167-c8c9c313880b?auto=format&fit=crop&q=80&w=2000"
                className="w-full h-full object-cover opacity-90"
                alt="Metal Atomizers"
             />
             <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
             <span className="text-gold text-sm font-bold tracking-[0.2em] uppercase mb-4 block animate-fade-up">Bespoke Offering</span>
             <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 animate-fade-up delay-100">
                Personalized <br/> Metal Shell Atomizers
             </h1>
             <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto animate-fade-up delay-200">
                Elevate your brand with our signature metal-encased atomizers. 
                Fully customizable finishes, engraving, and tactile patterns designed for luxury portability.
             </p>
             <button className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold transition-colors animate-fade-up delay-300">
                Request a Sample Kit
             </button>
        </div>
      </div>

      {/* The Product Showcase */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif text-text-light dark:text-text-dark mb-4">The Art of Metal</h2>
            <p className="text-text-gray max-w-2xl mx-auto">
                We specialize in creating high-quality aluminum and brass shells that protect the glass vial inside while offering an unmatched tactile experience.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
             <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
                <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmPQVN1zfnL-pefbRaXs9ctvZS76b-DQUDFfWr3W7wW1EuQifDsxG8CDn1NGwXO2kEux9cNIgAB_nz4J7Hwsx9pFXmgmMVZ8X6565BTYHYusawwDiNxsWv8S2EHFoe4qtlufVppuTInVOktF60uOjaUvvAla01ITbTj9okzHJc4-aJXJVLhH3csu3sZwIUxGYsBKoV4vVWXXsvPhb7kO0rhzlYI1tMQPMjNkTrhl2G17v2yz__lsA9UbJFVjjH5jXe5U24GNArpkQ" 
                    alt="Gold Finish"
                    className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                />
             </div>
             <div>
                <span className="text-gold font-bold uppercase tracking-widest text-xs mb-2 block">01. Finishes</span>
                <h3 className="text-3xl font-serif mb-6 text-text-light dark:text-text-dark">Signature Finishes</h3>
                <p className="text-text-gray mb-8 leading-relaxed">
                    Choose from our library of premium anodized and plated finishes. Whether you desire the warmth of Rose Gold, the industrial edge of Brushed Gunmetal, or the classic elegance of Polished Silver, we ensure consistency across every unit.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {['Polished Gold', 'Brushed Silver', 'Matte Black', 'Rose Gold', 'Gunmetal', 'Champagne'].map(finish => (
                        <div key={finish} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full shadow-sm border border-gray-200" style={{
                                background: finish.includes('Gold') ? '#FFD700' : 
                                           finish.includes('Silver') ? '#C0C0C0' : 
                                           finish.includes('Black') ? '#222' : 
                                           finish.includes('Rose') ? '#B76E79' : 
                                           finish.includes('Champagne') ? '#F7E7CE' : '#555'
                            }}></div>
                            <span className="text-sm font-medium text-text-light dark:text-text-dark">{finish}</span>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1">
                <span className="text-gold font-bold uppercase tracking-widest text-xs mb-2 block">02. Branding</span>
                <h3 className="text-3xl font-serif mb-6 text-text-light dark:text-text-dark">Personalized Engraving</h3>
                <p className="text-text-gray mb-8 leading-relaxed">
                    Laser engraving transforms our metal shell atomizers into distinct, personalized keepsakes. Perfect for fragrance promotions, wedding favors, or corporate gifting, these high-quality, useful vessels offer a unique way to ensure your brand or special event is remembered long after the moment has passed.
                </p>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                        <div>
                            <strong className="block text-text-light dark:text-text-dark text-sm">Laser Etching</strong>
                            <span className="text-xs text-text-gray">Permanent, high-contrast marking ideal for logos.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                        <div>
                            <strong className="block text-text-light dark:text-text-dark text-sm">Embossing/Debossing</strong>
                            <span className="text-xs text-text-gray">Add physical texture to the metal shell.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gold mt-1">check_circle</span>
                        <div>
                            <strong className="block text-text-light dark:text-text-dark text-sm">Custom Colors</strong>
                            <span className="text-xs text-text-gray">Pantone matching available for orders &gt;5k units.</span>
                        </div>
                    </li>
                </ul>
             </div>
             <div className="order-1 md:order-2 aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
                <img 
                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537" 
                    alt="Laser Engraved Metal Shell Atomizer"
                    className="w-full h-full object-cover"
                />
             </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="bg-[#F5F5F7] dark:bg-[#1A1D21] py-24 px-6">
         <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif text-center mb-16 text-text-light dark:text-text-dark">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gold mb-4">straighten</span>
                    <h4 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">Capacities</h4>
                    <p className="text-sm text-text-gray">Available in standard travel sizes:</p>
                    <div className="flex gap-2 mt-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold">5ml</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold">8ml</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold">10ml</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gold mb-4">science</span>
                    <h4 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">Inner Vial</h4>
                    <p className="text-sm text-text-gray">
                        High-grade borosilicate glass insert ensures zero chemical interaction with your fragrance. Leak-proof screw top.
                    </p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gold mb-4">settings</span>
                    <h4 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">Mechanism</h4>
                    <p className="text-sm text-text-gray">
                        Smooth twist-up action. No cap to lose. Fine mist sprayer optimized for perfume and cologne.
                    </p>
                </div>
            </div>
         </div>
      </section>

      {/* CTA / Contact Form */}
      <section className="py-24 px-6 max-w-3xl mx-auto text-center">
          <span className="text-gold text-xs font-bold uppercase tracking-widest mb-4 block">Start Your Project</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light dark:text-text-dark mb-6">Ready to create?</h2>
          <p className="text-text-gray mb-10 text-lg font-light">
              Connect with our design team to discuss your custom metal atomizer project. 
              Minimum order quantity starts at 1,000 units for custom finishes.
          </p>
          
          <form className="space-y-4 text-left bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold uppercase text-text-gray mb-2">Name</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold uppercase text-text-gray mb-2">Email</label>
                      <input type="email" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gold" />
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold uppercase text-text-gray mb-2">Project Details</label>
                  <textarea rows={4} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-gold" placeholder="Tell us about your quantity, desired finish, and timeline..."></textarea>
              </div>
              <button type="button" className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] font-bold uppercase tracking-widest text-sm py-4 rounded-lg hover:opacity-90 transition-opacity">
                  Submit Inquiry
              </button>
          </form>
      </section>

    </div>
  );
};
