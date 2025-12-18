import React, { useState, useEffect } from "react";
import { FAQ_DATA } from "../constants";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";

interface ConciergePageProps {
    onBack?: () => void;
    onContactClick?: () => void;
}

export const ConciergePage: React.FC<ConciergePageProps> = ({ onBack, onContactClick }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    // Default all categories to open initially for better discoverability
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(FAQ_DATA.map(c => c.category)));

    // ElevenLabs Voice State
    const [isGraceListening, setIsGraceListening] = useState(false);
    const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

    const conversation = useConversation({
        onConnect: () => {
            console.log("✅ Grace connected on Concierge Page");
            setIsGraceListening(true);
        },
        onDisconnect: () => {
            console.log("❌ Grace disconnected");
            setIsGraceListening(false);
        },
        onError: (error) => {
            console.error("❌ Grace error:", error);
            setIsGraceListening(false);
        },
    });

    const handleStartGrace = async () => {
        if (isGraceListening) {
            await conversation.endSession();
            return;
        }

        if (!ELEVENLABS_AGENT_ID) {
            alert("Please configure VITE_ELEVENLABS_AGENT_ID in your environment.");
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await conversation.startSession({ agentId: ELEVENLABS_AGENT_ID } as any);
        } catch (err) {
            console.error("Failed to start voice:", err);
            alert("Microphone access is required for voice chat.");
        }
    };

    // Search Filtering
    const filteredData = FAQ_DATA.map(category => {
        const matchingItems = category.items.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...category, items: matchingItems };
    }).filter(category => category.items.length > 0);

    const toggleItem = (question: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(question)) {
            newExpanded.delete(question);
        } else {
            newExpanded.add(question);
        }
        setExpandedItems(newExpanded);
    };

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (category: string) => {
        const isSame = category === activeCategory;
        setActiveCategory(isSame ? null : category);

        if (!isSame) {
            const newExpanded = new Set(expandedCategories);
            newExpanded.add(category);
            setExpandedCategories(newExpanded);

            setTimeout(() => {
                const element = document.getElementById(`faq-cat-${category.replace(/\s+/g, '')}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    };

    const quickQuestions = [
        { q: "What is your shipping time?", cat: "Shipping & Delivery" },
        { q: "Do you ship internationally?", cat: "Shipping & Delivery" },
        { q: "What if my bottles arrive broken?", cat: "Returns & Breakage" },
        { q: "Is there a minimum order?", cat: "Ordering & Payment" },
        { q: "Do you offer wholesale pricing?", cat: "Ordering & Payment" },
        { q: "Match a cap to a bottle?", cat: "Product & Technical" },
    ];

    const handleQuickQuestion = (q: string, cat: string) => {
        setActiveCategory(cat);
        setSearchQuery(q);
        // Expand category
        const newExpandedCat = new Set(expandedCategories);
        newExpandedCat.add(cat);
        setExpandedCategories(newExpandedCat);
        // Expand the specific item
        const newExpandedItem = new Set(expandedItems);
        newExpandedItem.add(q);
        setExpandedItems(newExpandedItem);

        // Smooth scroll to the category
        setTimeout(() => {
            const element = document.getElementById(`faq-cat-${cat.replace(/\s+/g, '')}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <div className="w-full bg-[#F9F8F6] dark:bg-background-dark min-h-screen font-sans pb-24">

            {/* Hero / Concierge Branding Section */}
            <div className="bg-[#1D1D1F] text-white pt-32 pb-40 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1D1D1F]"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <Reveal effect="fade" width="100%">
                        <span className="text-[#C5A059] font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Personal Assistant</span>
                    </Reveal>
                    <Reveal delay={0.1} width="100%">
                        <h1 className="text-6xl md:text-7xl font-serif font-medium mb-8 tracking-tight">
                            Concierge
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2} width="100%">
                        <p className="text-white/60 mb-12 max-w-xl mx-auto text-lg font-light leading-relaxed">
                            Experience the next level of support. Our AI concierge Grace is ready to assist with logistics, technical specs, and custom sourcing.
                        </p>
                    </Reveal>

                    {/* Grace Voice Integration Card */}
                    <Reveal delay={0.3} effect="scale" width="100%">
                        <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-12 relative group">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${isGraceListening ? 'bg-[#C5A059] shadow-[0_0_50px_rgba(197,160,89,0.5)] scale-110' : 'bg-white/10 border border-white/20'}`}>
                                        <span className={`material-symbols-outlined text-4xl ${isGraceListening ? 'text-[#1D1D1F] animate-pulse' : 'text-[#C5A059]'}`}>
                                            {isGraceListening ? 'graphic_eq' : 'mic'}
                                        </span>
                                    </div>
                                    {isGraceListening && (
                                        <div className="absolute -inset-4 rounded-full border border-[#C5A059]/30 animate-ping"></div>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-serif font-bold mb-3 tracking-wide">
                                        {isGraceListening ? "Grace is Listening..." : "Speak with Grace"}
                                    </h3>
                                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                        {isGraceListening
                                            ? "Ask Grace about shipping times, breakage policies, or custom molding requests. She has full access to our technical catalog."
                                            : "Tap below to start an interactive voice session. Instant answers for all your packaging logistics needs."}
                                    </p>
                                    <button
                                        onClick={handleStartGrace}
                                        className={`px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${isGraceListening
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white'
                                            : 'bg-[#C5A059] text-[#1D1D1F] hover:bg-white hover:scale-105 shadow-xl'}`}
                                    >
                                        {isGraceListening ? "End Session" : "Start Conversation"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Quick Search */}
                    <Reveal delay={0.4} width="100%">
                        <div className="max-w-2xl mx-auto relative">
                            <input
                                type="text"
                                placeholder="Describe your issue or ask a question..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-5 pl-14 pr-6 text-white placeholder:text-white/40 focus:bg-white focus:text-[#1D1D1F] focus:placeholder:text-gray-400 outline-none transition-all shadow-2xl text-lg"
                            />
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">search</span>
                        </div>
                    </Reveal>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">

                {/* Common Questions / Quick Actions */}
                <div className="mb-16">
                    <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-6 px-4">Instant Answers</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickQuestion(q.q, q.cat)}
                                className="bg-white dark:bg-[#1A1D21] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#C5A059] hover:shadow-xl transition-all text-left flex items-start gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                                    <span className="material-symbols-outlined text-[#C5A059] text-xl">
                                        {idx % 2 === 0 ? 'bolt' : 'help'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{q.cat}</span>
                                    <span className="text-[#1D1D1F] dark:text-white font-medium group-hover:text-[#C5A065] transition-colors">{q.q}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sidebar Categories */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-6 px-4">Knowledge Base</h4>
                        <div className="sticky top-32 space-y-2">
                            {FAQ_DATA.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleCategoryClick(cat.category)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCategory === cat.category
                                        ? 'bg-[#1D1D1F] text-white shadow-lg'
                                        : 'text-gray-500 hover:bg-white dark:hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {idx === 0 ? 'payments' : idx === 1 ? 'local_shipping' : idx === 2 ? 'change_circle' : 'science'}
                                    </span>
                                    <span className="text-sm font-bold tracking-tight">{cat.category}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main FAQ List */}
                    <div className="lg:col-span-9 space-y-8">
                        {filteredData.length > 0 ? (
                            filteredData.map((category) => {
                                const isCategoryOpen = expandedCategories.has(category.category) || searchQuery.length > 0;

                                return (
                                    <div
                                        key={category.category}
                                        id={`faq-cat-${category.category.replace(/\s+/g, '')}`}
                                        className="scroll-mt-32"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <h2 className="text-2xl font-serif font-bold text-[#1D1D1F] dark:text-white">
                                                {category.category}
                                            </h2>
                                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                                        </div>

                                        <div className="space-y-4">
                                            {category.items.map((item, idx) => {
                                                const isOpen = expandedItems.has(item.question) || searchQuery.length > 0;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`bg-white dark:bg-[#1A1D21] rounded-2xl border transition-all duration-300 ${isOpen
                                                            ? 'border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]/20'
                                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                                                    >
                                                        <button
                                                            onClick={() => toggleItem(item.question)}
                                                            className="w-full text-left px-8 py-6 flex justify-between items-center group focus:outline-none"
                                                        >
                                                            <span className={`font-bold text-base pr-8 leading-relaxed transition-colors ${isOpen ? 'text-[#C5A065]' : 'text-[#1D1D1F] dark:text-white'}`}>
                                                                {item.question}
                                                            </span>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#C5A059] text-[#1D1D1F] rotate-45' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-[#C5A065]'}`}>
                                                                <span className="material-symbols-outlined text-lg">add</span>
                                                            </div>
                                                        </button>
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-8 pb-8 text-[#637588] dark:text-gray-400 leading-relaxed text-sm md:text-base border-t border-gray-50 dark:border-white/5 pt-6">
                                                                        <p className="max-w-3xl">{item.answer}</p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white dark:bg-[#1A1D21] rounded-3xl p-20 text-center border border-dashed border-gray-200 dark:border-gray-800">
                                <span className="material-symbols-outlined text-6xl text-gray-200 mb-6">inventory_2</span>
                                <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-white mb-2">No answers found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8">Try rephrasing your search or talk directly with Grace for a personalized response.</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="bg-[#1D1D1F] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all"
                                >
                                    Clear Results
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dedicated Support Section */}
                <div className="mt-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C5A059]/10 to-transparent rounded-[3rem] -z-10"></div>
                    <div className="bg-[#1D1D1F] dark:bg-[#111111] rounded-[3rem] p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 blur-[100px] pointer-events-none"></div>

                        <div className="flex-1 text-center lg:text-left relative z-10">
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
                                Need a Human Touch?
                            </h2>
                            <p className="text-white/50 text-lg md:text-xl font-light mb-8 max-w-xl">
                                Our bottle specialists are available Monday through Friday, 9:30am – 5:30pm PST for bespoke consultations and large wholesale quotes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={onContactClick}
                                    className="bg-white text-[#1D1D1F] px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all shadow-xl"
                                >
                                    Contact Support
                                </button>
                                <a
                                    href="tel:5104450300"
                                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-[#1D1D1F] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">call</span>
                                    510.445.0300
                                </a>
                            </div>
                        </div>

                        <div className="flex-shrink-0 w-full lg:w-auto relative z-10">
                            <div className="bg-[#C5A059] p-8 md:p-12 rounded-[2rem] text-[#1D1D1F] text-center shadow-2xl">
                                <span className="material-symbols-outlined text-4xl mb-4">mail</span>
                                <h4 className="text-xl font-bold mb-2">Email Sales</h4>
                                <p className="text-[#1D1D1F]/70 text-sm mb-6 uppercase tracking-wider font-bold">Inquiries within 2 hours</p>
                                <a href="mailto:sales@nematinternational.com" className="text-lg font-serif font-bold underline decoration-2 underline-offset-8">
                                    sales@nematinternational.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};