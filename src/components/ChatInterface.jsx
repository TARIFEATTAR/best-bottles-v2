import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import './ChatInterface.css';

const ChatInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hello! I\'m your Best Bottles AI assistant. I can help you find the perfect bottle for your needs, answer questions about our products, or assist with bulk orders. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // ElevenLabs Conversation Hook
    const conversation = useConversation({
        onConnect: () => console.log('Connected to ElevenLabs'),
        onDisconnect: () => console.log('Disconnected from ElevenLabs'),
        onMessage: (message) => {
            console.log('Received message:', message);
            handleBotResponse(message.text);
        },
        onError: (error) => console.error('ElevenLabs error:', error),
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleBotResponse = (text) => {
        setIsTyping(false);
        const botMessage = {
            id: messages.length + 1,
            type: 'bot',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: inputText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Send to ElevenLabs if connected
        if (conversation.status === 'connected') {
            await conversation.sendMessage(inputText);
        } else {
            // Fallback demo responses
            setTimeout(() => {
                handleDemoResponse(inputText);
            }, 1500);
        }
    };

    const handleDemoResponse = (userInput) => {
        const input = userInput.toLowerCase();
        let response = '';

        if (input.includes('price') || input.includes('cost') || input.includes('how much')) {
            response = 'Our bottles range from $129.99 to $169.99. Amber Essence is $129.99, Midnight Noir is $149.99, Crystal Clarity is $159.99, and our premium Emerald Luxe is $169.99. We also offer bulk discounts starting at 10% off for orders of 10 or more bottles.';
        } else if (input.includes('bulk') || input.includes('wholesale') || input.includes('quantity')) {
            response = 'We offer excellent bulk pricing! 10-49 bottles get 10% off, 50-99 get 15% off, 100-499 receive 20% off, and orders of 500+ receive 25% off plus custom options. How many bottles are you considering?';
        } else if (input.includes('vodka')) {
            response = 'For premium vodka, I recommend our Crystal Clarity or Midnight Noir. Crystal Clarity features ultra-clear glass with diamond-cut facets that beautifully showcase the purity of vodka. Midnight Noir offers a sophisticated matte black finish perfect for modern vodka brands. Which aesthetic appeals to you more?';
        } else if (input.includes('whiskey') || input.includes('bourbon')) {
            response = 'For whiskey or bourbon, our Amber Essence and Emerald Luxe are excellent choices. Amber Essence has that classic warmth whiskey lovers appreciate at $129.99, while Emerald Luxe is our ultra-premium option with 24K gold accents at $169.99. Both provide excellent UV protection for aged spirits.';
        } else if (input.includes('custom') || input.includes('logo') || input.includes('personalize')) {
            response = 'We offer comprehensive customization including embossing, etching, engraving, custom colors, and bespoke designs. Standard customization takes 4-6 weeks. Minimum quantities vary by service - etching and engraving can start at lower quantities, while custom colors require a minimum of 100 units. What type of customization interests you?';
        } else if (input.includes('shipping') || input.includes('delivery')) {
            response = 'We offer free shipping on orders over $200! Standard shipping is $15 (3-5 business days) and express shipping is $35 (1-2 business days). All shipments include insurance and tracking. We ship domestically and to 50+ countries internationally.';
        } else if (input.includes('gift')) {
            response = 'For gifts, I highly recommend our Emerald Luxe or Crystal Clarity. Emerald Luxe comes with a premium velvet case and certificate of authenticity - perfect for special occasions. Crystal Clarity\'s diamond-inspired design is stunning and comes in a luxury presentation box. What\'s the occasion and your budget?';
        } else if (input.includes('recommend') || input.includes('suggest') || input.includes('which')) {
            response = 'I\'d be happy to recommend the perfect bottle! To help you choose, could you tell me: What type of spirit will it hold? What\'s your budget? Are you looking for traditional or modern aesthetics? Will this be for retail, gifts, or personal use?';
        } else {
            response = 'That\'s a great question! I can help you with product recommendations, pricing, bulk orders, customization options, shipping information, and more. What specific aspect of our bottles would you like to know about?';
        }

        handleBotResponse(response);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const startVoiceConversation = async () => {
        try {
            // Note: This requires ElevenLabs agent ID from environment variables
            const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
            if (agentId) {
                await conversation.startSession({ agentId });
            } else {
                console.warn('ElevenLabs Agent ID not configured');
                alert('Voice chat requires ElevenLabs configuration. Using text chat for demo.');
            }
        } catch (error) {
            console.error('Failed to start voice conversation:', error);
        }
    };

    const stopVoiceConversation = async () => {
        await conversation.endSession();
    };

    const quickActions = [
        { text: 'Show me your bottles', icon: '🍾' },
        { text: 'Bulk pricing options', icon: '📦' },
        { text: 'Customization services', icon: '✨' },
        { text: 'Shipping information', icon: '🚚' }
    ];

    const handleQuickAction = (text) => {
        setInputText(text);
        handleSendMessage();
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button className="chat-toggle-button" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                    <span className="chat-badge">AI</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3>Best Bottles AI Assistant</h3>
                                <p className="chat-status">
                                    {conversation.status === 'connected' ? (
                                        <>
                                            <span className="status-dot connected"></span>
                                            Voice enabled
                                        </>
                                    ) : (
                                        <>
                                            <span className="status-dot"></span>
                                            Online
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            {conversation.status === 'connected' ? (
                                <button
                                    className="voice-button active"
                                    onClick={stopVoiceConversation}
                                    title="Stop voice chat"
                                >
                                    <Volume2 size={20} />
                                </button>
                            ) : (
                                <button
                                    className="voice-button"
                                    onClick={startVoiceConversation}
                                    title="Start voice chat"
                                >
                                    <VolumeX size={20} />
                                </button>
                            )}
                            <button className="close-button" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type}`}>
                                {message.type === 'bot' && (
                                    <div className="message-avatar">
                                        <MessageCircle size={16} />
                                    </div>
                                )}
                                <div className="message-content">
                                    <p>{message.text}</p>
                                    <span className="message-time">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message bot">
                                <div className="message-avatar">
                                    <MessageCircle size={16} />
                                </div>
                                <div className="message-content typing">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.length === 1 && (
                            <div className="quick-actions">
                                <p className="quick-actions-label">Quick actions:</p>
                                <div className="quick-actions-grid">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            className="quick-action-button"
                                            onClick={() => handleQuickAction(action.text)}
                                        >
                                            <span className="quick-action-icon">{action.icon}</span>
                                            <span>{action.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-container">
                        <div className="chat-input-wrapper">
                            <textarea
                                className="chat-input"
                                placeholder="Ask me anything about our bottles..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                rows="1"
                            />
                            <button
                                className="send-button"
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="chat-footer-text">
                            Powered by ElevenLabs AI • Voice-enabled assistant
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatInterface;
