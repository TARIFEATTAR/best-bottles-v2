import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PRODUCTS, FAQ_DATA } from "../constants";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Bottle Specialist. I can help you find the perfect vessel for your fragrance or skincare line. What are you looking for today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText;
    setInputText("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare Product Context
      const productContext = PRODUCTS.map(p => 
        `- ${p.name} (SKU: ${p.sku}): ${p.description}. Price: ${p.price}. Capacity: ${p.capacity}. Color: ${p.color}. Category: ${p.category}.`
      ).join('\n');

      // Prepare FAQ Context
      const faqContext = FAQ_DATA.map(cat => 
        `CATEGORY: ${cat.category}\n` + 
        cat.items.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')
      ).join('\n\n');

      const systemInstruction = `You are the "Bottle Specialist" AI for Best Bottles, a premium packaging supplier. 
      Your goal is to help customers find the right glass bottles, vials, and closures for their brand, AND answer customer service questions.
      
      Here is our current product catalog:
      ${productContext}

      Here is our FAQ / Policy Information:
      ${faqContext}
      
      Guidelines:
      1. Be helpful, professional, and concise. Tone: "Luxury Service".
      2. If a user asks for a specific type of bottle (e.g., "blue glass" or "10ml"), recommend products from the catalog above.
      3. Explain technical terms if needed (e.g., "neck finish", "borosilicate").
      4. If you don't find a direct match, suggest the closest alternative or offer "Custom Molding" services.
      5. For shipping, returns, or minimum order questions, refer strictly to the FAQ information provided.
      6. Do not invent products or policies that are not in the list.
      7. Always format prices clearly.
      `;

      // Create Chat Session
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      
      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm having trouble finding that. Could you try asking differently?" }]);
      }
      
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to our inventory system right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto bg-white dark:bg-[#1A1D21] w-[350px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right mb-4 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none hidden'
        }`}
      >
        {/* Header */}
        <div className="bg-[#405D68] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <div>
                    <h3 className="text-white font-serif font-bold text-sm">Bottle Specialist</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-white/70 text-[10px] uppercase tracking-wider">Online</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F9F8F6] dark:bg-[#111418] space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-[#405D68] text-white rounded-tr-sm' 
                            : 'bg-white dark:bg-[#2A2E35] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#2A2E35] p-4 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 shadow-sm flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-[#1A1D21] border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/20 rounded-full px-4 py-2 border border-transparent focus-within:border-[#405D68] focus-within:ring-1 focus-within:ring-[#405D68] transition-all">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about bottles..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'text-[#405D68] dark:text-[#C5A065] hover:bg-gray-200 dark:hover:bg-white/10' : 'text-gray-400'}`}
                >
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </div>
            <div className="text-center mt-2">
                 <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    Powered by Gemini 
                    <span className="material-symbols-outlined text-[10px]">bolt</span>
                 </span>
            </div>
        </div>
      </div>

      {/* Floating Action Button (Launcher) */}
      <div className="pointer-events-auto relative group">
         {/* Teaser Card */}
         <div 
            className={`absolute bottom-full right-0 mb-4 bg-white dark:bg-[#1A1D21] border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-xl w-64 transition-all duration-300 transform origin-bottom-right ${
                !isOpen && isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
            }`}
         >
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
               Looking for a specific bottle? I can check our inventory for you.
            </p>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-[#1A1D21] absolute -bottom-2 right-6"></div>
         </div>

         <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
                isOpen 
                ? 'bg-[#1D1D1F] text-white rotate-90' 
                : 'bg-[#405D68] text-white hover:bg-[#344854]'
            }`}
         >
            <span className="material-symbols-outlined text-2xl">
                {isOpen ? 'close' : 'smart_toy'}
            </span>
         </button>
      </div>
    </div>
  );
};