import React, { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw, Wand2, Loader } from 'lucide-react';
import './LabelGenerator.css';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

const LabelGenerator = () => {
    const [isGeminiAvailable, setIsGeminiAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        productName: '',
        productType: 'essential-oil',
        brandStyle: 'luxury',
        targetAudience: 'premium',
        additionalNotes: ''
    });
    const [generatedLabel, setGeneratedLabel] = useState(null);

    useEffect(() => {
        // Check if Gemini API key is available
        if (GEMINI_API_KEY) {
            setIsGeminiAvailable(true);
            console.log('Gemini API is configured');
        }
    }, []);

    const generateWithGemini = async (prompt) => {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        }
                    })
                }
            );

            const data = await response.json();
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
            return null;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return null;
        }
    };

    const generateWithFallback = async () => {
        // Fallback demo responses based on inputs
        const { productName, productType, brandStyle, targetAudience } = formData;

        const styleDescriptions = {
            luxury: 'opulent gold foil accents, embossed details, and rich typography',
            modern: 'clean lines, minimalist design, and contemporary sans-serif fonts',
            vintage: 'ornate borders, classic serif fonts, and aged paper textures',
            minimalist: 'simple geometric shapes, ample white space, and refined typography'
        };

        const audienceDescriptions = {
            premium: 'sophisticated collectors and connoisseurs',
            mainstream: 'everyday enthusiasts and consumers',
            boutique: 'boutique brands and artisan makers',
            corporate: 'businesses and corporate branding'
        };

        const productColors = {
            'essential-oil': { primary: '#2D5F3F', name: 'botanical green' },
            'perfume': { primary: '#C5A065', name: 'elegant gold' },
            'skincare': { primary: '#E8E8E8', name: 'pure white' },
            'aromatherapy': { primary: '#8B6BB9', name: 'lavender purple' }
        };

        return {
            headline: `${productName || 'Premium Product'}`,
            tagline: `Pure. Natural. Refined.`,
            description: `A distinguished ${productType.replace('-', ' ')} product designed for ${audienceDescriptions[targetAudience]}. This exceptional creation embodies the perfect balance of nature and elegance.`,
            designElements: [
                `${styleDescriptions[brandStyle]}`,
                `Color palette: ${productColors[productType]?.name || 'natural earth'} tones`,
                `Premium materials: Textured label with ${brandStyle === 'luxury' ? 'metallic' : brandStyle === 'vintage' ? 'aged' : 'matte'} finish`,
                `Typography: ${brandStyle === 'modern' ? 'Contemporary sans-serif' : brandStyle === 'vintage' ? 'Classic serif with flourishes' : 'Elegant serif'} for main text`
            ],
            labelLayout: {
                top: `Brand name in ${brandStyle === 'luxury' ? 'gold foil' : brandStyle === 'modern' ? 'embossed' : 'elegant script'}`,
                center: `${productName || 'Product name'} as focal point with ${brandStyle} styling`,
                bottom: `Volume, ingredients, and origin details in refined typography`
            },
            colorScheme: {
                primary: productColors[productType]?.primary || '#C5A065',
                secondary: brandStyle === 'luxury' ? '#1A1A1A' : brandStyle === 'modern' ? '#FFFFFF' : '#F5F5DC',
                accent: '#C9A961'
            }
        };
    };

    const handleGenerate = async () => {
        setIsLoading(true);

        const prompt = `You are a premium label designer for bottle products. Create a sophisticated label design for:

Product Name: ${formData.productName || 'Unnamed Product'}
Product Type: ${formData.productType.replace('-', ' ')}
Brand Style: ${formData.brandStyle}
Target Audience: ${formData.targetAudience}
Additional Notes: ${formData.additionalNotes || 'None'}

Generate a comprehensive label design including:
1. A compelling headline and tagline
2. Product description (2-3 sentences that evoke luxury and quality)
3. Design elements and visual style recommendations
4. Label layout for a bottle (top, center, bottom sections)
5. Color scheme suggestions with hex codes

Make it feel premium, sophisticated, and aligned with the Best Bottles brand aesthetic.`;

        try {
            let result;

            if (isGeminiAvailable) {
                const geminiResult = await generateWithGemini(prompt);
                if (geminiResult) {
                    result = parseLabelResponse(geminiResult);
                }
            }

            if (!result) {
                result = await generateWithFallback();
            }

            setGeneratedLabel(result);
        } catch (error) {
            console.error('Error generating label:', error);
            const fallbackResult = await generateWithFallback();
            setGeneratedLabel(fallbackResult);
        } finally {
            setIsLoading(false);
        }
    };

    const parseLabelResponse = (text) => {
        // Simple parser for Nano response
        // In production, this would be more sophisticated
        return {
            headline: formData.productName || 'Premium Spirit',
            tagline: 'AI-Generated Excellence',
            description: text.substring(0, 200),
            designElements: [
                'AI-generated design elements',
                'Custom color palette',
                'Premium typography',
                'Sophisticated layout'
            ],
            labelLayout: {
                top: 'Brand positioning',
                center: 'Product showcase',
                bottom: 'Legal and origin details'
            },
            colorScheme: {
                primary: '#D4AF37',
                secondary: '#1A1A1A',
                accent: '#C9A961'
            },
            fullText: text
        };
    };

    const handleReset = () => {
        setFormData({
            productName: '',
            spiritType: 'whiskey',
            brandStyle: 'luxury',
            targetAudience: 'premium',
            additionalNotes: ''
        });
        setGeneratedLabel(null);
    };

    const handleExport = () => {
        const exportData = {
            ...formData,
            generatedLabel,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `label-design-${formData.productName || 'untitled'}.json`;
        a.click();
    };

    return (
        <div className="label-generator">
            <div className="label-generator-header">
                <div className="header-content">
                    <h1>
                        <Sparkles size={32} />
                        AI Label Designer
                    </h1>
                    <p>Powered by {isGeminiAvailable ? 'Gemini AI' : 'AI Technology'}</p>
                </div>
                {isGeminiAvailable && (
                    <div className="nano-badge">
                        <Sparkles size={16} />
                        <span>Gemini AI</span>
                    </div>
                )}
            </div>

            <div className="label-generator-content">
                {/* Input Form */}
                <div className="generator-form">
                    <h2>Design Parameters</h2>

                    <div className="form-group">
                        <label>Product/Brand Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Serenity Oils"
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Type</label>
                        <select
                            value={formData.productType}
                            onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        >
                            <option value="essential-oil">Essential Oils</option>
                            <option value="perfume">Perfume / Fragrance</option>
                            <option value="skincare">Skincare / Serum</option>
                            <option value="aromatherapy">Aromatherapy</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Brand Style</label>
                        <select
                            value={formData.brandStyle}
                            onChange={(e) => setFormData({ ...formData, brandStyle: e.target.value })}
                        >
                            <option value="luxury">Luxury</option>
                            <option value="modern">Modern</option>
                            <option value="vintage">Vintage</option>
                            <option value="minimalist">Minimalist</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Target Audience</label>
                        <select
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        >
                            <option value="premium">Premium / Luxury</option>
                            <option value="mainstream">Mainstream / Everyday</option>
                            <option value="boutique">Boutique / Artisan</option>
                            <option value="corporate">Corporate / Wholesale</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional Notes (Optional)</label>
                        <textarea
                            placeholder="Any specific requirements or preferences..."
                            value={formData.additionalNotes}
                            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            className="generate-button"
                            onClick={handleGenerate}
                            disabled={isLoading || !formData.productName}
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={20} className="spinning" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={20} />
                                    Generate Label Design
                                </>
                            )}
                        </button>
                        <button className="reset-button" onClick={handleReset}>
                            <RefreshCw size={18} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Generated Output */}
                {generatedLabel && (
                    <div className="generator-output">
                        <div className="output-header">
                            <h2>Generated Label Design</h2>
                            <button className="export-button" onClick={handleExport}>
                                <Download size={18} />
                                Export
                            </button>
                        </div>

                        <div className="label-preview">
                            <div className="preview-card">
                                <div className="preview-header" style={{ background: generatedLabel.colorScheme.primary }}>
                                    <h3>{generatedLabel.headline}</h3>
                                    <p>{generatedLabel.tagline}</p>
                                </div>
                                <div className="preview-body">
                                    <p className="description">{generatedLabel.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="design-specs">
                            <div className="spec-section">
                                <h3>Design Elements</h3>
                                <ul>
                                    {generatedLabel.designElements.map((element, index) => (
                                        <li key={index}>{element}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="spec-section">
                                <h3>Label Layout</h3>
                                <div className="layout-grid">
                                    <div className="layout-item">
                                        <span className="layout-label">Top Section</span>
                                        <p>{generatedLabel.labelLayout.top}</p>
                                    </div>
                                    <div className="layout-item">
                                        <span className="layout-label">Center Section</span>
                                        <p>{generatedLabel.labelLayout.center}</p>
                                    </div>
                                    <div className="layout-item">
                                        <span className="layout-label">Bottom Section</span>
                                        <p>{generatedLabel.labelLayout.bottom}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="spec-section">
                                <h3>Color Scheme</h3>
                                <div className="color-palette">
                                    <div className="color-swatch">
                                        <div className="swatch" style={{ background: generatedLabel.colorScheme.primary }}></div>
                                        <span>Primary</span>
                                        <code>{generatedLabel.colorScheme.primary}</code>
                                    </div>
                                    <div className="color-swatch">
                                        <div className="swatch" style={{ background: generatedLabel.colorScheme.secondary }}></div>
                                        <span>Secondary</span>
                                        <code>{generatedLabel.colorScheme.secondary}</code>
                                    </div>
                                    <div className="color-swatch">
                                        <div className="swatch" style={{ background: generatedLabel.colorScheme.accent }}></div>
                                        <span>Accent</span>
                                        <code>{generatedLabel.colorScheme.accent}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabelGenerator;
