import React, { useState, useEffect, useRef, useMemo } from "react";
import { ProjectDraft } from "../App";
import { VisualizeModal } from "./VisualizeModal";
import { useConversation } from "@elevenlabs/react";

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
    text?: string;
    content?: string; // alternate field for text
    options?: { label: string; value: string; icon?: string }[];
    showCategories?: boolean;
    showCartSummary?: { quantity: number; name: string; price: string };
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
    labelSpecs: {
        wrapLabel: {
            name: string;
            width: string;
            height: string;
            description: string;
            bleed: string;
            safeZone: string;
        };
        frontLabel: {
            name: string;
            width: string;
            height: string;
            description: string;
            bleed: string;
            safeZone: string;
        };
    };
    labelPartners: {
        name: string;
        url: string;
        description: string;
    }[];
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
        {/* Logo / Home Link - Always visible */}
        <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Back to Home"
        >
            <span className="text-lg md:text-xl font-serif font-bold tracking-tight">BB</span>
            <span className="hidden md:block h-6 w-[1px] bg-white/20 mx-1"></span>
        </button>

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

        {/* Exit Button - Clear and always visible */}
        <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
        >
            <span className="hidden md:inline">Exit</span>
            <i className="ph-thin ph-x text-sm md:text-base" />
        </button>
    </div>
);

export const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack, projectDraft, onAddToCart }) => {
    // Mode: 'brief' (intake chat) -> 'studio' (builder)
    const [mode, setMode] = useState<'brief' | 'studio'>('brief');

    // Category Data with Images
    // Note: Replace these placeholder URLs with actual hosted category images from bestbottles.com
    const categories = [
        { id: 'vintage', label: 'VINTAGE BOTTLES', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&auto=format', available: false },
        { id: 'oil-vials', label: 'OIL VIALS', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop&auto=format', available: false },
        { id: 'essential', label: 'ESSENTIAL OILS', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop&auto=format', available: false },
        { id: 'roll-on', label: 'ROLL-ONS', image: 'https://www.bestbottles.com/images/store/enlarged_pics/GBCyl9MtlRollBlkDot.gif', available: true },
        { id: 'closures', label: 'CLOSURES', image: 'https://images.unsplash.com/photo-1586015555751-63c29b86dc52?w=400&h=400&fit=crop&auto=format', available: false },
        { id: 'accessories', label: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop&auto=format', available: false },
    ];

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            text: "Welcome! I'm your Bottle Specialist. Which category are you interested in?",
            showCategories: true
        }
    ]);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Voice State (ElevenLabs Grace)
    const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [voiceTranscript, setVoiceTranscript] = useState('');

    // ElevenLabs Agent ID
    const elevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

    // ElevenLabs Conversation Hook
    const conversation = useConversation({
        onConnect: () => {
            console.log("✅ Connected to Grace in Consultation");
            setVoiceStatus('listening');
            // Add welcome message
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "Hello! I'm Grace, your bottle specialist. I'm here to help you find the perfect packaging. What are you looking for today?"
            }]);
        },
        onDisconnect: () => {
            console.log("❌ Disconnected from Grace");
            setVoiceStatus('idle');
        },
        onMessage: (message) => {
            console.log("📨 Grace says:", message);
            if (message.message) {
                // Add Grace's response to chat
                setMessages(prev => [...prev, { role: 'assistant', text: message.message }]);

                // Check for navigation triggers
                const lower = message.message.toLowerCase();
                if (lower.includes('configurator') || lower.includes('studio') || lower.includes('customize')) {
                    setTimeout(() => setMode('studio'), 2000);
                }
            }
        },
        onError: (error) => {
            console.error("❌ Grace error:", error);
            setVoiceStatus('error');
        },
    });

    const isListening = conversation.status === 'connected';
    const isConnecting = conversation.status === 'connecting';

    // Stop voice session
    const stopVoice = async () => {
        if (conversation.status === 'connected') {
            await conversation.endSession();
        }
        setVoiceStatus('idle');
        setVoiceTranscript('');
    };

    // Start voice session with ElevenLabs Grace
    const startVoice = async () => {
        if (isListening) {
            await stopVoice();
            return;
        }

        if (!elevenLabsAgentId) {
            console.error("ElevenLabs Agent ID not configured");
            setVoiceStatus('error');
            alert('Please add VITE_ELEVENLABS_AGENT_ID to your .env file');
            return;
        }

        try {
            setVoiceStatus('connecting');

            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start ElevenLabs conversation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await conversation.startSession({
                agentId: elevenLabsAgentId,
            } as any);

        } catch (e) {
            console.error("Failed to start Grace:", e);
            setVoiceStatus('error');
            alert('Could not access microphone. Please allow microphone permissions.');
        }
    };

    // Studio State
    const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0); // 0: Bottle, 1: Fitment, 2: Cap
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

    // Visualize Modal State
    const [showVisualizeModal, setShowVisualizeModal] = useState(false);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize from draft - add welcome message and transition to studio
    useEffect(() => {
        if (projectDraft) {
            // Defer all state updates to avoid synchronous setState in effect
            const timer = requestAnimationFrame(() => {
                // Add a personalized welcome message based on what they asked for
                const categoryName = projectDraft.category === 'roll-on' ? 'Roll-On Bottles' :
                    projectDraft.category === 'dropper' ? 'Dropper Bottles' :
                        projectDraft.category === 'spray' ? 'Spray Bottles' : 'bottles';

                setMessages([{
                    role: 'assistant',
                    text: `Perfect! Based on our conversation, I've prepared our ${categoryName} collection for you.${projectDraft.color ? ` I noticed you're interested in ${projectDraft.color} glass.` : ''}\n\nLet me take you to the configurator where you can customize every detail.`
                }]);

                // Pre-select color if specified
                if (projectDraft.color) {
                    const matchingBottle = productData.baseBottles.find(
                        b => b.color.toLowerCase().includes(projectDraft.color?.toLowerCase() || '')
                    );
                    if (matchingBottle) {
                        setSelections(prev => ({ ...prev, vessel: matchingBottle }));
                    }
                }

                // Pre-set quantity if specified
                if (projectDraft.quantity) {
                    setSelections(prev => ({ ...prev, quantity: projectDraft.quantity || 100 }));
                }
            });

            // Transition to studio after a brief moment
            const studioTimer = setTimeout(() => setMode('studio'), 1500);
            return () => {
                cancelAnimationFrame(timer);
                clearTimeout(studioTimer);
            };
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
            } else if (lowerInput.includes('another-roll-on')) {
                // User wants to configure another roll-on after adding to cart
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "Great! Let's configure another roll-on bottle for you."
                }]);
                setTimeout(() => setMode('studio'), 800);
            } else if (lowerInput.includes('browse-categories')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "Here are our product categories. For this demo, Roll-On Bottles are fully available. Other categories are coming soon!",
                    options: [
                        { label: 'Roll-On Bottles', value: 'roll-on', icon: 'ph-thin ph-drop' },
                        { label: 'Oil Vials (Coming Soon)', value: 'coming-soon', icon: 'ph-thin ph-flask' },
                        { label: 'Vintage Bottles (Coming Soon)', value: 'coming-soon', icon: 'ph-thin ph-sparkle' },
                        { label: 'Accessories (Coming Soon)', value: 'coming-soon', icon: 'ph-thin ph-wrench' }
                    ]
                }]);
            } else if (lowerInput.includes('done') || lowerInput.includes('all set') || lowerInput.includes('finished')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "Wonderful! Your items are in the cart. You can access your cart anytime from the cart icon in the header.\n\nThank you for using Bottle Specialist. Have a great day!",
                    options: [
                        { label: 'Back to Home', value: 'go-home', icon: 'ph-thin ph-house' }
                    ]
                }]);
            } else if (lowerInput.includes('go-home')) {
                onBack?.();
            } else if (lowerInput.includes('coming-soon')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: "This category is coming soon! For now, would you like to explore our Roll-On Bottles?",
                    options: [
                        { label: 'Show Roll-On Bottles', value: 'roll-on', icon: 'ph-thin ph-drop' }
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

    // --- Cart State (modal removed - cart drawer handles confirmation) ---

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

        // Return to briefing mode (cart drawer opens automatically)
        // Add a follow-up message to the chat with cart summary and categories
        setMessages(prev => [...prev, {
            role: 'assistant',
            showCartSummary: {
                quantity: selections.quantity,
                name: `${selections.vessel?.name} Roll-On with ${selections.closure?.name} cap`,
                price: `$${(calculateUnitPrice() * selections.quantity).toFixed(2)}`
            },
            text: "What else would you like to add to your order?",
            showCategories: true
        }]);

        // Reset selections for next time
        setSelections({
            vessel: productData.baseBottles[0],
            fitment: productData.rollerOptions[0],
            closure: productData.capOptions[0],
            quantity: 100
        });
        setActiveStep(0);

        // Switch back to briefing mode
        setMode('brief');
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
                    <div className="flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-16 py-4 max-w-5xl mx-auto w-full min-h-0">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`${msg.showCategories ? 'w-full' : 'max-w-[85%]'} ${msg.role === 'user' ? 'order-1' : ''}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-[#1D1D1F] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xs">science</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bottle Specialist</span>
                                            </div>
                                        )}
                                        {/* Cart Summary (shown after adding to cart) */}
                                        {msg.showCartSummary && (
                                            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                    <i className="ph-thin ph-check-circle text-green-600 text-xl" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Added to Cart</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        {msg.showCartSummary.quantity}x {msg.showCartSummary.name} - {msg.showCartSummary.price}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Message */}
                                        {(msg.text || msg.content) && (
                                            <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-[#1D1D1F] text-white rounded-br-sm'
                                                : 'bg-gray-100 dark:bg-white/10 text-[#1D1D1F] dark:text-white rounded-bl-sm'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text || msg.content}</p>
                                            </div>
                                        )}

                                        {/* Category Banner (Visual Selection) - Full Width */}
                                        {msg.showCategories && msg.role === 'assistant' && (
                                            <div className="mt-6 w-full">
                                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => cat.available && handleOptionClick(cat.id)}
                                                            disabled={!cat.available}
                                                            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${cat.available
                                                                ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                                                : 'cursor-not-allowed'
                                                                }`}
                                                        >
                                                            <div className="aspect-square bg-[#E8E8E8] relative">
                                                                <img
                                                                    src={cat.image}
                                                                    alt={cat.label}
                                                                    className={`w-full h-full object-cover transition-all duration-300 ${cat.available
                                                                        ? 'grayscale-0 group-hover:scale-105'
                                                                        : 'grayscale opacity-70'
                                                                        }`}
                                                                />
                                                                {cat.available && (
                                                                    <div className="absolute inset-0 ring-2 ring-inset ring-gold rounded-2xl" />
                                                                )}
                                                            </div>
                                                            <div className="mt-2 text-center">
                                                                <span className={`block text-[9px] md:text-[11px] font-medium tracking-wider ${cat.available
                                                                    ? 'text-[#1D1D1F] dark:text-white'
                                                                    : 'text-gray-400'
                                                                    }`}>
                                                                    {cat.label}
                                                                </span>
                                                            </div>
                                                            {cat.available && (
                                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-gold rounded text-[8px] text-white font-bold">
                                                                    NEW
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                    <div className="max-w-5xl mx-auto px-0 md:px-4 lg:px-8">

                        {/* Voice Interface - When Listening */}
                        {isListening && (
                            <div className="mb-4 bg-[#1D1D1F] rounded-2xl p-4 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${voiceStatus === 'speaking' ? 'bg-gold' : 'bg-white/20'
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
                                        <p className="text-white/70 text-sm italic">&ldquo;{voiceTranscript}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main Input Area */}
                        <div className="flex items-center gap-3">
                            {/* Voice Button */}
                            <button
                                onClick={startVoice}
                                className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening
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
        <div className="h-screen bg-[#F5F5F7] dark:bg-background-dark flex flex-col overflow-hidden relative">
            <TopBar
                assistantInput=""
                setAssistantInput={() => { }}
                onSubmit={() => { }}
                showInput={false}
                onBack={onBack}
            />

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left: Preview Canvas */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-white dark:bg-[#151515] relative flex flex-col justify-center items-center p-6 md:p-12 shadow-xl z-20 border-r border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setMode('brief')}
                        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <i className="ph-thin ph-arrow-left text-sm" />
                        <span className="hidden sm:inline">Back to Chat</span>
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
                        <span className="text-gray-600 dark:text-gray-400">1. Bottle: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.vessel?.name}</span></span>
                        <span className="text-gray-600 dark:text-gray-400">2. Fitment: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.fitment?.name}</span></span>
                        <span className="text-gray-600 dark:text-gray-400">3. Cap: <span className="text-[#1D1D1F] dark:text-white font-medium">{selections.closure?.name}</span></span>
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
                            {['1. Bottle', '2. Fitment', '3. Cap'].map((stepLabel, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveStep(idx as 0 | 1 | 2)}
                                    className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-1 transition-all relative whitespace-nowrap ${activeStep === idx
                                        ? 'text-[#1D1D1F] dark:text-white border-b-2 border-gold'
                                        : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
                                        }`}
                                >
                                    {stepLabel}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowVisualizeModal(true)}
                                className="border border-gold text-gold px-3 md:px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold/10 transition-all flex items-center gap-1.5"
                            >
                                <i className="ph-thin ph-eye text-sm" />
                                <span className="hidden md:inline">Visualize</span>
                            </button>
                            <button
                                onClick={handleFinishKit}
                                className="bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-4 md:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                            >
                                Add to Cart
                            </button>
                        </div>
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
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${selections.quantity === qty
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

                        {/* Step 1: Bottle (Glass Colors) */}
                        {activeStep === 0 && (
                            <div className="animate-fade-in">
                                <h2 className="text-lg md:text-xl font-serif text-[#1D1D1F] dark:text-white mb-4">Select Glass Color</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {productData.baseBottles.map((bottle) => (
                                        <button
                                            key={bottle.id}
                                            onClick={() => setSelections(prev => ({ ...prev, vessel: bottle }))}
                                            className={`group relative aspect-square bg-white dark:bg-white/5 rounded-xl border transition-all duration-300 p-3 flex flex-col items-center justify-center gap-2 hover:shadow-lg ${selections.vessel?.id === bottle.id
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

                                {/* Next Button */}
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setActiveStep(1)}
                                        disabled={!selections.vessel}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${selections.vessel
                                            ? 'bg-[#1D1D1F] text-white hover:bg-[#2D2D2F]'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Next: Fitment
                                        <i className="ph-thin ph-arrow-right text-lg" />
                                    </button>
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
                                            onClick={() => setSelections(prev => ({ ...prev, fitment: roller }))}
                                            className={`w-full p-4 md:p-5 rounded-xl border flex items-center justify-between transition-all group hover:shadow-md ${selections.fitment?.id === roller.id
                                                ? 'bg-white dark:bg-white/10 border-gold shadow-sm ring-2 ring-gold'
                                                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${selections.fitment?.id === roller.id ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
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

                                {/* Navigation Buttons */}
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setActiveStep(0)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#1D1D1F] transition-colors"
                                    >
                                        <i className="ph-thin ph-arrow-left text-lg" />
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setActiveStep(2)}
                                        disabled={!selections.fitment}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${selections.fitment
                                            ? 'bg-[#1D1D1F] text-white hover:bg-[#2D2D2F]'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Next: Cap
                                        <i className="ph-thin ph-arrow-right text-lg" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Cap */}
                        {activeStep === 2 && (
                            <div className="animate-fade-in">
                                <h2 className="text-lg md:text-xl font-serif text-[#1D1D1F] dark:text-white mb-2">Select Cap Style</h2>
                                <p className="text-[10px] text-gray-400 mb-4 flex items-center gap-1">
                                    <i className="ph-thin ph-circle-fill text-green-500" /> All caps update the live preview
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                                    {productData.capOptions.map((cap) => (
                                        <button
                                            key={cap.id}
                                            onClick={() => setSelections(prev => ({ ...prev, closure: cap }))}
                                            className={`group relative aspect-square bg-white dark:bg-white/5 rounded-xl border transition-all p-2 flex flex-col items-center justify-center gap-1 hover:shadow-md ${selections.closure?.id === cap.id
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

                                {/* Back Button */}
                                <div className="mt-6 flex justify-start">
                                    <button
                                        onClick={() => setActiveStep(1)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#1D1D1F] transition-colors"
                                    >
                                        <i className="ph-thin ph-arrow-left text-lg" />
                                        Back
                                    </button>
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowVisualizeModal(true)}
                                className="border border-gold text-gold p-3 rounded-full hover:bg-gold/10 transition-all"
                            >
                                <i className="ph-thin ph-eye text-lg" />
                            </button>
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

            {/* Visualize Modal */}
            <VisualizeModal
                isOpen={showVisualizeModal}
                onClose={() => setShowVisualizeModal(false)}
                productImage={getCompositeImageUrl()}
                productName={`9ml ${selections.vessel?.name} Roll-On Bottle`}
                labelSpecs={productData.labelSpecs}
                labelPartners={productData.labelPartners}
                onContinueToCart={() => {
                    setShowVisualizeModal(false);
                    handleFinishKit();
                }}
            />
        </div>
    );
};

export default ConsultationPage;
