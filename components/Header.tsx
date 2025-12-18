
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";

interface HeaderProps {
    onHomeClick?: () => void;
    onConsultationClick?: () => void;
    onCollectionsClick?: () => void;
    onCustomClick?: () => void;
    onJournalClick?: () => void;
    onLoginClick?: () => void;
    onSignUpClick?: () => void;
    onCartClick?: () => void;
    onContactClick?: () => void;
    onHelpCenterClick?: () => void;
    onFeaturesClick?: () => void;
    cartCount?: number;
    language?: 'en' | 'fr';
    onLanguageChange?: (lang: 'en' | 'fr') => void;
}

export const Header: React.FC<HeaderProps> = ({
    onHomeClick,
    onConsultationClick,
    onCollectionsClick,
    onCustomClick,
    onJournalClick,
    onLoginClick,
    onSignUpClick,
    onCartClick,
    onContactClick,
    onHelpCenterClick,
    onFeaturesClick,
    cartCount = 0,
    language = 'en',
    onLanguageChange
}) => {
    // We use a string to track WHICH menu is open: 'shop', 'collections', or null
    const [activeMenu, setActiveMenu] = useState<'shop' | 'collections' | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mobile Expanded States
    const [mobileExpanded, setMobileExpanded] = useState<{ [key: string]: boolean }>({});

    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Grace Voice State
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
    const elevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

    const conversation = useConversation({
        onConnect: () => {
            console.log("✅ Grace connected in Header");
            setVoiceStatus('listening');
        },
        onDisconnect: () => {
            console.log("❌ Grace disconnected");
            setVoiceStatus('idle');
        },
        onMessage: (message) => {
            console.log("📨 Grace:", message);
            // Check for navigation triggers
            if (message.message) {
                const lower = message.message.toLowerCase();
                if (lower.includes('configurator') || lower.includes('specialist') || lower.includes('builder')) {
                    setTimeout(() => {
                        conversation.endSession();
                        onConsultationClick?.();
                    }, 2000);
                }
            }
        },
        onError: (error) => {
            console.error("❌ Grace error:", error);
            setVoiceStatus('idle');
        },
    });

    const isGraceListening = conversation.status === 'connected';
    const isGraceConnecting = conversation.status === 'connecting';

    const startGraceVoice = async () => {
        if (isGraceListening) {
            await conversation.endSession();
            return;
        }
        if (!elevenLabsAgentId) {
            alert('Please add VITE_ELEVENLABS_AGENT_ID to your .env file');
            return;
        }
        try {
            setVoiceStatus('connecting');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await conversation.startSession({ agentId: elevenLabsAgentId } as any);
        } catch (e) {
            console.error("Failed to start Grace:", e);
            setVoiceStatus('idle');
            alert('Could not access microphone. Please allow microphone permissions.');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMouseEnter = (menu: 'shop' | 'collections') => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveMenu(menu);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveMenu(null);
        }, 150);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setMobileExpanded({}); // Reset expansion on close/open toggle
    };

    const toggleMobileSection = (section: string) => {
        setMobileExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="sticky top-0 z-50 bg-white dark:bg-[#151515] transition-colors duration-300">

            <header className="border-b border-gray-200 dark:border-gray-800 shadow-sm relative bg-white dark:bg-[#151515]">
                <div className="max-w-[1800px] mx-auto">

                    {/* TOP ROW: Logo | Search | Actions */}
                    <div className="flex items-center justify-between px-6 py-5 gap-4 md:gap-8">

                        {/* Mobile Hamburger */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 -ml-2 text-text-light dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        {/* 1. Logo */}
                        <a
                            className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-text-light dark:text-text-dark cursor-pointer flex-shrink-0 uppercase"
                            href="#"
                            onClick={(e) => { e.preventDefault(); onHomeClick?.(); }}
                        >
                            Best Bottles
                        </a>

                        {/* 2. Large Search Bar with Grace Voice (Center) */}
                        <div className="hidden md:flex flex-1 max-w-2xl relative mx-auto items-center gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none transition-all text-sm text-text-light dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500"
                                />
                            </div>

                            {/* Grace Voice Button - Elegant Navbar Version */}
                            <button
                                onClick={startGraceVoice}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 shadow-sm border ${isGraceListening
                                    ? "bg-[#1D1D1F] text-white border-transparent"
                                    : "bg-white dark:bg-[#1D1D1F] text-[#C5A065] border-[#C5A065]/30 hover:border-[#C5A065] hover:bg-[#fcfbf9] dark:hover:bg-[#252528]"
                                    }`}
                                title={isGraceListening ? "End conversation with Grace" : "Talk to Grace"}
                            >
                                {isGraceListening ? (
                                    <>
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                                        <span className="text-xs font-bold uppercase tracking-widest hidden lg:block">
                                            Grace Is Listening...
                                        </span>
                                        <span className="material-symbols-outlined text-[16px] ml-2 text-gray-400 hover:text-white">close</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {isGraceConnecting ? 'hourglass_empty' : 'mic'}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-widest hidden lg:block">
                                            Talk With Grace
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Grace Listening Indicator */}


                        {/* 3. Actions (Right) */}
                        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">

                            {/* Login / Sign Up */}
                            <div className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-light dark:text-white mr-2">
                                <button onClick={onLoginClick} className="hover:text-[#C5A065] transition-colors">Log In</button>
                                <button onClick={onSignUpClick} className="hover:text-[#C5A065] transition-colors">Sign Up</button>
                            </div>

                            {/* Bottle Specialist Button */}
                            <motion.button
                                onClick={onConsultationClick}
                                className="hidden md:flex bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-5 py-3 rounded-md text-xs font-bold uppercase tracking-widest shadow-sm items-center gap-2"
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = (e.clientX - rect.left - rect.width / 2) / 10;
                                    const y = (e.clientY - rect.top - rect.height / 2) / 10;
                                    setMousePosition({ x, y });
                                }}
                                onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
                                animate={{
                                    x: mousePosition.x,
                                    y: mousePosition.y,
                                }}
                                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Bottle Specialist
                            </motion.button>

                            {/* Language Switcher */}
                            <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-md border border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => onLanguageChange?.('en')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'en' ? 'bg-white dark:bg-[#1D1D1F] text-[#C5A065] shadow-sm' : 'text-gray-500 hover:text-[#C5A065]'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => onLanguageChange?.('fr')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'fr' ? 'bg-white dark:bg-[#1D1D1F] text-[#C5A065] shadow-sm' : 'text-gray-500 hover:text-[#C5A065]'}`}
                                >
                                    FR
                                </button>
                            </div>

                            {/* Cart */}
                            <button
                                onClick={onCartClick}
                                className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors group"
                            >
                                <span className="material-symbols-outlined text-[24px] text-text-light dark:text-white group-hover:text-[#C5A065] transition-colors">shopping_bag</span>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-[#C5A065] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white dark:border-[#151515]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* BOTTOM ROW: Navigation (Centered) & Contact Info (Right) */}
                    <div className="hidden md:flex items-center justify-between px-6 border-t border-gray-100 dark:border-gray-800 h-[60px]">

                        {/* Left Spacer to balance the layout for centering nav */}
                        <div className="flex-1 hidden lg:block"></div>

                        {/* Navigation */}
                        <nav className="flex items-center space-x-12 text-xs font-bold uppercase tracking-[0.15em] text-text-light/80 dark:text-text-dark/80 mx-auto h-full">

                            {/* SHOP MENU TRIGGER (Functional/Categories) */}
                            <div
                                className="h-full flex items-center"
                                onMouseEnter={() => handleMouseEnter('shop')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <a
                                    className={`h-full flex items-center gap-1 transition-colors cursor-pointer border-b-2 border-transparent ${activeMenu === 'shop' ? 'text-[#C5A065] border-[#C5A065]' : 'hover:text-[#C5A065]'
                                        }`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveMenu(null); onHomeClick?.(); }}
                                >
                                    Shop Products
                                    <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${activeMenu === 'shop' ? 'rotate-180' : ''}`}>expand_more</span>
                                </a>
                            </div>

                            {/* COLLECTIONS MENU TRIGGER (Thematic/Visual) */}
                            <div
                                className="h-full flex items-center"
                                onMouseEnter={() => handleMouseEnter('collections')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <a
                                    className={`h-full flex items-center gap-1 transition-colors cursor-pointer border-b-2 border-transparent ${activeMenu === 'collections' ? 'text-[#C5A065] border-[#C5A065]' : 'hover:text-[#C5A065]'
                                        }`}
                                    href="#collections"
                                    onClick={(e) => { e.preventDefault(); setActiveMenu(null); onCollectionsClick?.(); }}
                                >
                                    Collections
                                    <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${activeMenu === 'collections' ? 'rotate-180' : ''}`}>expand_more</span>
                                </a>
                            </div>

                            <a
                                className="h-full flex items-center hover:text-[#C5A065] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#C5A065]"
                                href="#custom"
                                onClick={(e) => { e.preventDefault(); onCustomClick?.(); }}
                            >
                                Custom
                            </a>
                            <a
                                className="h-full flex items-center hover:text-[#C5A065] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#C5A065]"
                                href="#journal"
                                onClick={(e) => { e.preventDefault(); onJournalClick?.(); }}
                            >
                                Journal
                            </a>

                            {/* Features Link - Highlighted */}
                            <a
                                className="h-full flex items-center text-[#C5A065] hover:text-[#1D1D1F] dark:hover:text-white transition-colors cursor-pointer border-b-2 border-[#C5A065] hover:border-transparent font-black"
                                href="#features"
                                onClick={(e) => { e.preventDefault(); onFeaturesClick?.(); }}
                            >
                                <span className="material-symbols-outlined text-sm mr-1">star</span> Features
                            </a>

                        </nav>

                        {/* Contact Info (Right Aligned) */}
                        <div className="flex-1 flex justify-end gap-6 text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                            <a href="mailto:sales@nematinternational.com" className="hover:text-[#C5A065] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">mail</span>
                                sales@nematinternational.com
                            </a>
                            <a href="tel:5104450300" className="hover:text-[#C5A065] transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                (510) 445-0300
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- SHOP MEGA MENU (Functional) --- */}
                <AnimatePresence>
                    {activeMenu === 'shop' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 w-full bg-[#f4f2ee] dark:bg-[#151515] border-t border-gray-100 dark:border-gray-800 shadow-2xl z-40 hidden md:block"
                            onMouseEnter={() => handleMouseEnter('shop')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="max-w-[1600px] mx-auto px-6 py-12">
                                <div className="grid grid-cols-4 gap-8">

                                    {/* Col 1: Containers */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                            <span className="material-symbols-outlined">view_in_ar</span>
                                            <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Bottles & Vials</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {['Glass Bottles', 'Plastic Bottles', 'Aluminum Bottles', 'Glass Vials (Drams)', 'Roll-On Bottles', 'Jars & Pots'].map(item => (
                                                <li key={item}>
                                                    <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Col 2: Closures */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                            <span className="material-symbols-outlined">check_circle</span>
                                            <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Closures & Dispensers</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {['Caps (Phenolic & Metal)', 'Fine Mist Sprayers', 'Treatment Pumps', 'Lotion Pumps', 'Droppers & Pipettes', 'Orifice Reducers'].map(item => (
                                                <li key={item}>
                                                    <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Col 3: Accessories */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 text-[#C5A065]">
                                            <span className="material-symbols-outlined">shopping_bag</span>
                                            <h4 className="font-serif text-lg text-text-light dark:text-white font-bold">Packaging Accessories</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {['Velvet Pouches', 'Gift Boxes', 'Funnels', 'Shipping Supplies', 'Labels & Decor'].map(item => (
                                                <li key={item}>
                                                    <a href="#" className="text-sm text-gray-500 hover:text-[#C5A065] hover:pl-2 transition-all block">
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Col 4: Featured Action */}
                                    <div className="bg-white dark:bg-white/5 rounded-xl p-6 flex flex-col justify-between">
                                        <div>
                                            <span className="bg-[#1D1D1F] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">New Arrival</span>
                                            <h4 className="font-serif text-xl text-text-light dark:text-white mb-2">Metal Shell Atomizers</h4>
                                            <p className="text-xs text-gray-500 mb-4">Laser-engravable aluminum shells for ultimate brand customization.</p>
                                        </div>
                                        <img src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537" className="w-full h-32 object-cover rounded-lg mb-4 opacity-80" alt="Metal Atomizers" />
                                        <button onClick={() => { setActiveMenu(null); onCustomClick?.(); }} className="text-xs font-bold uppercase tracking-widest text-[#C5A065] hover:text-text-light dark:hover:text-white transition-colors flex items-center gap-2">
                                            Explore Series <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- COLLECTIONS MEGA MENU (Thematic) --- */}
                <AnimatePresence>
                    {activeMenu === 'collections' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 w-full bg-[#f4f2ee] dark:bg-[#151515] border-t border-gray-100 dark:border-gray-800 shadow-2xl z-40 hidden md:block"
                            onMouseEnter={() => handleMouseEnter('collections')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="max-w-[1600px] mx-auto px-6 py-12">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                    {/* Visual Collection 1: Atomizer Series */}
                                    <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                            <img
                                                src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548"
                                                alt="Atomizer Series"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <h4 className="font-serif text-lg text-text-light dark:text-text-white group-hover:text-[#C5A065] transition-colors">Atomizer Series</h4>
                                        <p className="text-xs text-gray-500 mt-1">Streamlined design for portability and convenience. Beautiful for your brand.</p>
                                    </div>

                                    {/* Visual Collection 2 - Updated with new Vintage Bottles Image */}
                                    <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                            <img
                                                src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-5b205acb.jpg?v=1765600055"
                                                alt="Vintage Collection"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <h4 className="font-serif text-lg text-text-light dark:text-text-white group-hover:text-[#C5A065] transition-colors">Vintage Collection</h4>
                                        <p className="text-xs text-gray-500 mt-1">Unique silhouettes for distinct brand identity.</p>
                                    </div>

                                    {/* Visual Collection 3 */}
                                    <div className="col-span-3 group cursor-pointer" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }}>
                                        <div className="aspect-[3/4] overflow-hidden rounded-lg mb-4 relative">
                                            <img
                                                src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-177c235a.jpg?v=1765653066"
                                                alt="Classic Roll-On Bottles"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <h4 className="font-serif text-lg text-text-light dark:text-text-white group-hover:text-[#C5A065] transition-colors">Classic Roll-On Bottles</h4>
                                        <p className="text-xs text-gray-500 mt-1">Timeless clarity meets modern silhouette.</p>
                                    </div>

                                    {/* List of Other Collections */}
                                    <div className="col-span-3 flex flex-col justify-center border-l border-gray-100 dark:border-gray-800 pl-8">
                                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">More Series</h4>
                                        <ul className="space-y-4">
                                            {['Cobalt Blue', 'Emerald Green', 'Frosted Editions', 'Travel Size (1-5ml)', 'Sample Vials'].map(item => (
                                                <li key={item}>
                                                    <a href="#" onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }} className="text-sm font-medium text-text-light dark:text-text-white hover:text-[#C5A065] flex items-center justify-between group">
                                                        {item}
                                                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                        <button onClick={() => { setActiveMenu(null); onCollectionsClick?.(); }} className="mt-8 text-xs font-bold text-[#C5A065] uppercase tracking-widest hover:underline text-left">
                                            View Full Catalog
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- MOBILE SIDE MENU DRAWER --- */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                                onClick={toggleMobileMenu}
                            />

                            {/* Drawer */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "tween", duration: 0.3 }}
                                className="fixed inset-y-0 left-0 w-[90%] max-w-[360px] bg-[#f4f2ee] dark:bg-[#151515] z-50 shadow-2xl flex flex-col md:hidden"
                            >
                                {/* Drawer Header */}
                                <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 shrink-0">
                                    <span className="font-serif text-xl font-bold uppercase tracking-tight text-[#1D1D1F] dark:text-white">Best Bottles</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-md border border-gray-200 dark:border-gray-800 scale-90">
                                            <button
                                                onClick={() => onLanguageChange?.('en')}
                                                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'en' ? 'bg-white dark:bg-[#1D1D1F] text-[#C5A065] shadow-sm' : 'text-gray-500 hover:text-[#C5A065]'}`}
                                            >
                                                EN
                                            </button>
                                            <button
                                                onClick={() => onLanguageChange?.('fr')}
                                                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'fr' ? 'bg-white dark:bg-[#1D1D1F] text-[#C5A065] shadow-sm' : 'text-gray-500 hover:text-[#C5A065]'}`}
                                            >
                                                FR
                                            </button>
                                        </div>
                                        <button onClick={toggleMobileMenu} className="p-2 -mr-2 text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Drawer Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                    {/* Mobile Search */}
                                    <div className="relative shrink-0">
                                        <input
                                            type="text"
                                            placeholder="Search catalog..."
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-transparent focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none text-sm text-[#1D1D1F] dark:text-white placeholder:text-gray-500"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                                    </div>

                                    {/* Navigation Links */}
                                    <nav className="flex flex-col space-y-2">

                                        {/* 1. Shop Products (Collapsible) */}
                                        <div>
                                            <button
                                                onClick={() => toggleMobileSection('shop')}
                                                className="w-full flex items-center justify-between text-lg font-bold text-[#1D1D1F] dark:text-white hover:text-[#C5A065] py-2 transition-colors group"
                                            >
                                                Shop Products
                                                <span className={`material-symbols-outlined text-gray-300 group-hover:text-[#C5A065] transition-transform duration-300 ${mobileExpanded['shop'] ? 'rotate-90 text-[#C5A065]' : ''}`}>chevron_right</span>
                                            </button>

                                            <AnimatePresence>
                                                {mobileExpanded['shop'] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pl-4"
                                                    >
                                                        {/* Bottles Sub-section */}
                                                        <div className="py-2">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Bottles & Vials</span>
                                                            <ul className="space-y-2 border-l border-gray-200 dark:border-gray-800 pl-4">
                                                                {['Glass Bottles', 'Plastic Bottles', 'Aluminum Bottles', 'Glass Vials (Drams)', 'Roll-On Bottles', 'Jars & Pots'].map(item => (
                                                                    <li key={item}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onHomeClick?.(); }} className="text-sm text-gray-600 dark:text-gray-300 block py-1 hover:text-[#C5A065]">{item}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Closures Sub-section */}
                                                        <div className="py-2">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Closures</span>
                                                            <ul className="space-y-2 border-l border-gray-200 dark:border-gray-800 pl-4">
                                                                {['Caps (Phenolic & Metal)', 'Fine Mist Sprayers', 'Treatment Pumps', 'Droppers & Pipettes'].map(item => (
                                                                    <li key={item}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onHomeClick?.(); }} className="text-sm text-gray-600 dark:text-gray-300 block py-1 hover:text-[#C5A065]">{item}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <button onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onHomeClick?.(); }} className="mt-2 text-xs font-bold text-[#C5A065] uppercase tracking-widest">
                                                            View All Products
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* 2. Collections (Collapsible - Carousel Updated) */}
                                        <div>
                                            <button
                                                onClick={() => toggleMobileSection('collections')}
                                                className="w-full flex items-center justify-between text-lg font-bold text-[#1D1D1F] dark:text-white hover:text-[#C5A065] py-2 transition-colors group"
                                            >
                                                Collections
                                                <span className={`material-symbols-outlined text-gray-300 group-hover:text-[#C5A065] transition-transform duration-300 ${mobileExpanded['collections'] ? 'rotate-90 text-[#C5A065]' : ''}`}>chevron_right</span>
                                            </button>

                                            <AnimatePresence>
                                                {mobileExpanded['collections'] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {/* Carousel Container */}
                                                        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-6 px-6 snap-x snap-mandatory no-scrollbar">
                                                            {/* Card 1: Atomizer */}
                                                            <div
                                                                className="snap-center shrink-0 w-40 bg-white dark:bg-white/5 rounded-lg p-2 flex flex-col group cursor-pointer"
                                                                onClick={() => { toggleMobileMenu(); onCollectionsClick?.(); }}
                                                            >
                                                                <img src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-ea69669f.jpg?v=1765531548" className="w-full aspect-square object-cover rounded mb-2 transition-transform duration-500 group-active:scale-95" alt="Atomizer" />
                                                                <span className="text-[10px] font-bold block leading-tight text-[#1D1D1F] dark:text-white">Atomizer Series</span>
                                                            </div>

                                                            {/* Card 2: Vintage */}
                                                            <div
                                                                className="snap-center shrink-0 w-40 bg-white dark:bg-white/5 rounded-lg p-2 flex flex-col group cursor-pointer"
                                                                onClick={() => { toggleMobileMenu(); onCollectionsClick?.(); }}
                                                            >
                                                                <img src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-5b205acb.jpg?v=1765600055" className="w-full aspect-square object-cover rounded mb-2 transition-transform duration-500 group-active:scale-95" alt="Vintage" />
                                                                <span className="text-[10px] font-bold block leading-tight text-[#1D1D1F] dark:text-white">Vintage Collection</span>
                                                            </div>

                                                            {/* Card 3: Roll-On */}
                                                            <div
                                                                className="snap-center shrink-0 w-40 bg-white dark:bg-white/5 rounded-lg p-2 flex flex-col group cursor-pointer"
                                                                onClick={() => { toggleMobileMenu(); onCollectionsClick?.(); }}
                                                            >
                                                                <img src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-177c235a.jpg?v=1765653066" className="w-full aspect-square object-cover rounded mb-2 transition-transform duration-500 group-active:scale-95" alt="Roll-On" />
                                                                <span className="text-[10px] font-bold block leading-tight text-[#1D1D1F] dark:text-white">Classic Roll-On</span>
                                                            </div>
                                                        </div>

                                                        <div className="py-2 pl-4">
                                                            <ul className="space-y-2 border-l border-gray-200 dark:border-gray-800 pl-4">
                                                                {['Cobalt Blue Series', 'Emerald Green Series', 'Travel Size (1-5ml)'].map(item => (
                                                                    <li key={item}>
                                                                        <a href="#collections" onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onCollectionsClick?.(); }} className="text-sm text-gray-600 dark:text-gray-300 block py-1 hover:text-[#C5A065]">{item}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <a
                                            href="#custom"
                                            onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onCustomClick?.(); }}
                                            className="text-lg font-bold text-[#1D1D1F] dark:text-white hover:text-[#C5A065] py-2 transition-colors flex items-center justify-between group"
                                        >
                                            Custom Projects
                                            <span className="material-symbols-outlined text-gray-300 group-hover:text-[#C5A065]">chevron_right</span>
                                        </a>
                                        <a
                                            href="#journal"
                                            onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onJournalClick?.(); }}
                                            className="text-lg font-bold text-[#1D1D1F] dark:text-white hover:text-[#C5A065] py-2 transition-colors flex items-center justify-between group"
                                        >
                                            Journal
                                            <span className="material-symbols-outlined text-gray-300 group-hover:text-[#C5A065]">chevron_right</span>
                                        </a>

                                        {/* Mobile Features Link */}
                                        <a
                                            href="#features"
                                            onClick={(e) => { e.preventDefault(); toggleMobileMenu(); onFeaturesClick?.(); }}
                                            className="text-lg font-bold text-[#C5A065] hover:text-[#191919] dark:hover:text-white py-2 transition-colors flex items-center justify-between group"
                                        >
                                            <span className="flex items-center gap-2"><span className="material-symbols-outlined">star</span> Features</span>
                                            <span className="material-symbols-outlined text-gray-300 group-hover:text-[#C5A065]">chevron_right</span>
                                        </a>

                                    </nav>

                                    <div className="h-px bg-gray-100 dark:bg-gray-800 shrink-0"></div>

                                    {/* Specialist Action */}
                                    <button
                                        onClick={() => { toggleMobileMenu(); onConsultationClick?.(); }}
                                        className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">support_agent</span>
                                        Consult Specialist
                                    </button>

                                    {/* Auth Actions */}
                                    <div className="grid grid-cols-2 gap-4 shrink-0 pb-6">
                                        <button
                                            onClick={() => { toggleMobileMenu(); onLoginClick?.(); }}
                                            className="py-3 text-sm font-bold text-[#1D1D1F] dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#1D1D1F] dark:hover:border-white transition-colors"
                                        >
                                            Log In
                                        </button>
                                        <button
                                            onClick={() => { toggleMobileMenu(); onSignUpClick?.(); }}
                                            className="py-3 text-sm font-bold text-[#1D1D1F] dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#1D1D1F] dark:hover:border-white transition-colors"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>

                                {/* Drawer Footer */}
                                <div className="p-6 bg-[#f4f2ee] dark:bg-white/5 border-t border-gray-200 dark:border-gray-800 shrink-0">
                                    <div className="flex gap-4 text-xs text-gray-500 justify-center">
                                        <button onClick={() => { toggleMobileMenu(); onContactClick?.(); }} className="hover:text-[#1D1D1F] dark:hover:text-white">Contact</button>
                                        <button onClick={() => { toggleMobileMenu(); onHelpCenterClick?.(); }} className="hover:text-[#1D1D1F] dark:hover:text-white">Shipping</button>
                                        <button onClick={() => { toggleMobileMenu(); onHelpCenterClick?.(); }} className="hover:text-[#1D1D1F] dark:hover:text-white">FAQ</button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </header>
        </div>
    );
};
