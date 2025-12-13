import React from "react";

interface FooterProps {
  onHelpCenterClick?: () => void;
  onContactClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onHelpCenterClick, onContactClick }) => {
  return (
    <footer className="bg-white dark:bg-[#050505] text-[#1D1D1F] dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 transition-colors duration-500 font-sans">
      
      {/* Newsletter Section - Separated for focus */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
                <h3 className="font-serif text-2xl md:text-3xl text-[#1D1D1F] dark:text-white mb-2">Join the Collective</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                    Subscribe to receive updates on new collections, material innovations, and industry insights.
                </p>
            </div>
            <div className="w-full max-w-md">
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="email" 
                        placeholder="Email address" 
                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none transition-colors dark:text-white placeholder:text-gray-400"
                    />
                    <button className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* Main Links Grid */}
      <div className="max-w-[1600px] mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand Column (4 cols) */}
          <div className="col-span-2 lg:col-span-4 flex flex-col items-start pr-0 lg:pr-12">
            <a href="#" className="font-serif text-3xl font-bold text-[#1D1D1F] dark:text-white mb-6 tracking-tight">
              Best Bottles
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-sm mb-8">
              Elevating fragrance through form. We craft premium vessels for brands that understand the power of first impressions.
            </p>
            <div className="flex gap-3">
                 {/* Social Icons */}
                {['facebook', 'instagram', 'linkedin', 'pinterest'].map((social, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#1D1D1F] dark:text-white hover:bg-[#C5A065] hover:text-white transition-all duration-300 group">
                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                            {social === 'facebook' ? 'public' : social === 'instagram' ? 'photo_camera' : social === 'linkedin' ? 'group' : 'push_pin'}
                        </span>
                    </a>
                ))}
            </div>
          </div>

          {/* Links Column 1: Shop (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Collections</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Glass Bottles</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Plastic Series</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Aluminum</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Closures</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Custom Molds</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors text-[#C5A065] block">New Arrivals</a></li>
            </ul>
          </div>

          {/* Links Column 2: Company (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Our Story</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Sustainability</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Journal</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors block">Careers</a></li>
                <li><button onClick={onContactClick} className="hover:text-[#C5A065] transition-colors text-left block">Contact Us</button></li>
            </ul>
          </div>

          {/* Links Column 3: Support (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left block">Help Center</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left block">Shipping Policy</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left block">Returns & Exchanges</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left block">Wholesale Account</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left block">Track Order</button></li>
            </ul>
          </div>
          
           {/* Contact Detail Column (2 cols) */}
           <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Get in Touch</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3 group cursor-default">
                    <span className="material-symbols-outlined text-lg mt-0.5 text-[#C5A065] group-hover:scale-110 transition-transform">location_on</span>
                    <span>Nemat International, Inc.<br/>34135 7th St<br/>Union City, CA 94587</span>
                </li>
                <li className="flex items-center gap-3 group cursor-default">
                    <span className="material-symbols-outlined text-lg text-[#C5A065] group-hover:scale-110 transition-transform">call</span>
                    <span>(800) 936-3628</span>
                </li>
                <li className="flex items-center gap-3 group cursor-default">
                    <span className="material-symbols-outlined text-lg text-[#C5A065] group-hover:scale-110 transition-transform">fax</span>
                    <span>(510) 751-4980</span>
                </li>
                <li className="flex items-center gap-3 group cursor-default">
                    <span className="material-symbols-outlined text-lg text-[#C5A065] group-hover:scale-110 transition-transform">mail</span>
                    <a href="mailto:sales@nematinternational.com" className="hover:text-[#C5A065] transition-colors text-xs">sales@nematinternational.com</a>
                </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0A]">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs font-medium text-gray-400">
                &copy; 2024 Best Bottles Inc. All rights reserved.
            </div>
            
            <div className="flex gap-8 text-xs font-bold uppercase tracking-wider text-gray-500">
                <a href="#" className="hover:text-[#C5A065] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#C5A065] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#C5A065] transition-colors">Sitemap</a>
            </div>
        </div>
      </div>

    </footer>
  );
};