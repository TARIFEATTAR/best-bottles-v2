
import React, { useEffect, useState, useRef } from "react";
import { FINDER_CATEGORIES, FEATURES, JOURNAL_POSTS } from "../constants";
import { BentoGrid } from "./BentoGrid";
import { LuxuryPackageSlider } from "./LuxuryPackageSlider";
import { Reveal } from "./Reveal";
import { Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { useConversation } from "@elevenlabs/react";
import { translations } from "../translations";
import { ShopifyProductGrid } from "./ShopifyProductGrid";


interface ModernHomeProps {
    onProductClick?: () => void;
    onConsultationClick?: () => void;
    onCollectionClick?: () => void;
    onPackagingIdeasClick?: () => void;
    onAddToCart?: (product: Product, quantity: number) => void;
    onBlueprintClick?: () => void;
    language?: 'en' | 'fr';
}

const BRANDS = [
    "LUMIÈRE", "VOGUE", "ELIXIR", "AURA", "ZENITH", "NOIR", "SOLSTICE", "PRISMA", "VELVET", "OASIS"
];

// Scene Data for the Home Slider
const HOME_SLIDER_SCENES = [
    {
        // Scene 1: Plain vs Branded
        before: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142",
        after: "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-a04d7c57.jpg?v=1765532762",
        labelBefore: "Before",
        labelAfter: "After"
    }
];

// --- ElevenLabs Configuration ---
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

export const ModernHome: React.FC<ModernHomeProps> = ({
    onProductClick,
    onConsultationClick,
    onCollectionClick,
    onPackagingIdeasClick,
    onAddToCart,
    onBlueprintClick,
    language = 'en'
}) => {
    const t = translations[language];

    const [offsetY, setOffsetY] = useState(0);
    const [voiceText, setVoiceText] = useState("Speak with Grace");

    // ElevenLabs Conversation Hook
    const conversation = useConversation({
        onConnect: () => {
            console.log("✅ Connected to ElevenLabs Grace");
            setVoiceText("Listening...");
        },
        onDisconnect: () => {
            console.log("❌ Disconnected from Grace");
            setVoiceText("Speak with Grace");
        },
        onMessage: (message) => {
            console.log("📨 Grace says:", message);
            // Check if AI wants to navigate to builder
            if (message.message && message.message.toLowerCase().includes("take you to the builder")) {
                // Extract parameters from conversation context
                const event = new CustomEvent('navigate-to-builder', {
                    detail: { category: 'perfume' } // Default, Grace will have specified
                });
                window.dispatchEvent(event);
            }
        },
        onError: (error) => {
            console.error("❌ Grace error:", error);
            setVoiceText("Error - Try again");
        },
    });

    const isListening = conversation.status === 'connected';
    const isConnecting = conversation.status === 'connecting';

    // Parallax Effect Hook
    useEffect(() => {
        const handleScroll = () => setOffsetY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleVoiceInteraction = async () => {
        if (isListening) {
            // Stop the conversation
            await conversation.endSession();
            setVoiceText("Speak with Grace");
            return;
        }

        if (!ELEVENLABS_AGENT_ID) {
            console.error("ElevenLabs Agent ID not configured");
            setVoiceText("Not configured");
            alert("Please add VITE_ELEVENLABS_AGENT_ID to your .env file");
            return;
        }

        try {
            setVoiceText("Connecting...");

            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start ElevenLabs conversation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await conversation.startSession({
                agentId: ELEVENLABS_AGENT_ID,
            } as any);

        } catch (error) {
            console.error("Failed to start Grace:", error);
            setVoiceText("Error");

            if (error instanceof Error && error.message.includes('Permission denied')) {
                alert("Please allow microphone access to use voice chat with Grace.");
            } else {
                alert("Could not connect to Grace. Please check your API configuration.");
            }
        }
    };

    return (
        <div className="w-full bg-[#F5F3EF] dark:bg-background-dark overflow-x-hidden transition-colors duration-500">

            {/* 1. Hero Section: Cinematic Full-Bleed with Parallax */}
            <section className="relative w-full h-[100dvh] md:h-[95vh] min-h-[600px] flex items-center px-6 md:px-10 lg:px-20 overflow-hidden bg-[#8C867D]">
                {/* Parallax Background */}
                <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    {/* Desktop Hero Image (Original) */}
                    <img
                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-23e11813.jpg?v=1765598795"
                        alt="Antique Perfume Bottle"
                        className="hidden md:block w-full h-full object-cover brightness-[0.85] object-[center_30%]"
                    />
                    {/* Mobile Hero Image (New) */}
                    <img
                        src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-5b205acb.jpg?v=1765600055"
                        alt="Vintage Perfume Collection"
                        className="md:hidden w-full h-full object-cover brightness-[0.85] object-center"
                    />
                    {/* Sophisticated Gradients for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1D1D1F]/60 md:hidden"></div>
                    <div className="absolute inset-0 bg-black/40 hidden md:block"></div>
                </motion.div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 h-full">
                    <div className="flex flex-col justify-between md:justify-center md:col-span-1 max-w-2xl h-full pt-20 pb-16 md:py-0">
                        {/* Top Text Block */}
                        <div className="space-y-4 md:space-y-8">
                            <Reveal delay={0.2} effect="fade">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-8 md:w-12 bg-[#C5A065]"></div>
                                    <span className="text-white/90 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase">
                                        {t.hero.sub}
                                    </span>
                                </div>
                            </Reveal>

                            <div className="overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-semibold text-white leading-[1] md:leading-[0.95] tracking-tight drop-shadow-2xl">
                                        {t.hero.title}
                                    </h1>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <p className="text-white/90 text-base md:text-2xl font-light leading-relaxed max-w-xl border-l border-[#C5A065]/50 pl-6 backdrop-blur-[2px] py-1">
                                    {t.hero.desc}
                                </p>
                            </motion.div>
                        </div>

                        {/* Bottom Action Block */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="w-full pt-10"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={onCollectionClick}
                                    className="bg-white text-[#1D1D1F] px-10 py-5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A065] hover:text-white transition-all shadow-xl min-w-[200px] hover:scale-[1.02] active:scale-95 duration-300"
                                >
                                    {t.hero.explore}
                                </button>
                                <button
                                    onClick={onConsultationClick}
                                    className="backdrop-blur-md bg-white/5 border border-white/20 text-white px-10 py-5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#1D1D1F] transition-all min-w-[200px] hover:scale-[1.02] active:scale-95 duration-300"
                                >
                                    {t.hero.start}
                                </button>
                                <button
                                    onClick={onBlueprintClick}
                                    className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-8 py-5 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#1D1D1F] transition-all min-w-[200px] hover:scale-[1.02] active:scale-95 duration-300 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">architecture</span>
                                    Blueprint Demo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                    <div className="hidden md:block"></div>
                </div>
            </section>

            {/* 2. Social Proof Ticker */}
            <section className="border-b border-[#E5E0D8] dark:border-gray-800 bg-[#F5F3EF] dark:bg-background-dark py-6 md:py-8 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap items-center">
                    {[...BRANDS, ...BRANDS].map((brand, i) => (
                        <div key={i} className="mx-8 md:mx-16 flex items-center justify-center opacity-30 dark:opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default hover:scale-110">
                            <span className="text-lg md:text-xl font-serif font-bold text-[#2D3A3F] dark:text-white tracking-widest">{brand}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2.5 Product Categories Section */}
            <section className="bg-white dark:bg-[#1A1D21] py-8 md:py-16 border-b border-gray-100 dark:border-gray-800 relative z-20">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12">
                    {/* Categories Grid (Ultra Wide) */}
                    <div className="w-full mx-auto grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 items-start justify-items-center">
                        {FINDER_CATEGORIES.map((cat, idx) => {
                            let customImageUrl = null;
                            if (cat.icon === 'spray') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-2c62f91d.jpg?v=1765533142";
                            } else if (cat.icon === 'gesture') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-39b140c0.jpg?v=1765595835";
                            } else if (cat.icon === 'water_drop') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-e928a6cf.jpg?v=1765664801";
                            } else if (cat.icon === 'shopping_bag') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-413abfc9.jpg?v=1765666458";
                            } else if (cat.icon === 'spa') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-e928a6cf.jpg?v=1765664801";
                            } else if (cat.icon === 'check_circle') {
                                customImageUrl = "https://cdn.shopify.com/s/files/1/1989/5889/files/madison-e928a6cf.jpg?v=1765664801";
                            }

                            return (
                                <Reveal key={idx} delay={idx * 0.1} effect="scale" width="100%">
                                    <button
                                        onClick={onCollectionClick}
                                        className="group flex flex-col items-center gap-2 md:gap-4 w-full"
                                    >
                                        <div className={`w-full aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 overflow-hidden relative ${customImageUrl
                                            ? "bg-white border border-gray-100 dark:border-gray-800"
                                            : "bg-gray-50 dark:bg-white/5 text-[#2D3A3F] dark:text-gray-300 group-hover:bg-[#1D1D1F] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1D1D1F]"
                                            }`}>
                                            <div className="absolute inset-0 bg-[#405D68] mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10 pointer-events-none"></div>

                                            {customImageUrl ? (
                                                <>
                                                    <img
                                                        src={customImageUrl}
                                                        alt={cat.label}
                                                        className="w-full h-full object-cover transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-[#C5A065]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                                </>
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl md:text-5xl font-light transition-transform group-hover:scale-110 relative z-20">
                                                    {cat.icon}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] md:text-sm font-bold tracking-[0.1em] uppercase text-center text-gray-500 group-hover:text-[#C5A065] transition-colors line-clamp-1">
                                            {cat.label}
                                        </span>
                                    </button>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. Intro/Sustainability Section: 2-Column Structure */}
            <section className="py-20 md:py-32 px-6 md:px-10 lg:px-20 bg-[#F5F3EF] dark:bg-background-dark relative">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start border-t border-[#E5E0D8] dark:border-gray-800 pt-12 md:pt-16">
                    <div className="max-w-md sticky top-32">
                        <Reveal effect="slide-up">
                            <h2 className="text-4xl md:text-6xl font-serif text-[#2D3A3F] dark:text-white leading-tight">
                                {t.sections.sustainability}
                            </h2>
                        </Reveal>
                    </div>
                    <div>
                        <Reveal delay={0.2}>
                            <p className="text-[#637588] dark:text-gray-400 font-light leading-relaxed text-lg md:text-xl mb-10">
                                We believe the vessel is as vital as the scent it holds. Our &quot;Muted Luxury&quot; line blends timeless artisanal craftsmanship with modern sustainable practices, creating bottles that are not merely containers, but objects of desire.
                            </p>
                        </Reveal>
                        <Reveal delay={0.4}>
                            <button onClick={onCollectionClick} className="group flex items-center gap-3 text-[#C5A065] text-xs font-bold uppercase tracking-widest hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                {t.sections.philosophy}
                                <span className="w-12 h-[1px] bg-[#C5A065] group-hover:w-20 transition-all duration-300"></span>
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 4. Curated Selections (Bento Grid) - Moved Up */}
            <section id="collections" className="py-16 md:py-24 bg-[#F5F3EF] dark:bg-background-dark">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-10 md:mb-16 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <Reveal>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-serif text-[#2D3A3F] dark:text-white mb-3">
                                {t.sections.curated}
                            </h2>
                            <p className="text-[#637588] dark:text-gray-400 text-sm font-light">
                                {t.sections.moodBoards}
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <button
                            onClick={onCollectionClick}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D3A3F] dark:text-white hover:text-[#C5A065] transition-colors"
                        >
                            {t.sections.viewCatalog}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </Reveal>
                </div>

                {/* Bento Grid gets a generic fade reveal */}
                <Reveal delay={0.3} width="100%">
                    <BentoGrid
                        onCollectionClick={onCollectionClick}
                        onPackagingIdeasClick={onPackagingIdeasClick}
                    />
                </Reveal>
            </section>

            {/* 4.25 Live Studio Inventory (Shopify Integration) */}
            <section className="py-20 md:py-32 bg-white dark:bg-[#161616] relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F5F3EF]/50 dark:bg-white/5 skew-x-[-12deg] translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-[1440px] mx-auto px-6 md:px-10 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
                        <Reveal>
                            <div className="max-w-xl">
                                <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 block">Storefront API Integration</span>
                                <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-6">Live Studio Collection</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light leading-relaxed">
                                    Direct real-time synchronization with our Shopify production catalog. High-performance, headless commerce in action.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-4 rounded-2xl shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Connection Status</span>
                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Shopify API Active
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <ShopifyProductGrid onAddToCart={onAddToCart} limit={4} />
                </div>
            </section>


            {/* 4.5 Packaging Inspiration Teaser (UPDATED WITH SLIDER) */}
            <section className="bg-[#EBE7DD] dark:bg-[#2A2A2A] py-20 md:py-32 border-y border-[#D8C6B0] dark:border-gray-700 overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    <div className="flex-1 order-2 md:order-1">
                        <Reveal>
                            <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-4 block">{t.sections.inspiration}</span>
                            <h2 className="text-3xl md:text-6xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-6">
                                {t.sections.seePossible}
                            </h2>
                            <p className="text-[#637588] dark:text-gray-300 mb-8 md:mb-10 max-w-md leading-relaxed text-base md:text-lg">
                                {t.sections.visualize}
                            </p>
                            <button
                                onClick={onPackagingIdeasClick}
                                className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg hover:scale-105 duration-300 w-full md:w-auto"
                            >
                                {t.sections.viewIdeas}
                            </button>
                        </Reveal>
                    </div>

                    {/* Interactive Slider Showcase - Slight rotation and hover effect for interactivity */}
                    <div className="flex-1 w-full max-w-xl order-1 md:order-2">
                        <Reveal effect="scale" delay={0.2}>
                            <div className="aspect-square bg-white dark:bg-black/20 rounded-xl shadow-2xl border border-white dark:border-gray-700 overflow-hidden transform md:rotate-2 hover:rotate-0 transition-all duration-700 hover:shadow-3xl hover:scale-[1.02]">
                                <LuxuryPackageSlider scenes={HOME_SLIDER_SCENES} />
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 5. Custom Metal Shell Atomizers (Replaces old Finder Strip Section) */}
            <section id="custom" className="bg-[#1D1D1F] dark:bg-[#15191C] text-white py-20 md:py-32">
                <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                    {/* Left Image Mockup */}
                    <div className="relative group perspective-1000">
                        <Reveal effect="scale">
                            <div className="aspect-[4/5] lg:aspect-square bg-[#2A2E35] rounded-sm shadow-2xl overflow-hidden relative">
                                <img
                                    src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537"
                                    alt="Metal Shell Atomizers"
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

                                {/* Overlay Text */}
                                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                                    <span className="text-[#C5A059] font-bold uppercase tracking-widest text-xs mb-2 block">Signature Series</span>
                                    <h3 className="text-2xl md:text-3xl font-serif">Laser Engraved Atomizers</h3>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right Content */}
                    <div>
                        <Reveal>
                            <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">{t.custom.label}</span>
                            <h2 className="text-4xl md:text-7xl font-serif font-medium mb-8 leading-[0.9]">
                                {t.custom.title}
                            </h2>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <p className="text-white/70 text-lg font-light leading-relaxed mb-12 max-w-lg">
                                {t.custom.desc}
                            </p>
                        </Reveal>

                        <div className="space-y-8 mb-16">
                            <Reveal delay={0.3}>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                        <span className="material-symbols-outlined text-lg">diamond</span>
                                    </div>
                                    <span className="text-base font-medium tracking-wide">360° Precision Laser Engraving</span>
                                </div>
                            </Reveal>
                            <Reveal delay={0.4}>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                        <span className="material-symbols-outlined text-lg">palette</span>
                                    </div>
                                    <span className="text-base font-medium tracking-wide">Premium Anodized Finishes</span>
                                </div>
                            </Reveal>
                            <Reveal delay={0.5}>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-300">
                                        <span className="material-symbols-outlined text-lg">fitness_center</span>
                                    </div>
                                    <span className="text-base font-medium tracking-wide">Luxury Weighted Feel</span>
                                </div>
                            </Reveal>
                        </div>

                        <Reveal delay={0.6}>
                            <button
                                onClick={onConsultationClick}
                                className="bg-white text-[#1D1D1F] px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg hover:shadow-[#C5A059]/30 w-full md:w-auto"
                            >
                                {t.custom.request}
                            </button>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 7. Journal Preview */}
            <section className="py-20 md:py-32 max-w-[1440px] mx-auto px-6 bg-[#F5F3EF] dark:bg-background-dark">
                <Reveal>
                    <div className="flex justify-between items-baseline mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-[#2D3A3F] dark:text-white">Journal</h2>
                        <a href="#" className="text-xs font-bold tracking-widest uppercase text-[#637588] hover:text-[#C5A065] transition-colors relative group">
                            View Archive
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C5A065] group-hover:w-full transition-all duration-300"></span>
                        </a>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {JOURNAL_POSTS.map((post, idx) => (
                        <Reveal key={idx} delay={idx * 0.2}>
                            <article className="group cursor-pointer">
                                <div className="aspect-[3/2] overflow-hidden rounded-md mb-8 bg-gray-200 relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                    />
                                </div>
                                <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest block mb-3">{post.date}</span>
                                <h3 className="text-2xl font-serif font-medium text-[#2D3A3F] dark:text-white mb-4 leading-snug group-hover:text-[#C5A065] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-[#637588] line-clamp-2 leading-relaxed">{post.excerpt}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>

        </div>
    );
};
