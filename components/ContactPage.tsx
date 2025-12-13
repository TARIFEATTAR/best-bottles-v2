import React, { useState } from "react";
import { Reveal } from "./Reveal";

interface ContactPageProps {
  onBack?: () => void;
}

type InquiryType = 'general' | 'samples' | 'custom' | 'packaging' | 'wholesale';

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [inquiryType, setInquiryType] = useState<InquiryType>('general');
  const [formState, setFormState] = useState({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      message: '',
      // Dynamic fields
      address: '',
      quantity: '',
      timeline: '',
      liquidType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState({
          ...formState,
          [e.target.name]: e.target.value
      });
  };

  return (
    <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen font-sans">
      
      {/* Hero Section */}
      <div className="pt-32 pb-12 px-6 text-center bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <span className="text-[#C5A065] font-bold tracking-[0.2em] uppercase text-xs mb-4 block animate-fade-up">Master Intake</span>
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-[#1D1D1F] dark:text-white mb-6 animate-fade-up delay-100">
          Start Your Project
        </h1>
        <p className="text-[#637588] dark:text-gray-400 max-w-2xl mx-auto text-lg font-light animate-fade-up delay-200">
           One form for everything. Tell us what you need—from custom manufacturing to contract packaging—and our team will route it to the right specialist.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Left Column: Contact Information */}
            <div className="lg:col-span-4 space-y-12 order-2 lg:order-1">
                <Reveal>
                    <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-serif text-xl font-bold text-[#1D1D1F] dark:text-white mb-6">Direct Channels</h3>
                        
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#C5A065]">
                                    <span className="material-symbols-outlined text-sm">call</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Toll Free</p>
                                    <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">(800) 936-3628</p>
                                    <p className="text-xs text-gray-500 mt-1">M-F, 9:30am - 5:30pm PST</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#C5A065]">
                                    <span className="material-symbols-outlined text-sm">phone_iphone</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Local / Fax</p>
                                    <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">Tel: 510-445-0300</p>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fax: 510-751-4980</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#C5A065]">
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                    <a href="mailto:sales@nematinternational.com" className="text-sm font-medium text-[#1D1D1F] dark:text-white hover:text-[#C5A065] transition-colors">sales@nematinternational.com</a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#C5A065]">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Headquarters</p>
                                    <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                                        Nemat International, Inc.<br/>
                                        34135 7th St<br/>
                                        Union City, CA 94587
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="relative overflow-hidden rounded-2xl aspect-[4/3] group">
                        <img 
                            src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-48628740_1.jpg?v=1765524503" 
                            alt="Showroom" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 p-8 flex flex-col justify-end">
                            <h4 className="text-white font-serif text-xl font-bold">Visit our Showroom</h4>
                            <p className="text-white/80 text-sm mt-2">Appointments available for commercial clients.</p>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Right Column: Master Intake Form */}
            <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
                    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                        
                        {/* 1. Inquiry Type Selector */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">I am looking for...</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'general', label: 'General Inquiry', icon: 'chat' },
                                    { id: 'samples', label: 'Request Samples', icon: 'science' },
                                    { id: 'custom', label: 'Custom Manufacturing', icon: 'construction' },
                                    { id: 'packaging', label: 'Contract Packaging', icon: 'conveyor_belt' },
                                    { id: 'wholesale', label: 'Wholesale Application', icon: 'store' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setInquiryType(type.id as InquiryType)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                                            inquiryType === type.id 
                                            ? 'bg-[#1D1D1F] border-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F]' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#C5A065]'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined ${inquiryType === type.id ? 'text-[#C5A065]' : 'text-gray-400'}`}>
                                            {type.icon}
                                        </span>
                                        <span className="text-sm font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Core Information (Always Visible) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">First Name</label>
                                <input name="firstName" onChange={handleInputChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors bg-transparent" placeholder="Jane" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Last Name</label>
                                <input name="lastName" onChange={handleInputChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors bg-transparent" placeholder="Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</label>
                                <input name="email" onChange={handleInputChange} type="email" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors bg-transparent" placeholder="jane@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Company Name (Optional)</label>
                                <input name="company" onChange={handleInputChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors bg-transparent" placeholder="Acme Co." />
                            </div>
                        </div>

                        {/* 3. Dynamic Fields based on Inquiry Type */}
                        
                        {/* Samples Specific */}
                        {inquiryType === 'samples' && (
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl animate-fade-up">
                                <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#C5A065]">local_shipping</span> Shipping Details
                                </h4>
                                <div className="space-y-4">
                                    <input name="address" onChange={handleInputChange} type="text" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A065]" placeholder="Full Shipping Address" />
                                    <p className="text-[10px] text-gray-500">*Note: Sample fees may apply. A representative will contact you with a payment link if required.</p>
                                </div>
                            </div>
                        )}

                        {/* Custom Manufacturing Specific */}
                        {inquiryType === 'custom' && (
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl animate-fade-up">
                                <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#C5A065]">factory</span> Project Specs
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Est. Quantity</label>
                                        <select name="quantity" onChange={handleInputChange} className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A065]">
                                            <option>Select Quantity...</option>
                                            <option>1,000 - 5,000 units</option>
                                            <option>5,000 - 10,000 units</option>
                                            <option>10,000+ units</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Desired Timeline</label>
                                        <input name="timeline" onChange={handleInputChange} type="text" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A065]" placeholder="e.g. Q4 2024" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contract Packaging Specific */}
                        {inquiryType === 'packaging' && (
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-xl animate-fade-up">
                                <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#C5A065]">liquids</span> Filling Requirements
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="liquidType" onChange={handleInputChange} type="text" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A065]" placeholder="Liquid Type (e.g. Perfume Oil)" />
                                    <select name="quantity" onChange={handleInputChange} className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#C5A065]">
                                        <option>Batch Size...</option>
                                        <option>100 - 500 units</option>
                                        <option>500 - 2,000 units</option>
                                        <option>2,000+ units</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Message Box */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {inquiryType === 'general' ? 'Message' : 'Additional Details'}
                            </label>
                            <textarea 
                                name="message" 
                                onChange={handleInputChange}
                                rows={4} 
                                className="w-full bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-700 px-3 py-3 text-sm focus:border-[#C5A065] outline-none transition-colors bg-transparent resize-none" 
                                placeholder={inquiryType === 'samples' ? "Please list the specific SKU(s) you would like to sample..." : "Tell us more about your project goals..."}
                            ></textarea>
                        </div>

                        <button className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg w-full md:w-auto">
                            Submit Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};