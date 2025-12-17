import React, { useState } from 'react';

interface LabelSpecs {
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
}

interface LabelPartner {
    name: string;
    url: string;
    description: string;
}

interface VisualizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    productImage: string;
    productName: string;
    labelSpecs: LabelSpecs;
    labelPartners: LabelPartner[];
    onContinueToCart: () => void;
}

type DesignStyle = 'luxury' | 'artisanal' | 'minimalist';
type LabelType = 'wrap' | 'front';

export const VisualizeModal: React.FC<VisualizeModalProps> = ({
    isOpen,
    onClose,
    productImage,
    productName,
    labelSpecs,
    labelPartners,
    onContinueToCart
}) => {
    const [brandName, setBrandName] = useState('');
    const [designStyle, setDesignStyle] = useState<DesignStyle>('luxury');
    const [labelType, setLabelType] = useState<LabelType>('wrap');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToNotes, setSavedToNotes] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    const styleDescriptions = {
        luxury: 'Elegant gold foil, embossed textures, sophisticated typography',
        artisanal: 'Hand-crafted feel, botanical illustrations, kraft textures',
        minimalist: 'Clean lines, modern sans-serif, generous white space'
    };

    const handleGenerate = async () => {
        if (!brandName.trim()) {
            setError('Please enter your brand name');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);
        const logoInstruction = logoFile
            ? '- Include a small elegant logo icon on the label'
            : '';

        const prompt = `Professional product photography of a complete 9ml glass roll-on perfume bottle WITH the cap on.

BOTTLE:
- 9ml clear glass roll-on bottle, standing upright
- Metallic silver/chrome roller ball cap is ON the bottle (fully closed)
- Elegant cylindrical shape, premium cosmetic quality

LABEL:
- Brand name "${brandName}" displayed prominently on a wrap-around label
- Design style: ${designStyle.toUpperCase()}
${designStyle === 'luxury' ? '- Luxury aesthetic: gold foil accents, dark rich colors, elegant serif font' : ''}
${designStyle === 'artisanal' ? '- Artisanal aesthetic: kraft paper texture, botanical elements, vintage script' : ''}
${designStyle === 'minimalist' ? '- Minimalist aesthetic: clean sans-serif font, white space, simple geometry' : ''}
${logoInstruction}

SCENE:
- Studio product photography, professional lighting
- Soft neutral background (white or light gray)
- Subtle surface reflection
- Sharp focus, high quality

Generate a photorealistic bottle mockup ready for retail.`;

        try {
            // Check API keys
            const geminiApiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
            const freepikApiKey = import.meta.env.VITE_FREEPIK_API_KEY;

            if (!geminiApiKey && !freepikApiKey) {
                // Demo mode - show a placeholder with styling info
                await new Promise(resolve => setTimeout(resolve, 2000));
                setGeneratedImage('demo');
                setIsGenerating(false);
                return;
            }

            // Try Gemini first for image generation
            if (geminiApiKey) {
                try {
                    console.log('Generating with Gemini...');
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `Generate an image:\n\n${prompt}`
                                }]
                            }],
                            generationConfig: {
                                responseModalities: ["image", "text"]
                            }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Gemini response:', data);

                        if (data.candidates?.[0]?.content?.parts) {
                            for (const part of data.candidates[0].content.parts) {
                                if (part.inlineData?.mimeType?.startsWith('image/')) {
                                    setGeneratedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                                    setIsGenerating(false);
                                    return;
                                }
                            }
                        }
                    } else {
                        console.error('Gemini API error:', await response.text());
                    }
                } catch (geminiErr) {
                    console.error('Gemini API error:', geminiErr);
                }
            }

            // Fallback to Freepik if Gemini fails
            if (freepikApiKey) {
                try {
                    console.log('Generating with Freepik...');
                    const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-freepik-api-key': freepikApiKey
                        },
                        body: JSON.stringify({
                            prompt: prompt,
                            aspect_ratio: 'square_1_1',
                            num_images: 1,
                            styling: {
                                effects: {
                                    lighting: 'studio',
                                    framing: 'close_up'
                                }
                            },
                            filter_nsfw: true
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Freepik response:', data);

                        if (data.data?.[0]?.base64) {
                            setGeneratedImage(`data:image/png;base64,${data.data[0].base64}`);
                            setIsGenerating(false);
                            return;
                        } else if (data.data?.[0]?.url) {
                            setGeneratedImage(data.data[0].url);
                            setIsGenerating(false);
                            return;
                        }
                    } else {
                        console.error('Freepik API error:', await response.text());
                    }
                } catch (freepikErr) {
                    console.error('Freepik API error:', freepikErr);
                }
            }

            // Fallback to demo mode
            setGeneratedImage('demo');

        } catch (err) {
            console.error('Image generation error:', err);
            // Fallback to demo mode on error
            setGeneratedImage('demo');
        }

        setIsGenerating(false);
    };

    const handleSaveToNotes = () => {
        // In a real implementation, this would save to order notes
        setSavedToNotes(true);
        setTimeout(() => setSavedToNotes(false), 3000);
    };

    const currentLabelSpec = labelType === 'wrap' ? labelSpecs.wrapLabel : labelSpecs.frontLabel;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-[#1D1D1F] border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-serif text-[#1D1D1F] dark:text-white">Visualize Your Label</h2>
                        <p className="text-sm text-gray-500">See how your bottle could look with custom branding</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <i className="ph-thin ph-x text-xl text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left: Configuration */}
                        <div className="space-y-6">
                            {/* Brand Name Input */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Your Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    placeholder="e.g., LUMIÈRE, Botanical Bliss, ZEN"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                            </div>

                            {/* Logo Upload Drop Zone */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Your Logo (Optional)
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {logoPreview ? (
                                    <div className="relative p-4 rounded-xl border-2 border-gold bg-gold/5">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-16 h-16 object-contain rounded-lg bg-white"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#1D1D1F] dark:text-white">
                                                    {logoFile?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {logoFile && (logoFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={removeLogo}
                                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                            >
                                                <i className="ph-thin ph-trash text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleLogoDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${isDragging
                                            ? 'border-gold bg-gold/10'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:bg-gold/5'
                                            }`}
                                    >
                                        <i className={`ph-thin ph-upload-simple text-3xl mb-2 ${isDragging ? 'text-gold' : 'text-gray-400'}`} />
                                        <p className="text-sm text-gray-500">
                                            Drag & drop your logo here, or <span className="text-gold font-medium">click to browse</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Design Style */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                                    Design Style
                                </label>
                                <div className="space-y-2">
                                    {(['luxury', 'artisanal', 'minimalist'] as DesignStyle[]).map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setDesignStyle(style)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all ${designStyle === style
                                                ? 'border-gold ring-2 ring-gold bg-gold/5'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white capitalize">
                                                {style}
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-1">
                                                {styleDescriptions[style]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Label Type */}
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                                    Label Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setLabelType('wrap')}
                                        className={`p-4 rounded-xl border text-center transition-all ${labelType === 'wrap'
                                            ? 'border-gold ring-2 ring-gold bg-gold/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <i className="ph-thin ph-arrows-horizontal text-2xl text-gray-600 dark:text-gray-300 mb-2" />
                                        <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">Wrap Label</span>
                                        <span className="block text-[10px] text-gray-500">Full circumference</span>
                                    </button>
                                    <button
                                        onClick={() => setLabelType('front')}
                                        className={`p-4 rounded-xl border text-center transition-all ${labelType === 'front'
                                            ? 'border-gold ring-2 ring-gold bg-gold/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <i className="ph-thin ph-rectangle-portrait text-2xl text-gray-600 dark:text-gray-300 mb-2" />
                                        <span className="block text-sm font-bold text-[#1D1D1F] dark:text-white">Front Label</span>
                                        <span className="block text-[10px] text-gray-500">Portrait style</span>
                                    </button>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={`w-full py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isGenerating
                                    ? 'bg-gray-200 text-gray-400 cursor-wait'
                                    : 'bg-[#1D1D1F] text-white hover:bg-[#2D2D2F]'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                        Generating Mockup...
                                    </>
                                ) : (
                                    <>
                                        <i className="ph-thin ph-magic-wand text-lg" />
                                        Generate Mockup
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Right: Preview & Specs */}
                        <div className="space-y-6">
                            {/* Image Preview */}
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                                {generatedImage === 'demo' ? (
                                    <div className="text-center p-8">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                                            <i className="ph-thin ph-image text-4xl text-gold" />
                                        </div>
                                        <h3 className="text-lg font-serif text-[#1D1D1F] dark:text-white mb-2">
                                            {brandName || 'Your Brand'} - {designStyle.charAt(0).toUpperCase() + designStyle.slice(1)} Style
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {styleDescriptions[designStyle]}
                                        </p>
                                        <p className="text-xs text-gray-400 bg-white/50 dark:bg-black/30 rounded-lg px-3 py-2 inline-block">
                                            <i className="ph-thin ph-info mr-1" />
                                            Demo Mode: Connect Gemini API for AI-generated mockups
                                        </p>
                                    </div>
                                ) : generatedImage ? (
                                    <img
                                        src={generatedImage}
                                        alt="Generated mockup"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            className="h-40 mx-auto mb-4 object-contain opacity-50"
                                        />
                                        <p className="text-sm text-gray-400">
                                            Enter your brand name and click generate
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Label Specifications */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <i className="ph-thin ph-ruler text-lg" />
                                    Label Specifications
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">{currentLabelSpec.name}</span>
                                        <span className="text-sm font-bold text-[#1D1D1F] dark:text-white">
                                            {currentLabelSpec.width} × {currentLabelSpec.height}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Bleed</span>
                                        <span className="text-sm text-gray-500">{currentLabelSpec.bleed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Safe Zone</span>
                                        <span className="text-sm text-gray-500">{currentLabelSpec.safeZone}</span>
                                    </div>
                                    <button className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                        <i className="ph-thin ph-download-simple" />
                                        Download Template (PDF)
                                    </button>
                                </div>
                            </div>

                            {/* Label Partners */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <i className="ph-thin ph-printer text-lg" />
                                    Label Printing Partners
                                </h4>
                                <div className="space-y-2">
                                    {labelPartners.map((partner) => (
                                        <a
                                            key={partner.name}
                                            href={partner.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-white/10 transition-colors"
                                        >
                                            <div>
                                                <span className="block text-sm font-medium text-[#1D1D1F] dark:text-white">{partner.name}</span>
                                                <span className="block text-xs text-gray-500">{partner.description}</span>
                                            </div>
                                            <i className="ph-thin ph-arrow-square-out text-gray-400" />
                                        </a>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSaveToNotes}
                                    className={`w-full mt-3 py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${savedToNotes
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {savedToNotes ? (
                                        <>
                                            <i className="ph-thin ph-check-circle" />
                                            Saved to Order Notes
                                        </>
                                    ) : (
                                        <>
                                            <i className="ph-thin ph-floppy-disk" />
                                            Save Specs to Order Notes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-[#1D1D1F] border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="ph-thin ph-info" />
                        Mockup for visualization only. Not saved after session.
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={onContinueToCart}
                            className="px-6 py-3 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            Continue to Cart
                            <i className="ph-thin ph-arrow-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};





