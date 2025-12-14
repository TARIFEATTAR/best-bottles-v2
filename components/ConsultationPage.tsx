import React, { useState, useEffect, useRef, useMemo } from "react";
import { ProjectDraft } from "../App";

// Import our 9ml roll-on product family data
import rollOnData from "../data/roll-on-9ml-cylinder.json";

// --- Demo Voice Responses (simulated for demo without API) ---
const DEMO_VOICE_RESPONSES = [
    {
        trigger: 'greeting',
        text: "Hi there. I'm your Bottle Specialist. I'd love to help you find the perfect packaging. Are you looking for roll-on bottles today?",
        duration: 4000
    },
    {
        trigger: 'roll-on',
        text: "Excellent choice. Our 9ml roll-on bottles are perfect for perfume oils and essential oils. They come in clear, amber, blue, frosted, and swirl glass. Would you like to customize one?",
        duration: 5000
    },
    {
        trigger: 'yes',
        text: "Perfect. Let me take you to the configurator where you can select your glass color, roller type, and cap style.",
        duration: 3500,
        action: 'navigate'
    },
    {
        trigger: 'default',
        text: "I'd be happy to help. For this demo, we're featuring our beautiful 9ml roll-on bottles. They're perfect for fragrance oils. Shall I show you the options?",
        duration: 4500
    }
];

// --- Types ---

interface ConsultationPageProps {
    onBack?: () => void;
    projectDraft?: ProjectDraft | null;
    onAddToCart?: (product: any, quantity: number) => void;
}

interface BaseBottle {
    id: string;
    name: string;
    color: string;
    material: string;
    imageUrl: string;
    skuPrefix: string;
    imageUrlMetal?: string;
    imageUrlPlastic?: string;
}

interface RollerOption {
    id: string;
    name: string;
    type: 'metal' | 'plastic';
    skuCode: string;
    priceModifier: number;
    description: string;
}

interface CapOption {
    id: string;
    name: string;
    color: string;
    finish: string;
    skuCode: string;
    imageCode: string;
    imageUrl: string;
    hasCompositeImage: boolean;
    available: boolean;
}

interface ChatMessage {
    role: 'assistant' | 'user';
    text: string;
    options?: { label: string; value: string; icon?: string }[];
}

// Type assertion for our JSON data
const productData = rollOnData as {
    categoryId: string;
    categoryName: string;
    categoryDescription: string;
    sharedSpecs: any;
    baseBottles: BaseBottle[];
    rollerOptions: RollerOption[];
    capOptions: CapOption[];
    pricingMatrix: {
        basePrices: Record<string, Record<string, number>>;
        metalRollerUpcharge: number;
    };
};

// --- Sub-Components ---

interface TopBarProps {
    assistantInput: string;
    setAssistantInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    showInput?: boolean;
}

interface TopBarExtendedProps extends TopBarProps {
    onBack?: () => void;
}

const TopBar: React.FC<TopBarExtendedProps> = ({ assistantInput, setAssistantInput, onSubmit, showInput = true, onBack }) => (
    <div className="w-full bg-[#1D1D1F] dark:bg-[#111] text-white py-3 px-4 md:py-4 md:px-8 flex items-center gap-3 md:gap-4 shrink-0 shadow-md z-40 transition-all">
        {/* Back Button */}
        {onBack && (
            <button 
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
        )}
        
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-base md:text-lg">science</span>
            </div>
            <div>
                <span className="block text-xs md:text-sm font-serif font-bold tracking-wide">Bottle Specialist</span>
                <span className="flex items-center gap-1 text-[8px] md:text-[10px] text-green-400 font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                </span>
            </div>
        </div>
        
        <div className="flex-1" /> {/* Spacer */}

        {showInput && (
            <form onSubmit={onSubmit} className="flex-1 w-full max-w-4xl mx-auto relative group">
                <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="Ask about roll-on bottles, caps, or materials..."
                    className="w-full bg-white/10 border border-white/5 group-hover:border-white/20 rounded-full py-2.5 pl-5 pr-10 md:py-3 md:pl-6 md:pr-12 text-xs md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all font-light"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="submit" className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-xs md:text-sm">arrow_upward</span>
                    </button>
                </div>
            </form>
        )}
    </div>
);

export const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack, projectDraft, onAddToCart }) => {
    // Mode: 'brief' (intake chat) -> 'studio' (builder)
    const [mode, setMode] = useState<'brief' | 'studio'>('brief');

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            text: "Welcome! I'm your Bottle Specialist. Tap the microphone below to speak with me, or type your message. What are you looking for today?",
            options: [
                { label: 'Roll-On Bottles', value: 'roll-on', icon: 'ph-thin ph-flask' },
                { label: 'Dropper Bottles', value: 'dropper', icon: 'ph-thin ph-drop' },
                { label: 'Spray Bottles', value: 'spray', icon: 'ph-thin ph-spray-bottle' },
            ]
        }
    ]);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Voice State (Demo Mode - uses Web Speech API)
    const [isListening, setIsListening] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const conversationStageRef = useRef(0);

    // Initialize speech synthesis
    useEffect(() => {
        synthRef.current = window.speechSynthesis;
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Speak text using Web Speech API
    const speak = (text: string, onEnd?: () => void) => {
        if (!synthRef.current) return;
        
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Try to get a nice voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Samantha') || 
            v.name.includes('Karen') || 
            v.name.includes('Google') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.onstart = () => setVoiceStatus('speaking');
        utterance.onend = () => {
            setVoiceStatus('listening');
            onEnd?.();
        };
        
        synthRef.current.speak(utterance);
    };

    // Process voice input and respond
    const processVoiceInput = (transcript: string) => {
        const lower = transcript.toLowerCase();
        let response = DEMO_VOICE_RESPONSES.find(r => r.trigger === 'default')!;
        
        // Determine response based on conversation stage and keywords
        if (conversationStageRef.current === 0) {
            response = DEMO_VOICE_RESPONSES.find(r => r.trigger === 'greeting')!;
            conversationStageRef.current = 1;
        } else if (lower.includes('roll') || lower.includes('perfume') || lower.includes('oil') || lower.includes('essential')) {
            response = DEMO_VOICE_RESPONSES.find(r => r.trigger === 'roll-on')!;
            conversationStageRef.current = 2;
        } else if (lower.includes('yes') || lower.includes('sure') || lower.includes('okay') || lower.includes('show') || lower.includes('let') || lower.includes('configure') || lower.includes('customize')) {
            response = DEMO_VOICE_RESPONSES.find(r => r.trigger === 'yes')!;
        }
        
        // Add assistant message to chat
        setMessages(prev => [...prev, { role: 'assistant', text: response.text }]);
        
        // Speak the response
        speak(response.text, () => {
            if (response.action === 'navigate') {
                setTimeout(() => {
                    stopVoice();
                    setMode('studio');
                }, 500);
            }
        });
    };

    // Stop voice session
    const stopVoice = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        setIsListening(false);
        setVoiceStatus('idle');
        setVoiceTranscript('');
    };

    // Start voice session
    const startVoice = async () => {
        if (isListening) {
            stopVoice();
            return;
        }

        // Check for Web Speech API support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        try {
            setIsListening(true);
            setVoiceStatus('connecting');
            conversationStageRef.current = 0;

            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Initialize speech recognition
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setVoiceStatus('listening');
                // Greet the user after a short delay
                setTimeout(() => {
                    processVoiceInput('');
                }, 1000);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript = transcript;
                    }
                }

                setVoiceTranscript(interimTranscript || finalTranscript);

                if (finalTranscript && voiceStatus !== 'speaking') {
                    // Add user message
                    setMessages(prev => [...prev, { role: 'user', text: finalTranscript }]);
                    setVoiceTranscript('');
                    
                    // Process and respond
                    setTimeout(() => processVoiceInput(finalTranscript), 500);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    setVoiceStatus('error');
                }
            };

            recognition.onend = () => {
                // Restart if still listening and not speaking
                if (isListening && voiceStatus !== 'speaking') {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Ignore - might already be running
                    }
                }
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (e) {
            console.error("Failed to start voice:", e);
            setIsListening(false);
            setVoiceStatus('error');
            alert('Could not access microphone. Please allow microphone permissions.');
        }
    };

    // Studio State
    const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0); // 0: Vessel, 1: Fitment, 2: Closure
    const [selections, setSelections] = useState<{
        vessel: BaseBottle | null;
        fitment: RollerOption | null;
        closure: CapOption | null;
        quantity: number;
    }>({
        vessel: productData.baseBottles[0], // Default to first bottle (Clear)
        fitment: productData.rollerOptions[0], // Default to Metal roller
        closure: productData.capOptions[0], // Default to Black Dot cap
        quantity: 100
    });

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize from draft
    useEffect(() => {
        if (projectDraft) {
            setMode('studio');
        }
    }, [projectDraft]);

    // --- Chat Logic ---
    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        processUserMessage(chatInput);
        setChatInput("");
    };

    const handleOptionClick = (value: string) => {
        processUserMessage(value);
    };

    const processUserMessage = (input: string) => {
        const lowerInput = input.toLowerCase();

        // Add user message
        setMessages(prev => [...prev, { role: 'user', text: input }]);

        // Process based on keywords
        setTimeout(() => {
            if (lowerInput.includes('roll-on') || lowerInput.includes('roll on') || lowerInput.includes('roller')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: `Excellent choice! We have beautiful 9ml Cylinder Roll-On Bottles available.\n\nGlass Options: Clear, Amber, Cobalt Blue, Frosted, and Swirl patterns\n\nRoller Types: Metal (premium) or Plastic\n\nCap Styles: 10 different finishes including Black Dot, Gold, Silver, Pink, and more.\n\nWould you like to customize your roll-on bottle now?`,
                    options: [
                        { label: 'Yes, let\'s build it', value: 'start-studio', icon: 'ph-thin ph-arrow-right' },
                        { label: 'Tell me more', value: 'more-info', icon: 'ph-thin ph-info' }
                    ]
                }]);
            } else if (lowerInput.includes('start-studio') || lowerInput.includes('build') || lowerInput.includes('customize') || lowerInput.includes('yes')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "Perfect! Let me open the configurator for you. You'll be able to select your glass color, roller type, and cap style."
                }]);
                setTimeout(() => setMode('studio'), 1000);
            } else if (lowerInput.includes('more-info') || lowerInput.includes('tell me more')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: `Here's what makes our 9ml Roll-On bottles special:\n\nSpecifications:\nCapacity: 9ml (0.3 oz)\nHeight with cap: 83mm\nDiameter: 20mm\nNeck thread: 17-415\n\nPerfect for:\nPerfume oils\nEssential oil blends\nAromatherapy\nTravel-size fragrances\n\nPricing starts at $0.67 per piece with bulk discounts available.\n\nReady to start configuring?`,
                    options: [
                        { label: 'Start Configuring', value: 'start-studio', icon: 'ph-thin ph-sliders-horizontal' },
                        { label: 'Show Pricing', value: 'pricing', icon: 'ph-thin ph-tag' }
                    ]
                }]);
            } else if (lowerInput.includes('pricing') || lowerInput.includes('price') || lowerInput.includes('cost')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: `Volume Pricing for Clear Glass with Plastic Roller:\n\n1 piece: $0.67 each\n12 pieces: $0.63 each\n144 pieces: $0.59 each\n576 pieces: $0.55 each\n2,880 pieces: $0.49 each\n\nMetal roller adds $0.09 per piece.\nColored glass may vary slightly.\n\nWould you like to configure your order?`,
                    options: [
                        { label: 'Configure My Order', value: 'start-studio', icon: 'ph-thin ph-shopping-cart' }
                    ]
                }]);
            } else if (lowerInput.includes('dropper') || lowerInput.includes('spray')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "We're currently showcasing our Roll-On Bottle collection in this demo. Dropper and spray bottles will be available soon.\n\nWould you like to explore our roll-on options instead?",
                    options: [
                        { label: 'Show Roll-On Bottles', value: 'roll-on', icon: 'ph-thin ph-flask' }
                    ]
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "I'd be happy to help! For this demo, we're featuring our 9ml Roll-On Bottles. These are perfect for perfume oils, essential oils, and aromatherapy blends.\n\nWould you like to see what's available?",
                    options: [
                        { label: 'Show Roll-On Bottles', value: 'roll-on', icon: 'ph-thin ph-flask' },
                        { label: 'What options are available?', value: 'more-info', icon: 'ph-thin ph-question' }
                    ]
                }]);
            }
        }, 500);
    };

    // --- Pricing Calculation ---
    const pricingInfo = useMemo(() => {
        if (!selections.vessel) return { unitPrice: 0, total: 0, tierLabel: '', nextTier: null };
        
        const basePrices = productData.pricingMatrix.basePrices[selections.vessel.id];
        if (!basePrices) return { unitPrice: 0, total: 0, tierLabel: '', nextTier: null };

        // Get all tiers sorted ascending
        const tiers = Object.entries(basePrices)
            .map(([qty, price]) => ({ qty: parseInt(qty), price }))
            .sort((a, b) => a.qty - b.qty);

        // Find current tier (highest tier where qty >= tier.qty)
        let currentTier = tiers[0];
        let nextTier: { qty: number; price: number } | null = null;
        
        for (let i = 0; i < tiers.length; i++) {
            if (selections.quantity >= tiers[i].qty) {
                currentTier = tiers[i];
                nextTier = tiers[i + 1] || null;
            }
        }

        const rollerUpcharge = selections.fitment?.type === 'metal' 
            ? productData.pricingMatrix.metalRollerUpcharge 
            : 0;

        const unitPrice = currentTier.price + rollerUpcharge;
        const total = unitPrice * selections.quantity;
        
        // Create tier label
        let tierLabel = '';
        if (currentTier.qty === 1) {
            tierLabel = 'Single unit';
        } else {
            tierLabel = `${currentTier.qty}+ tier`;
        }

        return { 
            unitPrice, 
            total, 
            tierLabel,
            nextTier: nextTier ? {
                qty: nextTier.qty,
                savings: (currentTier.price - nextTier.price).toFixed(2)
            } : null
        };
    }, [selections.vessel, selections.fitment, selections.quantity]);

    const calculateUnitPrice = () => pricingInfo.unitPrice;
    const calculateTotal = () => pricingInfo.total.toFixed(2);

    // --- Generate Composite Image URL ---
    const getCompositeImageUrl = () => {
        if (!selections.vessel || !selections.fitment || !selections.closure) {
            return selections.vessel?.imageUrl || '';
        }

        const baseUrl = 'https://www.bestbottles.com/images/store/enlarged_pics/';
        const rollerCode = selections.fitment.type === 'metal' ? 'MtlRoll' : 'Roll';
        const capCode = selections.closure.imageCode;

        return `${baseUrl}${selections.vessel.skuPrefix}${rollerCode}${capCode}.gif`;
    };

    // --- Generate SKU ---
    const generateSku = () => {
        if (!selections.vessel || !selections.fitment || !selections.closure) return 'N/A';
        const rollerCode = selections.fitment.type === 'metal' ? 'MtlRoll' : 'Roll';
        return `${selections.vessel.skuPrefix}${rollerCode}${selections.closure.skuCode}`;
    };

    // --- Handle Add to Cart ---
    const handleFinishKit = () => {
        if (!selections.vessel || !selections.closure) return;

        const customProduct = {
            name: `9ml ${selections.vessel.name} Roll-On Bottle`,
            variant: `${selections.fitment?.name} + ${selections.closure.name} Cap`,
            price: calculateUnitPrice(),
            imageUrl: getCompositeImageUrl(),
            category: 'Roll-On Bottles',
            sku: generateSku(),
            specs: productData.sharedSpecs
        };

        onAddToCart?.(customProduct, selections.quantity);
    };

    // --- Render: Briefing (Chat Interface) ---
    if (mode === 'brief') {
        return (
            <div className="h-screen bg-white dark:bg-background-dark font-sans flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <TopBar 
                    assistantInput={chatInput} 
                    setAssistantInput={setChatInput} 
                    onSubmit={handleChatSubmit}
                    showInput={false}
                    onBack={onBack}
                />

                {/* Scrollable Chat Area */}
                <div className="flex-1 overflow-y-auto relative flex flex-col">
                    {/* Chat Messages - Centered vertically when few messages */}
                    <div className="flex-1 flex flex-col justify-center px-4 md:px-8 py-4 max-w-3xl mx-auto w-full min-h-0">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-[#1D1D1F] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xs">science</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bottle Specialist</span>
                                            </div>
                                        )}
                                        <div className={`rounded-2xl px-4 py-3 ${
                                            msg.role === 'user' 
                                                ? 'bg-[#1D1D1F] text-white rounded-br-sm' 
                                                : 'bg-gray-100 dark:bg-white/10 text-[#1D1D1F] dark:text-white rounded-bl-sm'
                                        }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                                        </div>

                                        {/* Quick Reply Options */}
                                        {msg.options && msg.role === 'assistant' && (
                                            <div className="flex flex-wrap gap-3 mt-5">
                                                {msg.options.map((opt, optIdx) => (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleOptionClick(opt.value)}
                                                        className="group flex items-center gap-3 px-6 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-[#1D1D1F] dark:text-white hover:border-gold hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5 transition-all duration-300"
                                                    >
                                                        {opt.icon && (
                                                            <i className={`${opt.icon} text-xl text-gray-400 group-hover:text-gold transition-colors`} />
                                                        )}
                                                        <span className="tracking-wide">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} className="h-4" />
                        </div>
                    </div>
                </div>

                {/* Fixed Input at Bottom */}
                <div className="shrink-0 bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 p-4 md:p-6">
                        <div className="max-w-3xl mx-auto">
                            
                            {/* Voice Interface - When Listening */}
                            {isListening && (
                                <div className="mb-4 bg-[#1D1D1F] rounded-2xl p-4 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    voiceStatus === 'speaking' ? 'bg-gold' : 'bg-white/20'
                                                } transition-colors`}>
                                                    <span className="material-symbols-outlined text-white text-xl">
                                                        {voiceStatus === 'speaking' ? 'volume_up' : 'mic'}
                                                    </span>
                                                </div>
                                                {voiceStatus === 'listening' && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="block text-white text-sm font-medium">
                                                    {voiceStatus === 'connecting' && 'Starting...'}
                                                    {voiceStatus === 'listening' && 'Listening... speak now'}
                                                    {voiceStatus === 'speaking' && 'Specialist speaking...'}
                                                    {voiceStatus === 'error' && 'Microphone error'}
                                                </span>
                                                <span className="block text-white/50 text-xs">
                                                    {voiceStatus === 'listening' && 'Say "roll-on bottles" or "yes"'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Audio Visualizer */}
                                        <div className="flex items-center gap-1">
                                            <span className={`w-1 h-4 bg-gold rounded-full ${voiceStatus === 'speaking' ? 'animate-[pulse_0.5s_ease-in-out_infinite]' : voiceStatus === 'listening' ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`} />
                                            <span className={`w-1 h-6 bg-gold rounded-full ${voiceStatus === 'speaking' ? 'animate-[pulse_0.7s_ease-in-out_infinite]' : voiceStatus === 'listening' ? 'animate-[pulse_1.2s_ease-in-out_infinite]' : ''}`} />
                                            <span className={`w-1 h-8 bg-gold rounded-full ${voiceStatus === 'speaking' ? 'animate-[pulse_0.4s_ease-in-out_infinite]' : voiceStatus === 'listening' ? 'animate-[pulse_0.9s_ease-in-out_infinite]' : ''}`} />
                                            <span className={`w-1 h-5 bg-gold rounded-full ${voiceStatus === 'speaking' ? 'animate-[pulse_0.6s_ease-in-out_infinite]' : voiceStatus === 'listening' ? 'animate-[pulse_1.1s_ease-in-out_infinite]' : ''}`} />
                                            <span className={`w-1 h-3 bg-gold rounded-full ${voiceStatus === 'speaking' ? 'animate-[pulse_0.8s_ease-in-out_infinite]' : voiceStatus === 'listening' ? 'animate-[pulse_1.3s_ease-in-out_infinite]' : ''}`} />
                                        </div>

                                        <button
                                            onClick={stopVoice}
                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-white text-sm">close</span>
                                        </button>
                                    </div>
                                    
                                    {/* Live transcript */}
                                    {voiceTranscript && (
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-white/70 text-sm italic">"{voiceTranscript}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Main Input Area */}
                            <div className="flex items-center gap-3">
                                {/* Voice Button */}
                                <button
                                    onClick={startVoice}
                                    className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                        isListening 
                                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                            : 'bg-[#1D1D1F] hover:bg-[#2D2D2F] hover:scale-105'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-white text-xl md:text-2xl">
                                        {isListening ? 'mic_off' : 'mic'}
                                    </span>
                                </button>

                                {/* Text Input */}
                                <form onSubmit={handleChatSubmit} className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder={isListening ? "Or type while speaking..." : "Type or tap the mic to speak..."}
                                        className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-full py-3 pl-5 pr-12 text-sm text-[#1D1D1F] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1D1D1F] dark:bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-white dark:text-[#1D1D1F] text-sm">arrow_upward</span>
                                    </button>
                                </form>
                            </div>

                            {/* Voice Hint */}
                            {!isListening && (
                                <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                                    <i className="ph-thin ph-lightbulb text-sm" />
                                    Tap the microphone for a hands-free conversation with the Bottle Specialist
                                </p>
                            )}
                        </div>
                    </div>
            </div>
        );
    }

    // --- Render: Studio (Builder) ---
    return (
        <div className="h-screen bg-[#F5F5F7] dark:bg-background-dark flex flex-col overflow-hidden">
            <TopBar 
                assistantInput="" 
                setAssistantInput={() => {}} 
                onSubmit={() => {}}
                showInput={false}
            />

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left: Preview Canvas */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-white dark:bg-[#151515] relative flex flex-col justify-center items-center p-6 md:p-12 shadow-xl z-20 border-r border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={() => setMode('brief')} 
                        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Chat
                    </button>

                    {/* Live Preview */}
                    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                        <img
                            src={getCompositeImageUrl()}
                            className="h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal z-10 drop-shadow-2xl transition-all duration-500"
                            alt="Product Preview"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = selections.vessel?.imageUrl || '';
                            }}
                        />

                        {/* Selection Badges */}
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                            {selections.vessel?.name}
                        </div>

                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                            <span 
                                className="w-2.5 h-2.5 rounded-full border border-gray-400"
                                style={{ backgroundColor: selections.closure?.color }}
                            />
                            {selections.closure?.name}
                        </div>

                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                            <i className={`ph-thin ${selections.fitment?.type === 'metal' ? 'ph-circle-fill' : 'ph-circle'} text-xs mr-1`} /> {selections.fitment?.name}
                        </div>
                    </div>

                    {/* Kit Summary */}
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col gap-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Your Configuration</span>
                        <span className="text-gray-600 dark:text-gray-400">1. Vessel: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.vessel?.name}</span></span>
                        <span className="text-gray-600 dark:text-gray-400">2. Fitment: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.fitment?.name}</span></span>
                        <span className="text-gray-600 dark:text-gray-400">3. Closure: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.closure?.name}</span></span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-right">
                        <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Estimate</span>
                        <span className="block text-2xl md:text-3xl font-serif text-[#1D1D1F] dark:text-white">${calculateTotal()}</span>
                        <span className="block text-[10px] text-gray-400 mt-1">
                            ${calculateUnitPrice().toFixed(2)} / unit × {selections.quantity}
                        </span>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col bg-[#F9F8F6] dark:bg-background-dark relative">

                    {/* Steps Navigation */}
                    <div className="shrink-0 bg-[#F9F8F6]/95 dark:bg-background-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center z-10">
                        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar">
                            {['1. Vessel', '2. Fitment', '3. Closure'].map((stepLabel, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveStep(idx as 0 | 1 | 2)}
                                    className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-1 transition-all relative whitespace-nowrap ${
                                        activeStep === idx
                                            ? 'text-[#1D1D1F] dark:text-white border-b-2 border-gold'
                                            : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                                    }`}
                                >
                                    {stepLabel}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleFinishKit}
                            className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-4 md:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            Add to Cart
                        </button>
                    </div>

                    {/* Options */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 no-scrollbar">

                        {/* Quantity Control */}
                        <div className="mb-6 p-3 md:p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">Quantity</span>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <button
                                        onClick={() => setSelections(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <input
                                        type="number"
                                        value={selections.quantity}
                                        onChange={(e) => setSelections(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                        className="w-20 text-center font-bold text-[#1D1D1F] dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-600 rounded-lg py-1 text-sm"
                                    />
                                    <button
                                        onClick={() => setSelections(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Quick quantity buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {[1, 12, 144, 576].map(qty => (
                                    <button
                                        key={qty}
                                        onClick={() => setSelections(prev => ({ ...prev, quantity: qty }))}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                                            selections.quantity === qty 
                                                ? 'bg-gold text-white' 
                                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {qty}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Pricing tier info */}
                            {pricingInfo.nextTier && (
                                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                    <i className="ph-thin ph-lightbulb text-sm text-gold" />
                                    Order {pricingInfo.nextTier.qty}+ to save ${pricingInfo.nextTier.savings}/unit
                                </p>
                            )}
                        </div>

                        {/* Step 1: Vessel (Glass Colors) */}
                        {activeStep === 0 && (
                            <div className="animate-fade-in">
                                <h2 className="text-lg md:text-xl font-serif text-[#1D1D1F] dark:text-white mb-4">Select Glass Color</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {productData.baseBottles.map((bottle) => (
                                        <button
                                            key={bottle.id}
                                            onClick={() => {
                                                setSelections(prev => ({ ...prev, vessel: bottle }));
                                                setTimeout(() => setActiveStep(1), 300);
                                            }}
                                            className={`group relative aspect-square bg-white dark:bg-white/5 rounded-xl border transition-all duration-300 p-3 flex flex-col items-center justify-center gap-2 hover:shadow-lg ${
                                                selections.vessel?.id === bottle.id
                                                    ? 'border-gold ring-2 ring-gold shadow-md'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={bottle.imageUrl}
                                                className="h-16 md:h-20 object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform"
                                                alt={bottle.name}
                                            />
                                            <span className="text-[10px] md:text-xs font-bold text-[#1D1D1F] dark:text-white text-center">{bottle.name}</span>
                                            {selections.vessel?.id === bottle.id && (
                                                <div className="absolute top-2 right-2 text-gold">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Fitment (Roller Type) */}
                        {activeStep === 1 && (
                            <div className="animate-fade-in">
                                <h2 className="text-lg md:text-xl font-serif text-[#1D1D1F] dark:text-white mb-4">Select Roller Type</h2>
                                <div className="space-y-3">
                                    {productData.rollerOptions.map((roller) => (
                                        <button
                                            key={roller.id}
                                            onClick={() => {
                                                setSelections(prev => ({ ...prev, fitment: roller }));
                                                setTimeout(() => setActiveStep(2), 300);
                                            }}
                                            className={`w-full p-4 md:p-5 rounded-xl border flex items-center justify-between transition-all group hover:shadow-md ${
                                                selections.fitment?.id === roller.id
                                                    ? 'bg-white dark:bg-white/10 border-gold shadow-sm ring-2 ring-gold'
                                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
                                                    selections.fitment?.id === roller.id ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                                }`}>
                                                    <span className="material-symbols-outlined text-xl md:text-2xl">
                                                        {roller.type === 'metal' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm md:text-base font-bold text-[#1D1D1F] dark:text-white">{roller.name}</span>
                                                    <span className="block text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{roller.description}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                                                {roller.priceModifier === 0 ? 'Standard' : `+$${roller.priceModifier.toFixed(2)}`}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Closure (Caps) */}
                        {activeStep === 2 && (
                            <div className="animate-fade-in">
                                <h2 className="text-lg md:text-xl font-serif text-[#1D1D1F] dark:text-white mb-2">Select Cap Style</h2>
                                <p className="text-[10px] text-gray-400 mb-4">
                                    <span className="text-green-500">●</span> All caps update the live preview
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                                    {productData.capOptions.map((cap) => (
                                        <button
                                            key={cap.id}
                                            onClick={() => setSelections(prev => ({ ...prev, closure: cap }))}
                                            className={`group relative aspect-square bg-white dark:bg-white/5 rounded-xl border transition-all p-2 flex flex-col items-center justify-center gap-1 hover:shadow-md ${
                                                selections.closure?.id === cap.id
                                                    ? 'border-gold ring-2 ring-gold'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {cap.hasCompositeImage && (
                                                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                                            )}
                                            <img
                                                src={cap.imageUrl}
                                                className="h-10 md:h-12 object-contain"
                                                alt={cap.name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <span className="text-[8px] md:text-[9px] font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">
                                                {cap.name}
                                            </span>
                                            {selections.closure?.id === cap.id && (
                                                <div className="absolute top-1 left-1 text-gold">
                                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Mobile Add to Cart */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1D1D1F] border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-30">
                        <div>
                            <span className="block text-[10px] text-gray-400 uppercase">Total</span>
                            <span className="block text-xl font-serif text-[#1D1D1F] dark:text-white">${calculateTotal()}</span>
                        </div>
                        <button
                            onClick={handleFinishKit}
                            className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationPage;
