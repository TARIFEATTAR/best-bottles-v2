
import React, { useEffect, useState, useRef } from "react";
import { FINDER_CATEGORIES, FEATURES, JOURNAL_POSTS } from "../constants";
import { BentoGrid } from "./BentoGrid";
import { LuxuryPackageSlider } from "./LuxuryPackageSlider";
import { Reveal } from "./Reveal";
import { Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";

interface ModernHomeProps {
    onProductClick?: () => void;
    onConsultationClick?: () => void;
    onCollectionClick?: () => void;
    onPackagingIdeasClick?: () => void;
    onAddToCart?: (product: Product, quantity: number) => void;
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

// --- Audio Utils ---
function base64ToFloat32Array(base64: string): Float32Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
}

function float32ToB64(array: Float32Array): string {
    const int16Array = new Int16Array(array.length);
    for (let i = 0; i < array.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, array[i] * 32768));
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// --- Tool Definition ---
const builderTool: FunctionDeclaration = {
    name: "start_builder",
    description: "Navigate the user to the Project Builder Studio. Use this ONLY after you have gathered sufficient details (Category, desired Capacity/Size, and ideally Quantity) or if the user explicitly asks to start building/designing.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: "The type of product. Values: 'perfume', 'oil', 'serum', 'jar', 'roll-on'."
            },
            capacity: {
                type: Type.STRING,
                description: "The desired size/volume (e.g., '10ml', '30ml', '50ml', '1oz')."
            },
            quantity: {
                type: Type.NUMBER,
                description: "The number of units the user is interested in."
            },
            color: {
                type: Type.STRING,
                description: "Preferred color (e.g. Amber, Blue, Clear)."
            }
        },
        required: ["category"]
    }
};

export const ModernHome: React.FC<ModernHomeProps> = ({
    onProductClick,
    onConsultationClick,
    onCollectionClick,
    onPackagingIdeasClick,
    onAddToCart
}) => {
    const [offsetY, setOffsetY] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState("Connect");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filter selections (accumulated before search)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    
    // Handle search submit - parse query and navigate to Bottle Specialist
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigateWithFilters();
    };
    
    // Navigate with all accumulated filters
    const navigateWithFilters = () => {
        const query = searchQuery.toLowerCase();
        
        // Use selected filters or parse from query
        let category = selectedCategory || 'roll-on'; // Default for demo
        let color = selectedColor || '';
        let capacity = selectedSize || '';
        
        // Also parse the query for additional hints
        if (query) {
            if (!selectedCategory) {
                if (query.includes('roll') || query.includes('roller')) category = 'roll-on';
                else if (query.includes('drop') || query.includes('dropper')) category = 'dropper';
                else if (query.includes('spray') || query.includes('mist')) category = 'spray';
            }
            
            if (!selectedColor) {
                if (query.includes('amber')) color = 'amber';
                else if (query.includes('blue') || query.includes('cobalt')) color = 'cobalt blue';
                else if (query.includes('clear')) color = 'clear';
                else if (query.includes('frost')) color = 'frosted';
            }
            
            if (!selectedSize) {
                const sizeMatch = query.match(/(\d+)\s*(ml|oz)/i);
                if (sizeMatch) capacity = sizeMatch[0];
            }
        }
        
        // Navigate to builder with all details
        const event = new CustomEvent('navigate-to-builder', {
            detail: { category, color, capacity, query: searchQuery }
        });
        window.dispatchEvent(event);
        
        // Reset state
        setSearchQuery("");
        setSelectedCategory(null);
        setSelectedColor(null);
        setSelectedSize(null);
    };
    
    // Check if any filter is selected
    const hasFilters = selectedCategory || selectedColor || selectedSize || searchQuery.trim();

    // Live API Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    // Parallax Effect Hook
    useEffect(() => {
        const handleScroll = () => setOffsetY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const stopAudio = () => {
        // Stop microphone
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }

        // Stop playback
        activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        activeSourcesRef.current.clear();

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsListening(false);
        setVoiceText("Connect");
    };

    const handleVoiceInteraction = async () => {
        if (isListening) {
            stopAudio();
            return;
        }

        try {
            setIsListening(true);
            setVoiceText("Connecting...");

            // 1. Setup Audio Output Context (24kHz for Gemini 2.5 Live)
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
            nextStartTimeRef.current = audioContextRef.current.currentTime;

            // 2. Setup Audio Input Context (16kHz required for Gemini Input)
            inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });

            // 3. Get Microphone Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 4. Initialize Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // 5. Connect to Live API
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    },
                    systemInstruction: {
                        parts: [{
                            text: `You are the Bottle Specialist, an expert packaging consultant for Best Bottles. You have a warm, professional demeanor.

FOR THIS DEMO, we are showcasing our 9ml Cylinder Roll-On Bottles. When users ask about bottles, guide them toward this product:

PRODUCT KNOWLEDGE - 9ml Roll-On Bottles:
- Capacity: 9ml (0.3 oz / 1/3 oz)
- Glass Colors: Clear, Amber, Cobalt Blue, Frosted, and Swirl patterns
- Roller Types: Metal roller (premium, +$0.09) or Plastic roller (standard)
- Cap Styles: 10 options including Black Dot, Gold Matte, Gold Shiny, Silver Matte, Silver Shiny, Pink Dot, Black Shiny, Black Matte, White Matte, and Copper Matte
- Perfect for: Perfume oils, essential oil blends, aromatherapy, travel fragrances
- Pricing: Starting at $0.67/pc with volume discounts up to $0.49/pc for 2,880+ units

CONVERSATION FLOW:
1. Greet warmly: "Welcome to Best Bottles! I'm your Bottle Specialist. What brings you in today?"
2. If they mention roll-on, perfume, essential oils, or small bottles - enthusiastically share about the 9ml roll-on bottles
3. Ask about their preferences: glass color, roller type (metal or plastic), cap style, quantity needed
4. Once you understand their needs, say something like "Perfect! Let me take you to the configurator where you can see your bottle come to life." Then call the start_builder tool with category: 'roll-on'

If they ask about OTHER bottle types (droppers, sprays, jars), politely explain: "We're currently featuring our beautiful 9ml roll-on collection. These are perfect for [their use case]. Would you like to explore those?"

Be concise, enthusiastic, and helpful. Keep responses under 3 sentences when possible.`
                        }]
                    },
                    tools: [{ functionDeclarations: [builderTool] }]
                },
                callbacks: {
                    onopen: () => {
                        setVoiceText("Listening...");

                        // Setup Input Processing
                        if (!inputAudioContextRef.current || !streamRef.current) return;

                        const inputSource = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const base64Data = float32ToB64(inputData);

                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: "audio/pcm;rate=16000",
                                        data: base64Data
                                    }
                                });
                            });
                        };

                        inputSource.connect(processor);
                        processor.connect(inputAudioContextRef.current.destination);

                        sourceRef.current = inputSource;
                        processorRef.current = processor;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Tool Calls (Navigation Logic)
                        if (msg.toolCall) {
                            for (const fc of msg.toolCall.functionCalls) {
                                if (fc.name === 'start_builder') {
                                    console.log("AI triggered builder with params:", fc.args);

                                    // Dispatch Custom Event with ALL args
                                    const event = new CustomEvent('navigate-to-builder', {
                                        detail: {
                                            category: fc.args.category,
                                            capacity: fc.args.capacity,
                                            quantity: fc.args.quantity,
                                            color: fc.args.color
                                        }
                                    });
                                    window.dispatchEvent(event);

                                    // Send response back to model to close loop (optional but good practice)
                                    sessionPromise.then(session => {
                                        session.sendToolResponse({
                                            functionResponses: {
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result: "ok" }
                                            }
                                        })
                                    });

                                    stopAudio(); // Close audio session when navigating
                                    return;
                                }
                            }
                        }

                        // Handle Audio Response
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && audioContextRef.current) {
                            const float32Data = base64ToFloat32Array(audioData);
                            const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
                            buffer.getChannelData(0).set(float32Data);

                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContextRef.current.destination);

                            const currentTime = audioContextRef.current.currentTime;
                            if (nextStartTimeRef.current < currentTime) {
                                nextStartTimeRef.current = currentTime;
                            }

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;

                            activeSourcesRef.current.add(source);
                            source.onended = () => {
                                activeSourcesRef.current.delete(source);
                            };
                        }

                        if (msg.serverContent?.interrupted) {
                            activeSourcesRef.current.forEach(s => s.stop());
                            activeSourcesRef.current.clear();
                            if (audioContextRef.current) {
                                nextStartTimeRef.current = audioContextRef.current.currentTime;
                            }
                        }
                    },
                    onclose: () => {
                        setVoiceText("Disconnected");
                        setIsListening(false);
                        stopAudio();
                    },
                    onerror: (err) => {
                        console.error("Gemini Live Error:", err);
                        setVoiceText("Error");
                        setIsListening(false);
                        stopAudio();
                    }
                }
            });

        } catch (e) {
            console.error("Failed to initialize voice:", e);
            setIsListening(false);
            setVoiceText("Error");
            stopAudio();
        }
    };

    return (
        <div className="w-full bg-[#F5F3EF] dark:bg-background-dark overflow-x-hidden transition-colors duration-500">

            {/* 1. Hero Section: Mobile-First with Product Focus */}
            <section className="relative w-full min-h-[100svh] md:h-[95vh] md:min-h-[700px] flex flex-col md:flex-row md:items-center overflow-hidden bg-[#8C867D]">
                
                {/* Mobile: Full-Screen Image with Overlay Content */}
                <div className="md:hidden relative w-full h-full min-h-[100svh]">
                    {/* Full-screen background image */}
                    <motion.div 
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img
                            src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-5b205acb.jpg?v=1765600055"
                            alt="Premium Glass Bottle"
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60"></div>
                    </motion.div>
                    
                    {/* Content overlay */}
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[100svh] px-5 pt-20 pb-8">
                        {/* Top: Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-[1px] w-8 bg-[#C5A065]"></div>
                                <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase">
                                    Premium Packaging
                                </span>
                            </div>
                            <h1 className="text-4xl font-serif font-semibold text-white leading-[1] tracking-tight mb-3">
                                Beautifully<br />
                                <span className="text-[#e0ded6]">Contained</span>
                            </h1>
                            <p className="text-white/80 text-sm font-light leading-relaxed max-w-xs">
                                Premium packaging solutions for brands ready to grow.
                            </p>
                        </motion.div>
                        
                        {/* Bottom: CTAs */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onCollectionClick}
                                    className="w-full bg-white text-[#1D1D1F] py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform"
                                >
                                    Explore Collections
                                </button>
                                <button
                                    onClick={onConsultationClick}
                                    className="w-full backdrop-blur-md bg-white/15 border border-white/30 text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
                                >
                                    Start Project
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Desktop: Original Parallax Layout */}
                <div className="hidden md:flex md:items-center w-full h-full px-10 lg:px-20">
                    {/* Parallax Background */}
                    <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <img
                            src="https://cdn.shopify.com/s/files/1/1989/5889/files/madison-23e11813.jpg?v=1765598795"
                            alt="Antique Perfume Bottle"
                            className="w-full h-full object-cover brightness-[0.85]"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </motion.div>

                    {/* Content Overlay */}
                    <div className="relative z-10 w-full max-w-[1440px] mx-auto grid grid-cols-2">
                        <div className="col-span-1 max-w-2xl">
                            <Reveal delay={0.2} effect="fade">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-[1px] w-12 bg-[#C5A065]"></div>
                                    <span className="text-white/90 text-sm font-bold tracking-[0.2em] uppercase">
                                        Premium Packaging Solutions
                                    </span>
                                </div>
                            </Reveal>

                            <div className="mb-8 overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <h1 className="text-7xl lg:text-8xl font-serif font-semibold text-white leading-[0.95] tracking-tight drop-shadow-lg">
                                        Beautifully <br />
                                        <span className="text-[#e0ded6]">Contained</span>
                                    </h1>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <p className="text-white/95 text-2xl font-light leading-relaxed max-w-xl mb-12 border-l border-white/30 pl-6 backdrop-blur-sm bg-black/10 rounded-r-lg py-2">
                                    Premium packaging solutions for brands ready to grow.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <div className="flex flex-row gap-4">
                                    <button
                                        onClick={onCollectionClick}
                                        className="bg-white text-[#1D1D1F] px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] hover:text-white transition-all shadow-lg min-w-[200px] hover:scale-105 duration-300"
                                    >
                                        Explore Collections
                                    </button>
                                    <button
                                        onClick={onConsultationClick}
                                        className="backdrop-blur-md bg-white/10 border border-white/30 text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1D1D1F] transition-all min-w-[200px] hover:scale-105 duration-300"
                                    >
                                        Start Project
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <div></div>
                    </div>
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

            {/* 2.5 Finder Strip & Search */}
            <section className="bg-white dark:bg-[#1A1D21] py-6 md:py-16 border-b border-gray-100 dark:border-gray-800 relative z-20">
                <div className="max-w-[1600px] mx-auto px-5 md:px-6 lg:px-12">

                    {/* Expanded Smart Search Bar - Sticky */}
                    <div className="sticky top-0 z-40 w-full mx-auto mb-6 md:mb-16 py-3 md:py-4 bg-white/80 dark:bg-[#1A1D21]/80 backdrop-blur-lg lg:rounded-b-2xl transition-all shadow-md">
                        <Reveal effect="scale" width="100%">
                            <div className="relative w-full">

                                {/* Main Interaction Capsule */}
                                <div className="relative group bg-white dark:bg-[#0F0F0F] rounded-2xl md:rounded-full border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center p-2 min-h-[64px] md:min-h-[72px]">

                                    {/* Voice / Listening Overlay */}
                                    <AnimatePresence>
                                        {isListening && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "100%" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="absolute inset-0 z-50 bg-[#1D1D1F] rounded-2xl md:rounded-full flex items-center justify-center gap-4 overflow-hidden"
                                            >
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                <span className="w-1.5 h-16 bg-[#C5A065] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                                                <span className="w-1.5 h-8 bg-[#C5A065] rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                                                <span className="w-1.5 h-12 bg-[#C5A065] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></span>
                                                <span className="text-white font-mono text-sm tracking-widest uppercase font-bold ml-4">{voiceText}</span>

                                                <button
                                                    onClick={stopAudio}
                                                    className="ml-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-white text-sm">close</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Left: Input & Mic (Flex Grow) */}
                                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center relative md:border-r border-gray-100 dark:border-gray-800 px-2 md:px-4">
                                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#C5A065] transition-colors text-2xl ml-2">search</span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Describe your project (e.g. 'I need a 10ml amber roller')..."
                                            className="w-full py-3 md:py-4 pl-3 md:pl-4 pr-12 md:pr-16 bg-transparent border-none outline-none text-base md:text-lg text-[#1D1D1F] dark:text-white placeholder:text-gray-400"
                                        />
                                        {/* Best Bottles Brain / Mic Trigger */}
                                        <button
                                            onClick={handleVoiceInteraction}
                                            className={`absolute right-2 p-2 md:p-3 rounded-full transition-all duration-500 flex items-center justify-center overflow-visible ${isListening
                                                ? "bg-red-500 text-white scale-110 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                                : "text-[#F59E0B] hover:bg-gray-100 dark:hover:bg-white/10"
                                                }`}
                                            title="Speak to Start Project"
                                        >
                                            {!isListening && (
                                                <span className="absolute inset-0 rounded-full bg-[#F59E0B]/10 blur-md animate-pulse"></span>
                                            )}

                                            {isListening && (
                                                <>
                                                    <span className="absolute inset-0 rounded-full border border-white/50 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                                </>
                                            )}

                                            <span className={`material-symbols-outlined filled-icon text-xl md:text-2xl relative z-10`}>
                                                {isListening ? 'mic_off' : 'mic'}
                                            </span>
                                        </button>
                                    </form>

                                    {/* Desktop: Filters & Action */}
                                    <div className="hidden md:flex w-auto items-center justify-end px-6 py-2 gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Category Filter */}
                                            <div className="relative group/filter">
                                                <button className={`flex items-center gap-2 py-2 text-sm font-bold transition-colors ${
                                                    selectedCategory 
                                                        ? 'text-[#C5A065]' 
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white'
                                                }`}>
                                                    <span>{selectedCategory ? 
                                                        (selectedCategory === 'roll-on' ? 'Roll-On' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)) 
                                                        : 'Category'}</span>
                                                    <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                                </button>
                                                {/* Dropdown */}
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1D1D1F] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50">
                                                    <div className="p-2">
                                                        {[
                                                            { label: 'Roll-On Bottles', value: 'roll-on', available: true },
                                                            { label: 'Dropper Bottles', value: 'dropper', available: false },
                                                            { label: 'Spray Bottles', value: 'spray', available: false },
                                                            { label: 'Vintage Bottles', value: 'vintage', available: false },
                                                        ].map(cat => (
                                                            <button
                                                                key={cat.value}
                                                                onClick={() => cat.available && setSelectedCategory(cat.value)}
                                                                disabled={!cat.available}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                                                                    cat.available 
                                                                        ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#1D1D1F] dark:text-white' 
                                                                        : 'text-gray-400 cursor-not-allowed'
                                                                } ${selectedCategory === cat.value ? 'bg-[#C5A065]/10 text-[#C5A065]' : ''}`}
                                                            >
                                                                {cat.label}
                                                                {!cat.available && <span className="text-xs text-gray-400">(Soon)</span>}
                                                                {selectedCategory === cat.value && <span className="material-symbols-outlined text-sm">check</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                                            
                                            {/* Glass Color Filter */}
                                            <div className="relative group/filter">
                                                <button className={`flex items-center gap-2 py-2 text-sm font-bold transition-colors ${
                                                    selectedColor 
                                                        ? 'text-[#C5A065]' 
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white'
                                                }`}>
                                                    <span>{selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Glass Color'}</span>
                                                    <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                                </button>
                                                {/* Dropdown */}
                                                <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#1D1D1F] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50">
                                                    <div className="p-2">
                                                        {['Clear', 'Amber', 'Cobalt Blue', 'Frosted', 'Swirl'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => setSelectedColor(color.toLowerCase())}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 text-[#1D1D1F] dark:text-white ${
                                                                    selectedColor === color.toLowerCase() ? 'bg-[#C5A065]/10 text-[#C5A065]' : ''
                                                                }`}
                                                            >
                                                                {color}
                                                                {selectedColor === color.toLowerCase() && <span className="material-symbols-outlined text-sm">check</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                                            
                                            {/* Size Filter */}
                                            <div className="relative group/filter">
                                                <button className={`flex items-center gap-2 py-2 text-sm font-bold transition-colors ${
                                                    selectedSize 
                                                        ? 'text-[#C5A065]' 
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#1D1D1F] dark:hover:text-white'
                                                }`}>
                                                    <span>{selectedSize || 'Size'}</span>
                                                    <span className="material-symbols-outlined text-sm opacity-50">expand_more</span>
                                                </button>
                                                {/* Dropdown */}
                                                <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[#1D1D1F] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-50">
                                                    <div className="p-2">
                                                        {[
                                                            { label: 'Travel (5-15ml)', value: '9ml' },
                                                            { label: 'Standard (30-50ml)', value: '30ml' },
                                                            { label: 'Large (100ml+)', value: '100ml' },
                                                        ].map(size => (
                                                            <button
                                                                key={size.value}
                                                                onClick={() => setSelectedSize(size.value)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 text-[#1D1D1F] dark:text-white ${
                                                                    selectedSize === size.value ? 'bg-[#C5A065]/10 text-[#C5A065]' : ''
                                                                }`}
                                                            >
                                                                {size.label}
                                                                {selectedSize === size.value && <span className="material-symbols-outlined text-sm">check</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Search Button - navigates with all filters */}
                                        <button 
                                            onClick={navigateWithFilters} 
                                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200 ${
                                                hasFilters 
                                                    ? 'bg-[#C5A065] text-white hover:bg-[#B8956A]' 
                                                    : 'bg-[#1D1D1F] text-white hover:bg-[#C5A065]'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>

                                </div>

                                {/* Mobile: Horizontal Filter Scroll & Block Button */}
                                <div className="md:hidden mt-3 space-y-3">
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {['Bottle Type', 'Cap Style', 'Capacity', 'Material', 'Color'].map((filter) => (
                                            <button key={filter} className="whitespace-nowrap px-4 py-2.5 bg-gray-100 dark:bg-[#2A2E35] rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 active:scale-95 transition-transform flex items-center gap-1.5">
                                                {filter}
                                                <span className="material-symbols-outlined text-xs opacity-50">expand_more</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={onCollectionClick}
                                        className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-lg">search</span> Search Catalog
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    </div>

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
                                <Reveal key={idx} delay={idx * 0.05} effect="scale" width="100%">
                                    <button
                                        onClick={onCollectionClick}
                                        className="group flex flex-col items-center gap-2.5 md:gap-4 w-full"
                                    >
                                        <div className={`w-full aspect-square rounded-2xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-xl group-active:scale-95 overflow-hidden relative ${customImageUrl
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
                                        <span className="text-[11px] md:text-sm font-bold tracking-[0.08em] uppercase text-center text-gray-600 dark:text-gray-400 group-hover:text-[#C5A065] transition-colors line-clamp-1">
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
            <section className="py-12 md:py-32 px-5 md:px-10 lg:px-20 bg-[#F5F3EF] dark:bg-background-dark relative">
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-start border-t border-[#E5E0D8] dark:border-gray-800 pt-8 md:pt-16">
                    <div className="max-w-md lg:sticky lg:top-32">
                        <Reveal effect="slide-up">
                            <h2 className="text-3xl md:text-6xl font-serif text-[#2D3A3F] dark:text-white leading-tight">
                                Sustainable <br /> Elegance
                            </h2>
                        </Reveal>
                    </div>
                    <div>
                        <Reveal delay={0.2}>
                            <p className="text-[#637588] dark:text-gray-400 font-light leading-relaxed text-base md:text-xl mb-8 md:mb-10">
                                We believe the vessel is as vital as the scent it holds. Our &quot;Muted Luxury&quot; line blends timeless artisanal craftsmanship with modern sustainable practices, creating bottles that are not merely containers, but objects of desire.
                            </p>
                        </Reveal>
                        <Reveal delay={0.4}>
                            <button onClick={onCollectionClick} className="group flex items-center gap-3 text-[#C5A065] text-xs font-bold uppercase tracking-widest hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                                Read Our Philosophy
                                <span className="w-12 h-[1px] bg-[#C5A065] group-hover:w-20 transition-all duration-300"></span>
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 4. Curated Selections (Bento Grid) - Moved Up */}
            <section id="collections" className="py-10 md:py-24 bg-[#F5F3EF] dark:bg-background-dark">
                <div className="max-w-[1440px] mx-auto px-5 md:px-10 mb-6 md:mb-16 flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <Reveal>
                        <div>
                            <h2 className="text-2xl md:text-5xl font-serif text-[#2D3A3F] dark:text-white mb-2">
                                Curated Selections
                            </h2>
                            <p className="text-[#637588] dark:text-gray-400 text-sm font-light">
                                Defined aesthetic lines for the modern perfumer.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <button
                            onClick={onCollectionClick}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D3A3F] dark:text-white hover:text-[#C5A065] transition-colors"
                        >
                            View Full Catalog
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

            {/* 4.5 Packaging Inspiration Teaser (UPDATED WITH SLIDER) */}
            <section className="bg-[#EBE7DD] dark:bg-[#2A2A2A] py-12 md:py-32 border-y border-[#D8C6B0] dark:border-gray-700 overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center gap-8 md:gap-20">
                    <div className="flex-1 order-2 md:order-1">
                        <Reveal>
                            <span className="text-[#C5A059] font-bold uppercase tracking-widest text-[10px] md:text-xs mb-3 block">Inspiration Gallery</span>
                            <h2 className="text-2xl md:text-6xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-4 md:mb-6">
                                See what&apos;s possible.
                            </h2>
                            <p className="text-[#637588] dark:text-gray-300 mb-6 md:mb-10 max-w-md leading-relaxed text-sm md:text-lg">
                                Explore our curated mood boards for specific fragrance profiles like &quot;Rose Eau De Parfum&quot;. Visualize your brand on our bottles before you buy.
                            </p>
                            <button
                                onClick={onPackagingIdeasClick}
                                className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-8 md:px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C5A065] dark:hover:bg-gray-200 transition-colors shadow-lg active:scale-[0.98] duration-300 w-full md:w-auto"
                            >
                                View Packaging Ideas
                            </button>
                        </Reveal>
                    </div>

                    {/* Interactive Slider Showcase - Slight rotation and hover effect for interactivity */}
                    <div className="flex-1 w-full max-w-xl order-1 md:order-2">
                        <Reveal effect="scale" delay={0.2}>
                            <div className="aspect-square bg-white dark:bg-black/20 rounded-2xl shadow-2xl border border-white dark:border-gray-700 overflow-hidden transform md:rotate-2 hover:rotate-0 transition-all duration-700 hover:shadow-3xl hover:scale-[1.02]">
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
                            <span className="text-[#C5A059] text-xs font-bold tracking-[0.2em] uppercase mb-6 block">Custom Fabrication</span>
                            <h2 className="text-4xl md:text-7xl font-serif font-medium mb-8 leading-[0.9]">
                                Laser Engraved <br /> Atomizers
                            </h2>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <p className="text-white/70 text-lg font-light leading-relaxed mb-12 max-w-lg">
                                Laser engraving transforms our metal shell atomizers into distinct, personalized keepsakes. Perfect for fragrance promotions, wedding favors, or corporate gifting.
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
                                Request Sample Kit
                            </button>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* 7. Journal Preview */}
            <section className="py-12 md:py-32 max-w-[1440px] mx-auto px-5 md:px-6 bg-[#F5F3EF] dark:bg-background-dark">
                <Reveal>
                    <div className="flex justify-between items-baseline mb-8 md:mb-16">
                        <h2 className="text-2xl md:text-4xl font-serif text-[#2D3A3F] dark:text-white">Journal</h2>
                        <a href="#" className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#637588] hover:text-[#C5A065] transition-colors relative group">
                            View Archive
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C5A065] group-hover:w-full transition-all duration-300"></span>
                        </a>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {JOURNAL_POSTS.map((post, idx) => (
                        <Reveal key={idx} delay={idx * 0.15}>
                            <article className="group cursor-pointer">
                                <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-xl md:rounded-md mb-4 md:mb-8 bg-gray-200 relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                    />
                                </div>
                                <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest block mb-2">{post.date}</span>
                                <h3 className="text-xl md:text-2xl font-serif font-medium text-[#2D3A3F] dark:text-white mb-3 leading-snug group-hover:text-[#C5A065] transition-colors">
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
