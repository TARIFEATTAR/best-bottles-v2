import React from "react";

interface ContactPageProps {
  onBack?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  return (
    <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen font-sans">
      
      {/* Hero Section */}
      <div className="pt-32 pb-12 px-6 text-center bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <span className="text-[#C5A065] font-bold tracking-[0.2em] uppercase text-xs mb-4 block animate-fade-up">Get in Touch</span>
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-[#1D1D1F] dark:text-white mb-6 animate-fade-up delay-100">
          Contact Us
        </h1>
        <p className="text-[#637588] dark:text-gray-400 max-w-2xl mx-auto text-lg font-light animate-fade-up delay-200">
           Our team is available to assist with custom orders, wholesale inquiries, and technical specifications.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column: Contact Information */}
            <div className="p-8 md:p-16 lg:p-24 bg-[#F9F8F6] dark:bg-background-dark flex flex-col justify-center">
                <div className="space-y-12">
                    
                    {/* Address Block */}
                    <div className="flex gap-6 group">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-bold text-[#1D1D1F] dark:text-white mb-2">Headquarters</h3>
                            <address className="not-italic text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                Nemat International ®, Inc.<br />
                                34135 7th St<br />
                                Union City, CA 94587<br />
                                United States
                            </address>
                        </div>
                    </div>

                    {/* Phone/Fax Block */}
                    <div className="flex gap-6 group">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">call</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-bold text-[#1D1D1F] dark:text-white mb-2">Phone & Fax</h3>
                            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm space-y-1">
                                <p><span className="font-bold text-[#1D1D1F] dark:text-white w-20 inline-block">Toll Free:</span> (800)-936-3628</p>
                                <p><span className="font-bold text-[#1D1D1F] dark:text-white w-20 inline-block">Local:</span> 510-445-0300</p>
                                <p><span className="font-bold text-[#1D1D1F] dark:text-white w-20 inline-block">Fax:</span> 510-751-4980</p>
                            </div>
                        </div>
                    </div>

                    {/* Email/Hours Block */}
                    <div className="flex gap-6 group">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#C5A065] shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-bold text-[#1D1D1F] dark:text-white mb-2">Hours & Email</h3>
                            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm space-y-1">
                                <p><a href="mailto:sales@nematinternational.com" className="hover:text-[#C5A065] transition-colors underline decoration-gray-300 underline-offset-4">sales@nematinternational.com</a></p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">Office Hours</p>
                                <p>Mon - Fri: 9:30 AM - 5:30 PM PST</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="p-8 md:p-16 lg:p-24 bg-white dark:bg-surface-dark border-l border-gray-100 dark:border-gray-800">
                <h2 className="font-serif text-3xl font-bold text-[#1D1D1F] dark:text-white mb-8">Send us a message</h2>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-0 py-3 text-sm focus:border-[#C5A065] focus:ring-0 outline-none transition-colors bg-transparent" placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-0 py-3 text-sm focus:border-[#C5A065] focus:ring-0 outline-none transition-colors bg-transparent" placeholder="Doe" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                        <input type="email" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-0 py-3 text-sm focus:border-[#C5A065] focus:ring-0 outline-none transition-colors bg-transparent" placeholder="jane@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Topic</label>
                        <select className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 px-0 py-3 text-sm focus:border-[#C5A065] focus:ring-0 outline-none transition-colors cursor-pointer">
                            <option>General Inquiry</option>
                            <option>Wholesale Order</option>
                            <option>Custom Manufacturing</option>
                            <option>Order Status</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                        <textarea rows={4} className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-0 py-3 text-sm focus:border-[#C5A065] focus:ring-0 outline-none transition-colors bg-transparent resize-none" placeholder="How can we help you today?"></textarea>
                    </div>

                    <button className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg mt-4 w-full md:w-auto">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[500px] bg-gray-200 relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3156.974550186591!2d-122.03450908468494!3d37.58559197979434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fbf90a8806297%3A0x6968037380e22728!2s34135%207th%20St%2C%20Union%20City%2C%20CA%2094587!5e0!3m2!1sen!2sus!4v1697230000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(100%) invert(0%) contrast(85%)' }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Nemat International Location"
            className="w-full h-full"
          ></iframe>
          
          {/* Decorative Overlay on Map */}
          <div className="absolute bottom-8 left-8 bg-white dark:bg-[#1D1D1F] p-6 rounded-xl shadow-2xl max-w-xs hidden md:block">
              <span className="text-[#C5A065] font-bold uppercase tracking-widest text-[10px] mb-2 block">Visit Us</span>
              <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                  We welcome appointments for showroom visits. Please call ahead to schedule.
              </p>
          </div>
      </div>

    </div>
  );
};