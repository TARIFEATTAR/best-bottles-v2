# Best Bottles Demo - Implementation Plan

## Meeting Features Implementation

### 1. Gemini Nano Label Generator

**Technology**: Chrome Built-in AI (Gemini Nano)
**Status**: ⏳ In Progress

#### Requirements:
- Chrome 128+ (Canary/Dev channel recommended)
- Enable Chrome flags:
  - `chrome://flags/#prompt-api-for-gemini-nano`
  - `chrome://flags/#optimization-guide-on-device-model`
- Download Gemini Nano model (happens automatically when enabled)

#### Implementation:
- Use Chrome's Prompt API to generate custom bottle labels
- Input: Product name, style preferences, target audience
- Output: AI-generated label descriptions and design suggestions
- Fallback: Use Google Gemini API if built-in AI unavailable

#### Features:
- Real-time label text generation
- Style customization (vintage, modern, minimalist, luxury)
- Export label designs
- Preview on bottle mockups

---

### 2. ElevenLabs Voice Chat Interface

**Technology**: ElevenLabs Conversational AI API + React SDK
**Status**: ⏳ In Progress

#### Requirements:
- ElevenLabs API Key
- `@elevenlabs/react` SDK
- WebRTC support (modern browsers)

#### Implementation:
- Create conversational AI agent in ElevenLabs dashboard
- Use `useConversation` hook for real-time voice interaction
- Implement WebRTC for superior audio quality
- Design premium chat UI with voice visualization

#### Voice Dataset for Demo:
The AI agent will be trained with comprehensive knowledge about:

1. **Product Information**
   - Detailed specs for all 4 bottles (Amber Essence, Midnight Noir, Crystal Clarity, Emerald Luxe)
   - Pricing, materials, dimensions, features
   - Use cases and target customers

2. **Brand Story**
   - Best Bottles heritage and craftsmanship
   - Sustainability initiatives
   - Quality assurance processes

3. **Customer Service**
   - Shipping and returns policies
   - Care instructions
   - Customization options
   - Bulk ordering information

4. **Conversational Flows**
   - Product recommendations based on needs
   - Comparison between different bottles
   - Gift suggestions
   - Technical specifications explanations

#### Chat Interface Features:
- Voice input/output with waveform visualization
- Text fallback for accessibility
- Conversation history
- Quick action buttons (product links, add to cart)
- Typing indicators and smooth animations
- Dark mode premium design

---

## Implementation Steps

### Phase 1: Setup (30 mins)
1. ✅ Install dependencies (`react-router-dom`, `@elevenlabs/react`, `lucide-react`)
2. ⏳ Set up environment variables for API keys
3. ⏳ Configure Chrome flags for Gemini Nano

### Phase 2: Label Generator (2-3 hours)
1. Create LabelGenerator component
2. Implement Prompt API integration
3. Add UI for input parameters
4. Build preview system
5. Add export functionality

### Phase 3: Voice Chat (2-3 hours)
1. Create ElevenLabs AI agent with product dataset
2. Build ChatInterface component
3. Integrate `useConversation` hook
4. Design voice visualization
5. Add conversation controls
6. Style premium UI

### Phase 4: Integration & Testing (1 hour)
1. Add features to main app
2. Test all interactions
3. Optimize performance
4. Prepare demo scenarios

---

## API Keys Needed

- [ ] ElevenLabs API Key (from elevenlabs.io)
- [ ] Google Gemini API Key (fallback for label generation)

---

## Demo Scenarios

### Scenario 1: Label Generation
1. Navigate to label generator
2. Select "Midnight Noir" bottle
3. Input: "Luxury whiskey for corporate gifts"
4. AI generates premium label design
5. Preview on 3D bottle mockup

### Scenario 2: Voice Consultation
1. Click chat icon
2. Ask: "I need a bottle for a premium vodka brand"
3. AI recommends Crystal Clarity with reasoning
4. Follow-up: "What about bulk orders?"
5. AI provides pricing and customization options

---

## Notes for Client Meeting

- This is a **proof of concept** demonstrating cutting-edge AI capabilities
- Label generator showcases on-device AI (privacy-first, no data sent to servers)
- Voice chat demonstrates natural, human-like customer service
- Both features can be expanded based on client needs
- Full production implementation would include:
  - Custom voice training
  - Advanced label design tools
  - Integration with e-commerce backend
  - Analytics and insights dashboard
