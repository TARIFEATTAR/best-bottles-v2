import React from "react";
import { Reveal } from "./Reveal";

interface ContractPackagingPageProps {
  onBack?: () => void;
  onContactClick?: () => void;
}

export const ContractPackagingPage: React.FC<ContractPackagingPageProps> = ({ onBack, onContactClick }) => {
  return (
    <div className="w-full bg-white dark:bg-background-dark min-h-screen font-sans">
      
      {/* 1. Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#1D1D1F]">
         <div className="absolute inset-0 opacity-40">
             <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
                alt="Laboratory Filling" 
                className="w-full h-full object-cover"
             />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#1D1D1F] via-transparent to-transparent"></div>
         
         <div className="relative z-10 text-center px-6 max-w-4xl">
             <button onClick={onBack} className="absolute top-[-100px] left-0 text-white/50 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                 <span className="material-symbols-outlined text-sm">arrow_back</span> Back
             </button>
             
             <Reveal>
                <span className="text-[#C5A059] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Small Quantity Services</span>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                    Contract Packaging
                </h1>
                <p className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                    Filling, capping, labeling, and packaging services for small runs. 
                    We specialize in quantities from hundreds to a few thousand bottles.
                </p>
             </Reveal>
         </div>
      </div>

      {/* 2. Intro Text */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-serif text-[#1D1D1F] dark:text-white mb-6">
                Not just bottles—we offer complete solutions.
            </h2>
            <p className="text-[#637588] dark:text-gray-400 leading-relaxed text-lg">
                Our facilities are designed for filling perfumes and fragrant materials. 
                <span className="block mt-2 italic text-sm text-gray-400">*We are not approved for filling or handling any pharmaceuticals.</span>
            </p>
          </Reveal>
      </section>

      {/* 3. Capabilities Grid */}
      <section className="bg-[#F9F8F6] dark:bg-[#161616] py-24 px-6">
          <div className="max-w-[1440px] mx-auto">
              <Reveal>
                  <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                      <h2 className="text-3xl font-serif text-[#1D1D1F] dark:text-white">Our Capabilities</h2>
                      <div className="h-[1px] bg-gray-300 dark:bg-gray-700 w-full md:w-1/2 mb-2"></div>
                  </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Filling */}
                  <Reveal delay={0.1}>
                      <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 h-full">
                          <span className="material-symbols-outlined text-4xl text-[#C5A059] mb-4">water_drop</span>
                          <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mb-3">Precision Filling</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                              We have the capability to fill small perfume vials with capacities of 1ml to bottles with capacities up to 150ml.
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              <li>• Sample Vials (1ml)</li>
                              <li>• Roll-on Bottles (5ml - 10ml)</li>
                              <li>• Spray Bottles (up to 150ml)</li>
                          </ul>
                      </div>
                  </Reveal>

                  {/* Capping */}
                  <Reveal delay={0.2}>
                      <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 h-full">
                          <span className="material-symbols-outlined text-4xl text-[#C5A059] mb-4">settings</span>
                          <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mb-3">Capping & Plugging</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                             Specialized handling for delicate closures.
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              <li>• 1ml vials plugged in trays</li>
                              <li>• Torque-controlled screw capping</li>
                              <li>• Hand application for large formats</li>
                              <li>• Roll-on plug insertion</li>
                          </ul>
                      </div>
                  </Reveal>

                  {/* Labeling */}
                  <Reveal delay={0.3}>
                      <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 h-full">
                          <span className="material-symbols-outlined text-4xl text-[#C5A059] mb-4">label</span>
                          <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mb-3">Labeling & Printing</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                              From machine labeling for cylindrical bottles to hand application for rectangular formats.
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              <li>• Screen Printing (High bond)</li>
                              <li>• Laser Engraving (Metal Shells)</li>
                              <li>• Roll-label application</li>
                          </ul>
                      </div>
                  </Reveal>
              </div>
          </div>
      </section>

      {/* 4. Minimum Quantities Table */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-serif text-[#1D1D1F] dark:text-white mb-8 text-center">Minimum Quantity Requirements</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-[#1D1D1F] dark:border-white">
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-[#1D1D1F] dark:text-white">Bottle Type / Capacity</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-[#1D1D1F] dark:text-white">MOQ Per Fragrance</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600 dark:text-gray-300">
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td className="py-4 px-4 font-medium">Sample vials (up to 1ml)</td>
                            <td className="py-4 px-4">1,000 pieces</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
                            <td className="py-4 px-4 font-medium">Roll-on Bottles (5ml - 10ml)</td>
                            <td className="py-4 px-4">500 pieces</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td className="py-4 px-4 font-medium">1/2oz Cylindrical or Rectangular</td>
                            <td className="py-4 px-4">500 pieces</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
                            <td className="py-4 px-4 font-medium">1oz - 2oz Bottles</td>
                            <td className="py-4 px-4">300 pieces</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td className="py-4 px-4 font-medium">3oz to 6oz and Larger</td>
                            <td className="py-4 px-4">200 pieces</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30 text-sm text-gray-600 dark:text-gray-400">
                <strong>Pricing Note:</strong> Pricing depends on quantity, liquid type, closure type, and packing requirements. 
                A custom quote will be provided based on your project complexity.
            </div>
          </Reveal>
      </section>

      {/* 5. Resources / Partners */}
      <section className="bg-[#1D1D1F] text-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                  <span className="material-symbols-outlined text-4xl text-[#C5A059] mb-6">handshake</span>
                  <h2 className="text-3xl font-serif mb-6">Trusted Partners</h2>
                  <p className="text-white/70 mb-12">
                      While we handle the filling and packaging, we recommend these partners for high-quality labels and boxes. 
                      Nemat International does not manufacture paper goods directly.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <a href="#" className="block bg-white/10 hover:bg-white/20 p-6 rounded-xl transition-colors">
                          <h4 className="font-bold mb-2">Paper and Ink Printing</h4>
                          <span className="text-xs text-[#C5A065] uppercase tracking-wide">Printing Services</span>
                      </a>
                      <a href="#" className="block bg-white/10 hover:bg-white/20 p-6 rounded-xl transition-colors">
                          <h4 className="font-bold mb-2">McKenzie Crest</h4>
                          <span className="text-xs text-[#C5A065] uppercase tracking-wide">Custom Boxes</span>
                      </a>
                      <a href="#" className="block bg-white/10 hover:bg-white/20 p-6 rounded-xl transition-colors">
                          <h4 className="font-bold mb-2">Box Co-op</h4>
                          <span className="text-xs text-[#C5A065] uppercase tracking-wide">Retail Packaging</span>
                      </a>
                  </div>
              </Reveal>
          </div>
      </section>

      {/* 6. CTA */}
      <section className="py-24 px-6 text-center">
          <h2 className="text-3xl font-serif text-[#1D1D1F] dark:text-white mb-8">Ready to start your filling project?</h2>
          <button 
            onClick={onContactClick}
            className="bg-[#C5A059] text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-[#C5A059] transition-colors"
          >
              Request a Quote
          </button>
      </section>

    </div>
  );
};