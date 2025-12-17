# Quick Integration Guide

## Adding AI Features to Your Best Bottles App

### Step 1: Add AI Chat to App.tsx

Replace the existing `ChatBot` component with the new `AIChat` component:

```typescript
// In App.tsx, line 18, replace:
import { ChatBot } from "./components/ChatBot";

// With:
import { AIChat } from "./components/AIChat";

// Then on line 201, replace:
{view !== 'consultation' && <ChatBot />}

// With:
{view !== 'consultation' && <AIChat />}
```

### Step 2: Add Label Generator Route (Optional)

If you want to add the label generator as a separate page:

1. **Convert LabelGenerator to TypeScript**:
   - Rename `components/LabelGenerator.jsx` to `components/LabelGenerator.tsx`
   - Add proper TypeScript types
   - Import it in App.tsx

2. **Add to view state** (line 54):
```typescript
const [view, setView] = useState<'home' | 'detail' | 'roll-on-detail' | 'consultation' | 'collections' | 'collection-detail' | 'custom' | 'journal' | 'packaging-ideas' | 'help-center' | 'contact' | 'signup' | 'contract-packaging' | 'checkout' | 'label-generator'>('home');
```

3. **Add navigation function**:
```typescript
const navigateToLabelGenerator = () => setView('label-generator');
```

4. **Add to renderView switch** (around line 172):
```typescript
case 'label-generator': return <LabelGenerator onBack={navigateToHome} />;
```

5. **Add to Header navigation** (optional):
Update the Header component to include a link to the label generator.

---

## Step 3: Test the Chat

1. Make sure `npm run dev` is running
2. Open your browser to the localhost URL
3. Look for the AI chat button in the bottom right
4. Click it and try these test queries:
   - "Show me your bottles"
   - "What are your bulk pricing options?"
   - "Can I customize bottles with my logo?"
   - "Tell me about shipping"

---

## Step 4: Configure ElevenLabs (Optional - For Voice)

If you want voice chat functionality:

1. **Create `.env` file** in project root:
```env
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

2. **Sign up at ElevenLabs**:
   - Go to [elevenlabs.io](https://elevenlabs.io)
   - Create account
   - Get API key from Profile → API Keys

3. **Create AI Agent**:
   - Go to Conversational AI section
   - Create new agent
   - Name it "Best Bottles Assistant"
   - Copy the knowledge base from `ELEVENLABS_KNOWLEDGE_BASE.md`
   - Choose a professional voice
   - Copy the Agent ID

4. **Update AIChat.tsx**:
   - Uncomment the ElevenLabs integration code
   - Add the `useConversation` hook from `@elevenlabs/react`

---

## Step 5: Enable Gemini Nano (Optional - For Label Generator)

For on-device AI label generation:

1. **Install Chrome Canary**:
   - Download from [google.com/chrome/canary](https://www.google.com/chrome/canary/)

2. **Enable Flags**:
   - Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to "Enabled"
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Set to "Enabled"
   - Restart Chrome

3. **Verify**:
   - Open DevTools (F12)
   - Run: `await window.ai.languageModel.capabilities()`
   - Should return `{ available: "readily" }`

**Note**: The label generator works without Nano using intelligent fallback responses.

---

## Quick Test Checklist

- [ ] AI chat button appears in bottom right
- [ ] Chat opens when clicked
- [ ] Can send messages and receive responses
- [ ] Quick action buttons work
- [ ] Chat closes properly
- [ ] Responsive on mobile (test by resizing browser)
- [ ] Animations are smooth
- [ ] No console errors

---

## Troubleshooting

### Chat button doesn't appear
- Check that `AIChat` is imported in App.tsx
- Verify it's rendered in the JSX (line 201)
- Check browser console for errors

### Chat doesn't respond
- Demo responses should work without any configuration
- Check browser console for errors
- Verify the `handleDemoResponse` function is working

### Styling looks wrong
- Make sure Tailwind CSS is configured
- Check that all Tailwind classes are being processed
- Clear browser cache and rebuild

### TypeScript errors
- Run `npm run lint` to see all errors
- Make sure `lucide-react` is installed
- Check that all imports are correct

---

## Files Created

✅ `components/AIChat.tsx` - Main chat component (TypeScript)
✅ `components/LabelGenerator.jsx` - Label generator (needs TS conversion)
✅ `components/LabelGenerator.css` - Label generator styles
✅ `IMPLEMENTATION_PLAN.md` - Technical roadmap
✅ `ELEVENLABS_KNOWLEDGE_BASE.md` - AI training data
✅ `AI_FEATURES_SUMMARY.md` - Feature documentation
✅ `CLIENT_MEETING_SUMMARY.md` - Meeting prep document
✅ `INTEGRATION_GUIDE.md` - This file

---

## Next Steps

1. **Test the chat** - Make sure it works in your existing app
2. **Review with client** - Show the demo and get feedback
3. **Decide on features** - Which features do they want?
4. **Plan integration** - Create timeline for full implementation
5. **Configure APIs** - Set up ElevenLabs if they want voice

---

## Need Help?

- Check the `IMPLEMENTATION_PLAN.md` for detailed technical info
- Review `AI_FEATURES_SUMMARY.md` for feature details
- See `CLIENT_MEETING_SUMMARY.md` for presentation tips
- All knowledge base content is in `ELEVENLABS_KNOWLEDGE_BASE.md`

---

**Remember**: This is a proof-of-concept demo. Full production implementation will require additional development, testing, and configuration.
