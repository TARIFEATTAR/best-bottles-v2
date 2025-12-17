import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Loader } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';

interface Message {
    id: number;
    type: 'bot' | 'user';
    text: string;
    timestamp: Date;
}

interface QuickAction {
    text: string;
    icon: string;
}

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: 'bot',
            text: 'Hello! I\'m your Best Bottles AI assistant with knowledge of over 2,000 products. I can help you find the perfect bottle for your needs. What are you looking for today?',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ElevenLabs Configuration
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    // ElevenLabs Conversation Hook
    const conversation = useConversation({
        onConnect: () => {
            console.log('✅ Connected to ElevenLabs');
            addSystemMessage('Voice chat enabled! You can now speak or type your questions.');
        },
        onDisconnect: () => {
            console.log('❌ Disconnected from ElevenLabs');
        },
        onMessage: (message) => {
            console.log('📨 Received message:', message);
            if (message.message) {
                handleBotResponse(message.message);
            }
        },
        onError: (error) => {
            console.error('❌ ElevenLabs error:', error);
            addSystemMessage('Voice chat encountered an error. Falling back to text mode.');
        },
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addSystemMessage = (text: string) => {
        const systemMessage: Message = {
            id: messages.length + 1,
            type: 'bot',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
    };

    const handleBotResponse = (text: string) => {
        setIsTyping(false);
        const botMessage: Message = {
            id: messages.length + 1,
            type: 'bot',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
    };

    const handleDemoResponse = (userInput: string) => {
        const input = userInput.toLowerCase();
        let response = '';

        // Enhanced demo responses with product knowledge
        if (input.includes('perfume') || input.includes('fragrance')) {
            response = 'We have over 500 perfume bottles and vials! Popular options include our 10ml roll-on bottles (SKU: GB10mlRollOn) at $1.20 each, and decorative 4ml heart bottles (SKU: GBHeartFrst4) at $2.80. What capacity are you looking for?';
        } else if (input.includes('essential oil') || input.includes('oil')) {
            response = 'For essential oils, I recommend our amber glass bottles with dropper caps. We have 5ml, 10ml, 15ml, and 30ml sizes. The 10ml amber dropper bottle (SKU: GB10mlAmberDrop) is $1.50 each, or $1.35 each for 144+. What quantity do you need?';
        } else if (input.includes('roll') || input.includes('roller')) {
            response = 'Our roll-on bottles are very popular! We offer 5ml, 10ml, and 15ml sizes in clear, amber, blue, and green glass. The 10ml clear roll-on (SKU: GB10mlRollClear) is $1.20 each. Bulk pricing: 144+ at $1.08 each. Would you like to see specific colors?';
        } else if (input.includes('price') || input.includes('cost') || input.includes('how much')) {
            response = 'Our bottles range from $0.50 to $5.00 depending on size and style. We offer excellent bulk discounts: 5-10% off for 12+, 15-20% off for 144+, and custom pricing for 1000+. What type of bottle interests you?';
        } else if (input.includes('bulk') || input.includes('wholesale') || input.includes('quantity')) {
            response = 'We specialize in bulk orders! Discounts: 12-143 units get 5-10% off, 144-999 units get 15-20% off, and 1000+ units receive custom pricing. Most popular bulk items are our 10ml roll-on bottles and 30ml dropper bottles. How many units are you considering?';
        } else if (input.includes('amber') || input.includes('brown')) {
            response = 'Amber glass is excellent for UV protection! We have amber bottles in sizes from 5ml to 100ml. Popular choices: 10ml amber dropper ($1.50), 30ml amber dropper ($2.20), 50ml amber spray ($2.80). All offer bulk discounts. What size do you need?';
        } else if (input.includes('dropper') || input.includes('drop')) {
            response = 'Our dropper bottles come in clear, amber, blue, and green glass. Sizes: 5ml, 10ml, 15ml, 30ml, 50ml, and 100ml. The 30ml amber dropper (SKU: GB30mlAmberDrop) is our bestseller at $2.20 each. Need a specific size?';
        } else if (input.includes('spray') || input.includes('mist')) {
            response = 'We offer spray bottles from 10ml to 100ml in various styles. Popular options: 30ml fine mist sprayer ($2.50), 50ml spray bottle ($2.80), 100ml spray bottle ($3.50). All include spray pumps. What capacity works for you?';
        } else if (input.includes('custom') || input.includes('logo') || input.includes('personalize')) {
            response = 'We offer customization including silk screening, hot stamping, frosting, and color coating. Minimum orders vary: silk screening starts at 1000 units, hot stamping at 500 units. Lead time is 4-6 weeks. What type of customization interests you?';
        } else if (input.includes('shipping') || input.includes('delivery')) {
            response = 'We ship worldwide! Domestic shipping: $15 flat rate for orders under $200, FREE for $200+. International rates vary by destination. Most orders ship within 1-2 business days. Need rush shipping?';
        } else if (input.includes('sample') || input.includes('test')) {
            response = 'Yes, we offer samples! You can order 1-5 units of any product to test quality. Sample orders ship within 24 hours. Many customers order samples before placing bulk orders. Which products would you like to sample?';
        } else if (input.includes('clear') || input.includes('transparent')) {
            response = 'Our clear glass bottles showcase your product beautifully! Available in all sizes from 5ml to 100ml. Popular: 10ml clear roll-on ($1.20), 30ml clear dropper ($2.00), 50ml clear spray ($2.60). What style are you looking for?';
        } else if (input.includes('help') || input.includes('assist')) {
            response = 'I can help you find the perfect bottle from our 2,000+ product inventory! I can assist with product recommendations, pricing, bulk orders, customization, shipping, and more. What specific information do you need?';
        } else {
            response = 'I have knowledge of over 2,000 bottle products including perfume bottles, essential oil containers, roll-on bottles, dropper bottles, and spray bottles. What type of bottle are you looking for, and what will you be using it for?';
        }

        handleBotResponse(response);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: messages.length + 1,
            type: 'user',
            text: inputText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        const messageText = inputText;
        setInputText('');
        setIsTyping(true);

        // Note: ElevenLabs is voice-only, use demo responses for text input
        // Voice chat works through the microphone when connected
        setTimeout(() => handleDemoResponse(messageText), 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleVoiceChat = async () => {
        if (conversation.status === 'connected') {
            await conversation.endSession();
        } else {
            if (!agentId) {
                alert('ElevenLabs Agent ID not configured. Please add VITE_ELEVENLABS_AGENT_ID to your .env file. Using text chat for now.');
                return;
            }
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await conversation.startSession({
                    agentId: agentId,
                } as any);
            } catch (error) {
                console.error('Failed to start voice chat:', error);
                alert('Could not connect to voice chat. Please check your API key and try again.');
            }
        }
    };

    const quickActions: QuickAction[] = [
        { text: 'Show me perfume bottles', icon: '💐' },
        { text: 'Essential oil containers', icon: '🌿' },
        { text: 'Bulk pricing options', icon: '📦' },
        { text: 'Roll-on bottles', icon: '💧' }
    ];

    const handleQuickAction = (text: string) => {
        setInputText(text);
        setTimeout(() => handleSendMessage(), 100);
    };

    const isVoiceConnected = conversation.status === 'connected';
    const isVoiceConnecting = conversation.status === 'connecting';

    if (!isOpen) {
        return (
            <button
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
                onClick={() => setIsOpen(true)}
                style={{
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                }}
            >
                <MessageCircle size={24} />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                    AI
                </span>
            </button>
        );
    }

    return (
        <div
            className="fixed bottom-8 right-8 w-[420px] h-[650px] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
                background: 'rgba(17, 24, 39, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Header */}
            <div
                className="p-6 flex items-center justify-between"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Best Bottles AI</h3>
                        <p className="text-white/80 text-xs flex items-center gap-2">
                            {isVoiceConnected ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    Voice enabled
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                    {agentId ? 'Ready for voice' : 'Text mode'}
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`w-9 h-9 rounded-full border text-white hover:bg-white/20 transition-all flex items-center justify-center ${isVoiceConnected ? 'bg-green-500 border-green-400' : 'bg-white/10 border-white/20'
                            }`}
                        onClick={toggleVoiceChat}
                        disabled={isVoiceConnecting}
                        title={isVoiceConnected ? "Disable voice chat" : "Enable voice chat"}
                    >
                        {isVoiceConnecting ? (
                            <Loader size={18} className="animate-spin" />
                        ) : isVoiceConnected ? (
                            <Mic size={18} />
                        ) : (
                            <MicOff size={18} />
                        )}
                    </button>
                    <button
                        className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        {message.type === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                                <MessageCircle size={16} />
                            </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl p-3.5 ${message.type === 'bot'
                            ? 'bg-white/10 border border-white/10 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white ml-auto'
                            }`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <span className="text-xs opacity-70 mt-1.5 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center text-white">
                            <MessageCircle size={16} />
                        </div>
                        <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                {messages.length === 1 && (
                    <div className="mt-4 space-y-3">
                        <p className="text-white/60 text-xs">Quick actions:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs hover:bg-white/10 transition-all text-left flex items-center gap-2"
                                    onClick={() => handleQuickAction(action.text)}
                                >
                                    <span className="text-lg">{action.icon}</span>
                                    <span>{action.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-black/30 border-t border-white/10">
                <div className="flex gap-3 items-end bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:bg-white/8 focus-within:border-purple-500/50 transition-all">
                    <textarea
                        className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-white/40 max-h-24"
                        placeholder="Ask about our 2,000+ products..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button
                        className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-white/40 text-xs text-center mt-2">
                    {isVoiceConnected ? '🎤 Voice chat active' : agentId ? 'Powered by ElevenLabs AI' : 'Demo mode - Configure ElevenLabs for voice'}
                </p>
            </div>

            <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};
