# 🎯 VOICE CHAT SETUP - Google Gemini Live API

## ✅ What You Have

Your homepage already has a **fully functional voice chat** using Google Gemini 2.5 Live API!

**Location**: The search bar at the top of the homepage (with microphone icon)

**How it works**:
1. Customer clicks microphone
2. Speaks their needs ("I need 500 units of 10ml amber rollers")
3. AI (Gemini) has conversation to understand requirements
4. AI automatically routes them to the Project Builder with parameters

---

## 🔑 Get Google Gemini API Key (FREE - 2 minutes)

### Step 1: Go to Google AI Studio
1. Visit: https://aistudio.google.com/apikey
2. Sign in with your Google account

### Step 2: Create API Key
1. Click "Create API Key"
2. Select "Create API key in new project" (or use existing)
3. **Copy** the API key (starts with `AIza...`)

### Step 3: Add to `.env`
Open your `.env` file and replace line 13:

```env
VITE_GOOGLE_GEMINI_API_KEY=AIzaSy_your_actual_key_here
```

### Step 4: Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## 🎤 How to Test

1. **Open** http://localhost:3000/
2. **Look** for the search bar at top (says "Describe your project...")
3. **Click** the microphone icon (orange/yellow)
4. **Allow** microphone permissions
5. **Speak**: "I need 10ml perfume bottles"
6. **Listen**: AI will respond and ask clarifying questions
7. **Continue** conversation until AI routes you to builder

---

## 🎯 The AI Workflow

### What the AI Does:
1. **Greets** customer
2. **Asks** clarifying questions:
   - What size/capacity?
   - What type (perfume, oil, serum)?
   - How many units?
   - Preferred color?
3. **Collects** all requirements
4. **Routes** to Project Builder with parameters

### When AI Routes to Builder:
The AI calls the `start_builder` function with:
- `category`: perfume, oil, serum, jar, roll-on
- `capacity`: 10ml, 30ml, 50ml, etc.
- `quantity`: number of units
- `color`: Amber, Blue, Clear, etc.

---

## 💡 Why Gemini Live (Not ElevenLabs)?

**Gemini Live API is BETTER for this use case**:
- ✅ **FREE** (generous quota)
- ✅ **Real-time voice** (low latency)
- ✅ **Function calling** (can trigger builder navigation)
- ✅ **Multimodal** (voice + text + vision)
- ✅ **No monthly fees**

**ElevenLabs** is great for:
- Premium voice quality
- Custom voice cloning
- Production voice apps
- But costs $22-$330/month

---

## 🎨 Current Voice

**Voice**: "Kore" (Gemini's built-in voice)
- Professional
- Clear
- Natural sounding
- Works great for product consultation

---

## 📊 What Happens in the Code

### 1. User clicks mic → Starts Gemini Live session
```typescript
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY });
const session = ai.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  responseModalities: [Modality.AUDIO],
  speechConfig: { voiceConfig: { voiceName: 'Kore' } }
});
```

### 2. AI has conversation → Collects requirements
System instruction tells AI to:
- Ask clarifying questions
- Don't rush to builder
- Gather category, capacity, quantity, color

### 3. AI calls function → Routes to builder
```typescript
{
  name: "start_builder",
  args: {
    category: "perfume",
    capacity: "10ml",
    quantity: 500,
    color: "Amber"
  }
}
```

### 4. App navigates → Custom event dispatched
```typescript
window.dispatchEvent(new CustomEvent('navigate-to-builder', {
  detail: { category, capacity, quantity, color }
}));
```

---

## ✅ Setup Checklist

- [ ] Get Gemini API key from https://aistudio.google.com/apikey
- [ ] Add to `.env` as `VITE_GOOGLE_GEMINI_API_KEY`
- [ ] Restart dev server
- [ ] Test microphone on homepage
- [ ] Have conversation with AI
- [ ] Verify AI routes to builder

---

## 🎯 For Client Demo

### Demo Script:
1. **Show homepage**: "This is the AI-powered consultation"
2. **Click mic**: "Watch as I describe my needs"
3. **Speak**: "I need 500 units of 10ml amber roll-on bottles"
4. **AI responds**: Asks clarifying questions
5. **Continue**: Answer AI's questions
6. **AI routes**: Automatically takes you to builder with specs
7. **Wow factor**: "The AI understood everything and pre-filled the builder!"

---

## 🚀 Next Steps

1. **Get API key** (2 minutes)
2. **Add to `.env`**
3. **Restart server**
4. **Test voice chat**
5. **Practice demo flow**
6. **Show client!** 🎉

---

**This is MUCH better than ElevenLabs for this use case - it's free, fast, and has function calling built-in!**
