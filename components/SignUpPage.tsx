import React from "react";
import { Reveal } from "./Reveal";

interface SignUpPageProps {
  onBack?: () => void;
  onLoginClick?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onBack, onLoginClick }) => {
  return (
    <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen font-sans">
      
      {/* Navigation / Header Stub */}
      <div className="max-w-[1440px] mx-auto px-6 py-6 text-xs text-gray-500 flex items-center justify-between">
        <button onClick={onBack} className="hover:text-[#C5A065] transition-colors flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Shop
        </button>
        <span className="text-gray-400">Wholesale Application</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column: Information & Policies */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <Reveal>
                <div className="mb-12">
                    <span className="text-[#C5A065] font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Partner Program</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#1D1D1F] dark:text-white mb-6">
                        Join our network of distributors.
                    </h1>
                    <p className="text-[#637588] dark:text-gray-400 text-lg font-light leading-relaxed">
                        We build lasting partnerships with businesses that value quality. 
                        Please review our operating protocols before applying for a wholesale account.
                    </p>
                </div>
            </Reveal>

            <div className="space-y-10">
                <Reveal delay={0.1}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shrink-0">
                            <span className="material-symbols-outlined">shopping_cart</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white mb-2">Ordering Protocol</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">
                                Ordering online is faster and more accurate. To minimize errors, we request all customers to place orders exclusively through our digital portal. 
                            </p>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shrink-0">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white mb-2">Order Minimums</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">
                                There is a <strong className="text-[#1D1D1F] dark:text-white">$50.00 minimum order requirement</strong>. This amount does not include shipping charges. 
                            </p>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.3}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shrink-0">
                            <span className="material-symbols-outlined">science</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white mb-2">Sample Policy</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed mb-2">
                                Customers with verified businesses can purchase sample orders below the minimum.
                            </p>
                            <a href="mailto:sales@nematinternational.com" className="text-xs font-bold uppercase tracking-widest text-[#1D1D1F] dark:text-white border-b border-[#1D1D1F] hover:text-[#C5A065] hover:border-[#C5A065] transition-colors">
                                Request Samples via Email
                            </a>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.4}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shrink-0">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#1D1D1F] dark:text-white mb-2">Stock & Inventory</h3>
                            <p className="text-sm text-[#637588] dark:text-gray-400 leading-relaxed">
                                ETAs are provided on product pages. Note that some items may be discontinued by manufacturers; we strive to keep our catalog up to date.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">Support Contact</h4>
                <p className="text-sm text-[#1D1D1F] dark:text-white font-medium">1-800-936-3628</p>
                <p className="text-sm text-gray-500 mb-2">sales@nematinternational.com</p>
                <p className="text-xs text-gray-400">Mon – Fri, 9:30am to 5:30pm, PST</p>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white dark:bg-[#1E1E1E] p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 sticky top-24">
                <div className="flex justify-between items-start mb-8">
                    <h2 className="font-serif text-2xl font-bold text-[#1D1D1F] dark:text-white">Business Application</h2>
                    <button 
                        onClick={onLoginClick} 
                        className="text-xs font-bold uppercase tracking-widest text-[#C5A065] hover:underline mt-2"
                    >
                        Already have an account?
                    </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Section: Contact Info */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Primary Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">First Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Last Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Business Info */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 pt-2">Company Details</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Company Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Business Type</label>
                                    <select className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white">
                                        <option>Select Type...</option>
                                        <option>Wholesale Distributor</option>
                                        <option>Manufacturer</option>
                                        <option>Retailer (Brick & Mortar)</option>
                                        <option>Online Retailer</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Tax ID / Reseller Permit</label>
                                    <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" placeholder="Optional for inquiry" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Email Address (Login)</label>
                                <input type="email" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Create Password</label>
                                <input type="password" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-[#C5A065] dark:text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-lg">
                            Apply for Account
                        </button>
                        <p className="text-[10px] text-gray-400 text-center mt-4">
                            By applying, you agree to our Terms of Service. Applications are typically reviewed within 24 business hours.
                        </p>
                    </div>

                </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};