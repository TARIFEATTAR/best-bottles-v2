import React from "react";

interface FooterProps {
  onHelpCenterClick?: () => void;
  onContactClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onHelpCenterClick, onContactClick }) => {
  return (
    <footer className="bg-[#EBE7DD] dark:bg-[#0F0F0F] text-[#1D1D1F] dark:text-gray-400 border-t border-[#D2D2D7] dark:border-gray-800 transition-colors duration-500">
      
      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Brand Column (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <a href="#" className="font-serif text-3xl font-semibold text-[#1D1D1F] dark:text-white mb-6 tracking-tight">
              Best Bottles
            </a>
            <p className="text-sm font-light leading-relaxed max-w-xs mb-8">
              Elevating fragrance through form. We craft premium vessels for brands that understand the power of first impressions.
            </p>
            <div className="mt-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C5A065] mb-2">Headquarters</p>
                <p className="text-sm leading-relaxed">
                    1200 Glassworks Blvd<br/>
                    Milan, Italy 20121
                </p>
                <p className="text-sm mt-2">+39 02 5550 1234</p>
            </div>
          </div>

          {/* Links Column 1 (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Collections</h4>
            <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Glass Bottles</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Plastic Series</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Aluminum</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Closures</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Custom Molds</a></li>
            </ul>
          </div>

          {/* Links Column 2 (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Journal</a></li>
                <li><a href="#" className="hover:text-[#C5A065] transition-colors">Careers</a></li>
                <li><button onClick={onContactClick} className="hover:text-[#C5A065] transition-colors text-left">Contact</button></li>
            </ul>
          </div>

          {/* Links Column 3 (2 cols) - Customer Service */}
          <div className="md:col-span-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1D1D1F] dark:text-white mb-6">Customer Service</h4>
            <ul className="space-y-4 text-sm cursor-pointer">
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left">Help Center</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left">Shipping Details</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left">Returns & Exchanges</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={onHelpCenterClick} className="hover:text-[#C5A065] transition-colors text-left">Terms of Service</button></li>
            </ul>
          </div>

          {/* Newsletter Column (3 cols) */}
          <div className="md:col-span-3 bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-serif text-xl text-[#1D1D1F] dark:text-white mb-2">Stay in the loop</h4>
            <p className="text-xs text-gray-500 mb-6">New arrivals, material innovations, and industry trends.</p>
            
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="email" 
                    placeholder="Email address" 
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors dark:text-white placeholder:text-gray-400"
                />
                <button className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity mt-2">
                    Subscribe
                </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-4 text-center">
                By subscribing you agree to our <a href="#" className="underline hover:text-[#C5A065]">Privacy Policy</a>.
            </p>
          </div>

        </div>
      </div>

      {/* Sub Footer */}
      <div className="border-t border-[#D2D2D7] dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs font-medium opacity-60">
                &copy; 2024 Best Bottles Inc. All rights reserved.
            </div>
            
            <div className="flex gap-6 text-xs font-bold uppercase tracking-wider opacity-80">
                <a href="#" className="hover:text-[#C5A065] transition-colors">Sitemap</a>
            </div>

            <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#C5A065] hover:border-[#C5A065] hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h-.165zm-1.44 6.75a5.16 5.16 0 100 10.32 5.16 5.16 0 000-10.32zm0 1.93a3.23 3.23 0 110 6.46 3.23 3.23 0 010-6.46zm6.26-2.31a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd"></path></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#C5A065] hover:border-[#C5A065] hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#C5A065] hover:border-[#C5A065] hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                </a>
            </div>
        </div>
      </div>

    </footer>
  );
};