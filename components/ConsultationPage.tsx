
import React, { useState, useEffect, useRef } from "react";
import { ProjectDraft } from "../App";
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";

interface ConsultationPageProps {
  onBack?: () => void;
  projectDraft?: ProjectDraft | null;
  onAddToCart?: (product: any, quantity: number) => void;
}

// --- Audio Utils (Duplicated for component isolation) ---
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

// --- Catalog Data ---
const CATEGORIES = [
    { id: 'perfume', label: 'Perfume / Fragrance', icon: 'scent' },
    { id: 'oil', label: 'Essential Oils', icon: 'spa' },
    { id: 'serum', label: 'Serum / Skincare', icon: 'water_drop' }
];

const VESSELS = [
    { id: 'amber-10', name: 'Amber Roller Bottle', capacity: '10ml', price: 0.45, color: 'Amber', img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVAmb1DrmBlkDropper.gif' },
    { id: 'blue-10', name: 'Cobalt Blue Roller', capacity: '10ml', price: 0.55, color: 'Blue', img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVBlu1DrmBlkDropper.gif' },
    { id: 'clear-30', name: 'Flint Boston Round', capacity: '30ml', price: 0.85, color: 'Clear', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZPzMv3XTOBIdXfskvddDgLAgMI37FcCizAhrZFWxjcDp_DpT11oLd_0ZtGkbnW0W31X4dNXnJdc895221lxCbGSNyxE8v4SsVXtr5q49XQkVAfqJO6Qrm9L9pZ06HYgr6COgWul1P0_QOXZTzFpaEq3LB1ZDauvoiH3Sph8Do4FdA19cOdl5xL0ptuoRWtlLTNPWwvPgP4z5NOBPPmdtj0yhGgxXFhvq0yWDjqwKUqtamjwjoN5VexgKfQb_3G8li6G9QldPL56A' },
    { id: 'frosted-50', name: 'Frosted Square', capacity: '50ml', price: 1.85, color: 'Frosted', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600' },
    { id: 'black-30', name: 'Matte Black Cylinder', capacity: '30ml', price: 1.10, color: 'Black', img: 'https://images.unsplash.com/photo-1615634260167-c8c9c313880b?auto=format&fit=crop&q=80&w=400' },
    { id: 'royal-12', name: 'Royal Cylinder', capacity: '12ml', price: 6.79, color: 'Gold', img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBMtlCylGl.gif' },
    { id: 'green-15', name: 'Emerald Euro', capacity: '15ml', price: 0.65, color: 'Green', img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBVGr1DrmBlkDropper.gif' },
    { id: 'metal-5', name: 'Metal Shell Atomizer', capacity: '5ml', price: 2.25, color: 'Silver', img: 'https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-6ba7f817.jpg?v=1765508537' },
    { id: 'clear-100', name: 'Classic Rectangular', capacity: '100ml', price: 2.50, color: 'Clear', img: 'https://www.bestbottles.com/images/store/enlarged_pics/GBSQSTClear.gif' },
    { id: 'bamboo-10', name: 'Bamboo Shell', capacity: '10ml', price: 1.45, color: 'Wood', img: 'https://images.unsplash.com/photo-1595855709940-fa1d4f243029?auto=format&fit=crop&q=80&w=400' },
    { id: 'white-30', name: 'White Opal Cylinder', capacity: '30ml', price: 1.60, color: 'White', img: 'https://cdn.shopify.com/s/files/1/1989/5889/files/madison-studio-1a5ce90f_1.jpg?v=1765597664' },
    { id: 'violet-50', name: 'Violet Glass Jar', capacity: '50ml', price: 3.50, color: 'Purple', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
];

const FITMENTS = [
    { id: 'none', name: 'No Fitment', description: 'Open neck pouring', price: 0.00, icon: 'block' },
    { id: 'reducer', name: 'Orifice Reducer', description: 'Controlled drip for oils', price: 0.05, icon: 'remove_circle_outline' },
    { id: 'roller-metal', name: 'Stainless Roller', description: 'Premium cooling application', price: 0.15, icon: 'radio_button_checked' },
    { id: 'roller-plastic', name: 'Plastic Roller', description: 'Standard smooth application', price: 0.08, icon: 'circle' },
    { id: 'spray', name: 'Mist Atomizer', description: 'Fine mist for fragrance', price: 0.25, icon: 'spray' },
    { id: 'dropper', name: 'Glass Pipette', description: 'Precision dosing', price: 0.35, icon: 'water_drop' },
];

const CAPS = [
    { id: 'black-phenolic', name: 'Matte Black', material: 'Plastic', price: 0.10, color: '#222' },
    { id: 'gold-alum', name: 'Polished Gold', material: 'Aluminum', price: 0.25, color: '#D4AF37' },
    { id: 'silver-alum', name: 'Brushed Silver', material: 'Aluminum', price: 0.25, color: '#C0C0C0' },
    { id: 'white-smooth', name: 'Gloss White', material: 'Plastic', price: 0.10, color: '#F0F0F0' },
    { id: 'wood-ash', name: 'Ash Wood', material: 'Wood', price: 0.45, color: '#A08060' },
    { id: 'bamboo', name: 'Natural Bamboo', material: 'Wood', price: 0.55, color: '#E3CBA8' }
];

// --- AI Tool Definitions ---
const updateKitTool: FunctionDeclaration = {
    name: "update_kit",
    description: "Update the packaging kit configuration. Call this when the user mentions changing the bottle, cap, sprayer, or quantity. Infer the IDs from the context.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            vessel_id: { type: Type.STRING, description: "ID of the vessel (e.g. 'amber-10', 'frosted-50', 'blue-10')" },
            fitment_id: { type: Type.STRING, description: "ID of the fitment (e.g. 'spray', 'dropper', 'roller-metal')" },
            closure_id: { type: Type.STRING, description: "ID of the closure (e.g. 'gold-alum', 'bamboo', 'black-phenolic')" },
            quantity: { type: Type.NUMBER, description: "Order quantity" }
        }
    }
};

export const ConsultationPage: React.FC<ConsultationPageProps> = ({ onBack, projectDraft, onAddToCart }) => {
  // Mode: 'brief' (intake) -> 'studio' (builder) -> 'summary' (checkout)
  const [mode, setMode] = useState<'brief' | 'studio' | 'summary'>('brief');
  
  // Project State
  const [contextCategory, setContextCategory] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0); 
  const [selections, setSelections] = useState<{
      vessel: typeof VESSELS[0] | null,
      fitment: typeof FITMENTS[0] | null,
      closure: typeof CAPS[0] | null,
      quantity: number
  }>({
      vessel: null,
      fitment: null,
      closure: null,
      quantity: 100 
  });

  // Assistant State
  const [assistantInput, setAssistantInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiMessage, setAiMessage] = useState("How can I help you customize this?");

  // Refs for Voice
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize from Draft
  useEffect(() => {
      if (projectDraft) {
          setContextCategory(projectDraft.category || null);
          setSelections(prev => ({ ...prev, quantity: projectDraft.quantity || 100 }));

          if (projectDraft.capacity) {
              const capClean = projectDraft.capacity.toLowerCase().replace(" ", "");
              const matchedVessel = VESSELS.find(v => {
                  const vCap = v.capacity.toLowerCase();
                  const capMatch = vCap.includes(capClean) || capClean.includes(vCap);
                  let colorMatch = true;
                  if (projectDraft.color) {
                      const reqColor = projectDraft.color.toLowerCase();
                      colorMatch = v.color.toLowerCase().includes(reqColor) || v.name.toLowerCase().includes(reqColor);
                  }
                  return capMatch && colorMatch;
              });
              if (matchedVessel) {
                  setSelections(prev => ({ ...prev, vessel: matchedVessel }));
              }
          }
          setMode('studio');
      }
  }, [projectDraft]);

  // --- Core State Updates ---
  const updateSelections = (updates: any) => {
      setSelections(prev => {
          const newState = { ...prev };
          if (updates.vessel_id) newState.vessel = VESSELS.find(v => v.id === updates.vessel_id) || prev.vessel;
          if (updates.fitment_id) newState.fitment = FITMENTS.find(f => f.id === updates.fitment_id) || prev.fitment;
          if (updates.closure_id) newState.closure = CAPS.find(c => c.id === updates.closure_id) || prev.closure;
          if (updates.quantity) newState.quantity = updates.quantity;
          return newState;
      });
      // Ensure we are in studio mode if updates happen
      if (mode === 'brief') setMode('studio');
  };

  const handleSelect = (type: 'vessel' | 'fitment' | 'closure', item: any) => {
      setSelections(prev => ({ ...prev, [type]: item }));
      if (type === 'vessel') setTimeout(() => setActiveStep(1), 400);
      if (type === 'fitment') setTimeout(() => setActiveStep(2), 400);
  };

  // --- Voice Logic (Gemini Live) ---
  const stopAudio = () => {
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    activeSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setIsListening(false);
    setAiMessage("Voice session ended.");
  };

  const toggleVoice = async () => {
    if (isListening) {
        stopAudio();
        return;
    }

    try {
        setIsListening(true);
        setAiMessage("Connecting to specialist...");

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        nextStartTimeRef.current = audioContextRef.current.currentTime;
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                systemInstruction: { parts: [{ text: "You are a helpful packaging specialist. Use the `update_kit` tool to change the vessel, cap, or quantity based on the user's voice commands. Be concise and friendly." }] },
                tools: [{ functionDeclarations: [updateKitTool] }]
            },
            callbacks: {
                onopen: () => {
                    setAiMessage("Listening... Speak naturally.");
                    if (!inputAudioContextRef.current || !streamRef.current) return;
                    const inputSource = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                    const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const base64Data = float32ToB64(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: "audio/pcm;rate=16000", data: base64Data } }));
                    };
                    inputSource.connect(processor);
                    processor.connect(inputAudioContextRef.current.destination);
                    sourceRef.current = inputSource;
                    processorRef.current = processor;
                },
                onmessage: async (msg: LiveServerMessage) => {
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            if (fc.name === 'update_kit') {
                                updateSelections(fc.args);
                                sessionPromise.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } }));
                            }
                        }
                    }
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        const float32Data = base64ToFloat32Array(audioData);
                        const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
                        buffer.getChannelData(0).set(float32Data);
                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContextRef.current.destination);
                        const currentTime = audioContextRef.current.currentTime;
                        if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        activeSourcesRef.current.add(source);
                        source.onended = () => activeSourcesRef.current.delete(source);
                    }
                },
                onclose: () => { setIsListening(false); stopAudio(); },
                onerror: (err) => { console.error(err); setIsListening(false); stopAudio(); }
            }
        });
    } catch (e) {
        console.error(e);
        setIsListening(false);
        stopAudio();
    }
  };

  // --- Text Logic (Generative AI) ---
  const handleTextSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!assistantInput.trim()) return;
      
      const query = assistantInput;
      setAssistantInput("");
      setIsProcessingText(true);
      setAiMessage("Thinking...");

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Current Context: Mode=${mode}, Selection=${JSON.stringify(selections)}. User Query: "${query}". 
                         Available IDs: 
                         Vessels: ${VESSELS.map(v => v.id).join(', ')}. 
                         Caps: ${CAPS.map(c => c.id).join(', ')}.
                         Fitments: ${FITMENTS.map(f => f.id).join(', ')}.
                         Respond naturally and if a change is needed, call the update_kit tool.`,
              config: {
                  tools: [{ functionDeclarations: [updateKitTool] }]
              }
          });

          // Check for tool calls
          const toolCalls = response.functionCalls();
          if (toolCalls && toolCalls.length > 0) {
              const call = toolCalls[0];
              if (call.name === 'update_kit') {
                  updateSelections(call.args);
                  setAiMessage("Updated your kit configuration.");
              }
          } else {
              // Just a text response
              setAiMessage(response.text || "I'm not sure how to update that setting. Try asking for a specific color or size.");
          }
      } catch (err) {
          console.error(err);
          setAiMessage("Sorry, I encountered an error processing your request.");
      } finally {
          setIsProcessingText(false);
      }
  };

  const calculateTotal = () => (( (selections.vessel?.price || 0) + (selections.fitment?.price || 0) + (selections.closure?.price || 0) ) * selections.quantity).toFixed(2);
  const calculateUnitPrice = () => ((selections.vessel?.price || 0) + (selections.fitment?.price || 0) + (selections.closure?.price || 0)).toFixed(2);

  const handleFinishKit = () => {
      if (!selections.vessel || !selections.fitment || !selections.closure) return;
      const customProduct = {
          name: `Custom Kit: ${selections.vessel.name}`,
          variant: `${selections.closure.name} + ${selections.fitment.name}`,
          price: parseFloat(calculateUnitPrice()),
          imageUrl: selections.vessel.img,
          category: 'Custom Project',
          sku: `CUST-${Date.now().toString().slice(-4)}`
      };
      onAddToCart?.(customProduct, selections.quantity);
  };

  // --- Sub-Component: The Persistent AI Header ---
  const AIHeader = () => (
      <div className="w-full bg-[#1D1D1F]/95 backdrop-blur-md text-white p-4 md:px-8 md:py-5 shadow-2xl z-50 sticky top-0 flex flex-col md:flex-row items-center gap-6 border-b border-white/5 transition-all duration-500">
          <div className="flex items-center gap-4 shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  isListening 
                  ? 'bg-[#C5A065]/20 border-[#C5A065] shadow-[0_0_15px_rgba(197,160,101,0.3)]' 
                  : 'bg-white/5 border-white/10'
              }`}>
                  {/* Pulse Ring */}
                  {isListening && <div className="absolute inset-0 rounded-full border border-[#C5A065] animate-ping opacity-20"></div>}
                  
                  {/* Icon: Using 'science' for a bottle/flask look as requested vs robot */}
                  <span className={`material-symbols-outlined text-xl ${isListening ? 'text-[#C5A065]' : 'text-white/80'}`}>
                      {isListening ? 'graphic_eq' : 'science'} 
                  </span>
              </div>
              <div className="hidden md:block">
                  <h3 className="font-serif font-medium text-lg tracking-wide text-[#F5F3EF]">Bottle Specialist</h3>
                  <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-[#C5A065] animate-pulse' : 'bg-green-500/50'}`}></span>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{isListening ? 'Listening...' : 'Online'}</p>
                  </div>
              </div>
          </div>

          <form onSubmit={handleTextSubmit} className="flex-1 w-full relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C5A065]/0 via-[#C5A065]/5 to-[#C5A065]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-full" />
              <input 
                  type="text" 
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Describe your vision (e.g. 'Elegant 50ml glass bottle for serums')..."}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-28 text-sm text-white/90 placeholder:text-white/20 focus:bg-white/10 focus:border-[#C5A065]/50 focus:ring-1 focus:ring-[#C5A065]/20 outline-none transition-all font-light tracking-wide"
                  disabled={isListening || isProcessingText}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* Voice Button */}
                  <button 
                    type="button"
                    onClick={toggleVoice}
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isListening 
                        ? 'bg-[#C5A065] text-white shadow-lg scale-105' 
                        : 'hover:bg-white/10 text-white/60 hover:text-white'
                    }`}
                    title="Toggle Voice Chat"
                  >
                      <span className="material-symbols-outlined text-lg">
                          {isListening ? 'stop' : 'mic'}
                      </span>
                  </button>
                  
                  {/* Send Button */}
                  <button 
                    type="submit"
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        assistantInput.trim() 
                        ? 'bg-white text-[#1D1D1F] hover:bg-[#C5A065] hover:text-white' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                    disabled={!assistantInput.trim()}
                  >
                      <span className="material-symbols-outlined text-lg">arrow_upward</span>
                  </button>
              </div>
          </form>
          
          {/* Feedback Area (Desktop) */}
          <div className="hidden xl:flex w-72 text-xs text-white/50 border-l border-white/10 pl-6 h-10 items-center">
              <span className="line-clamp-2 font-light italic leading-relaxed">
                  "{aiMessage}"
              </span>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-background-dark font-sans animate-fade-in">
        
        {/* Persistent AI Header */}
        <AIHeader />

        {/* --- Render: Briefing (Intake) --- */}
        {mode === 'brief' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Exit Studio
                </button>

                <div className="max-w-3xl w-full text-center mt-8">
                    <div className="mb-12">
                        <span className="text-[#C5A065] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Interactive Studio</span>
                        <h1 className="text-4xl md:text-6xl font-serif text-[#1D1D1F] dark:text-white mb-6">What are you creating today?</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Use the AI bar above to describe your vision, or select a starting category below.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => { setContextCategory(cat.id); setMode('studio'); }}
                                className="group relative h-56 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:border-[#C5A065] dark:hover:border-[#C5A065] transition-all duration-300 flex flex-col items-center justify-center gap-4 overflow-hidden shadow-sm hover:shadow-xl"
                            >
                                <div className="w-20 h-20 rounded-full bg-white dark:bg-black/20 flex items-center justify-center text-gray-400 group-hover:text-[#C5A065] group-hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="material-symbols-outlined text-4xl">{cat.icon}</span>
                                </div>
                                <span className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">{cat.label}</span>
                                <div className="absolute inset-0 bg-[#C5A065]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={() => setMode('studio')} className="mt-16 text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-current transition-colors">
                        Skip to Visual Builder
                    </button>
                </div>
            </div>
        )}

        {/* --- Render: Studio (Builder) --- */}
        {mode === 'studio' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-80px)]">
                {/* Left: The Canvas (Preview) */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-white dark:bg-[#151515] relative flex flex-col justify-center items-center p-8 shadow-xl z-10">
                    <button onClick={() => setMode('brief')} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Restart
                    </button>

                    <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center transition-all duration-700">
                            {selections.vessel ? (
                                <img src={selections.vessel.img} className="h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal z-10 drop-shadow-2xl animate-fade-up" alt="Selected Vessel" />
                            ) : (
                                <div className="text-center opacity-30">
                                    <span className="material-symbols-outlined text-6xl mb-2">science</span>
                                    <p className="text-xs font-bold uppercase tracking-widest">Select a Vessel to begin</p>
                                </div>
                            )}
                            {selections.closure && selections.vessel && (
                                <div className="absolute top-[10%] right-[10%] bg-white/90 dark:bg-black/60 backdrop-blur-md p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-lg flex items-center gap-3 animate-slide-up">
                                    <div className="w-8 h-8 rounded-full border border-gray-200" style={{ background: selections.closure.color }}></div>
                                    <div className="text-left">
                                        <span className="block text-[10px] uppercase font-bold text-gray-500">Paired With</span>
                                        <span className="block text-xs font-bold text-[#1D1D1F] dark:text-white">{selections.closure.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 flex flex-col gap-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#C5A065] mb-2">{contextCategory ? `Project: ${contextCategory}` : 'Current Kit'}</div>
                        <div className="flex flex-col gap-1 text-sm text-[#1D1D1F] dark:text-white">
                            <span className={selections.vessel ? "" : "text-gray-400 opacity-50"}>1. Vessel: {selections.vessel?.name || "Pending..."}</span>
                            <span className={selections.fitment ? "" : "text-gray-400 opacity-50"}>2. Fitment: {selections.fitment?.name || "Pending..."}</span>
                            <span className={selections.closure ? "" : "text-gray-400 opacity-50"}>3. Closure: {selections.closure?.name || "Pending..."}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-right">
                        <span className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Total Estimate</span>
                        <span className="block text-3xl font-serif text-[#1D1D1F] dark:text-white">${calculateTotal()}</span>
                        <span className="block text-[10px] text-gray-400 mt-1">${calculateUnitPrice()} / unit for {selections.quantity} units</span>
                    </div>
                </div>

                {/* Right: The Palette (Controls) */}
                <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col bg-[#F9F8F6] dark:bg-background-dark border-l border-gray-200 dark:border-gray-800 relative">
                    <div className="shrink-0 bg-[#F9F8F6]/95 dark:bg-background-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-6 md:px-12 py-6 flex justify-between items-center">
                        <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar">
                            {['Vessel', 'Fitment', 'Closure'].map((step, idx) => (
                                <button key={step} onClick={() => setActiveStep(idx as any)} className={`text-xs font-bold uppercase tracking-widest pb-1 transition-all relative whitespace-nowrap ${activeStep === idx ? 'text-[#1D1D1F] dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {idx + 1}. {step}
                                    {activeStep === idx && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A065]"></span>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setMode('summary')} disabled={!selections.vessel || !selections.fitment || !selections.closure} className={`hidden md:flex bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity ${(!selections.vessel || !selections.fitment || !selections.closure) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Finish
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32">
                        <div className="mb-8 p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Order Quantity</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelections(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 50) }))} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200"><span className="material-symbols-outlined text-sm">remove</span></button>
                                <input type="number" value={selections.quantity} onChange={(e) => setSelections(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 0) }))} className="w-16 text-center bg-transparent border-none font-bold text-[#1D1D1F] dark:text-white" />
                                <button onClick={() => setSelections(prev => ({ ...prev, quantity: prev.quantity + 50 }))} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200"><span className="material-symbols-outlined text-sm">add</span></button>
                            </div>
                        </div>

                        {activeStep === 0 && (
                            <div className="animate-fade-in grid grid-cols-2 gap-4">
                                {VESSELS.map((item) => (
                                    <button key={item.id} onClick={() => handleSelect('vessel', item)} className={`group relative aspect-[4/5] bg-white dark:bg-white/5 rounded-xl border transition-all duration-300 p-4 flex flex-col items-center justify-between hover:shadow-lg ${selections.vessel?.id === item.id ? 'border-[#C5A065] ring-1 ring-[#C5A065] shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-400">{item.capacity}</div>
                                        <img src={item.img} className="h-[60%] object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform" alt={item.name} />
                                        <div className="w-full text-center">
                                            <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white mb-1">{item.name}</span>
                                            <span className="block text-xs text-gray-500">${item.price.toFixed(2)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="animate-fade-in space-y-3">
                                {FITMENTS.map((item) => (
                                    <button key={item.id} onClick={() => handleSelect('fitment', item)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selections.fitment?.id === item.id ? 'bg-white dark:bg-white/10 border-[#C5A065] ring-1 ring-[#C5A065] shadow-md' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selections.fitment?.id === item.id ? 'bg-[#C5A065] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><span className="material-symbols-outlined">{item.icon}</span></div>
                                            <div className="text-left"><span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">{item.name}</span><span className="block text-xs text-gray-400">{item.description}</span></div>
                                        </div>
                                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-white">{item.price === 0 ? 'Included' : `+$${item.price.toFixed(2)}`}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="animate-fade-in grid grid-cols-2 gap-4">
                                {CAPS.map((item) => (
                                    <button key={item.id} onClick={() => handleSelect('closure', item)} className={`group relative p-6 rounded-xl border transition-all text-center flex flex-col items-center gap-4 hover:shadow-md ${selections.closure?.id === item.id ? 'bg-white dark:bg-white/10 border-[#C5A065] ring-1 ring-[#C5A065]' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <div className="w-16 h-16 rounded-full shadow-inner" style={{ backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.1)' }}></div>
                                        <div>
                                            <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">{item.name}</span>
                                            <span className="block text-xs text-gray-400 mt-1">{item.material}</span>
                                            <span className="block text-xs font-bold text-primary mt-2">{item.price === 0 ? 'Included' : `+$${item.price.toFixed(2)}`}</span>
                                        </div>
                                        {selections.closure?.id === item.id && <div className="absolute top-3 right-3 text-[#C5A065]"><span className="material-symbols-outlined text-lg">check_circle</span></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="md:hidden fixed bottom-[70px] left-0 w-full p-4 pointer-events-none">
                        <button onClick={() => { if (activeStep < 2) setActiveStep((prev) => (prev + 1) as any); else setMode('summary'); }} disabled={activeStep === 2 && !selections.closure} className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg pointer-events-auto">
                            {activeStep < 2 ? 'Next Step' : 'Finish Kit'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- Render: Summary (Checkout) --- */}
        {mode === 'summary' && (
            <div className="flex-1 flex items-center justify-center p-6 bg-[#F9F8F6] dark:bg-background-dark">
                <div className="max-w-2xl w-full bg-white dark:bg-white/5 rounded-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
                    <button onClick={() => setMode('studio')} className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary">Edit Kit</button>
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"><span className="material-symbols-outlined text-3xl">check</span></div>
                        <h2 className="text-3xl font-serif font-bold text-[#1D1D1F] dark:text-white mb-2">Kit Configured</h2>
                        <p className="text-gray-500 text-sm">Your custom SKU has been generated.</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Vessel</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.vessel?.name}</span></div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Mechanism</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.fitment?.name}</span></div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Closure</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.closure?.name}</span></div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Quantity</span><span className="text-sm font-bold text-[#1D1D1F] dark:text-white">{selections.quantity} units</span></div>
                        <div className="flex justify-between items-center pt-4 mt-2"><span className="text-sm font-bold uppercase tracking-widest text-gray-400">Total Price</span><span className="text-2xl font-serif font-bold text-[#1D1D1F] dark:text-white">${calculateTotal()}</span></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleFinishKit} className="w-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:opacity-90 shadow-lg">Add Kit to Cart</button>
                        <button onClick={() => setMode('brief')} className="w-full py-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white">Start New Project</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
