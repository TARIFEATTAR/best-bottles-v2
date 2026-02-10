# Grace Chat Integration - Troubleshooting

## ✅ What Was Done

1. ✅ Created `AIChat.tsx` component with ElevenLabs integration
2. ✅ Updated `App.tsx` to use `AIChat` instead of `ChatBot`
3. ✅ Added Supabase and ElevenLabs credentials to `.env`
4. ✅ Dev server restarted and optimized dependencies

---

## 🔍 Check These Things

### 1. Browser Console
Open browser console (F12) and check for errors:
- Red errors about missing modules?
- Warnings about API keys?

### 2. Chat Button Location
The button should be:
- **Position**: Fixed bottom-right corner
- **Appearance**: Purple gradient circle
- **Badge**: Green "AI" badge
- **Size**: 64px x 64px

### 3. Environment Variables
Check `.env` file has:
```env
VITE_ELEVENLABS_API_KEY=sk_...
VITE_ELEVENLABS_AGENT_ID=agent_...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 🧪 Quick Test

1. **Open**: http://localhost:3000/
2. **Open Console**: Press F12
3. **Look for**: Chat button bottom-right
4. **Click**: The button
5. **Check**: Chat window opens

---

## 🎤 Test Voice Chat

1. **Click**: Microphone icon in chat header
2. **Allow**: Browser microphone permissions
3. **Look for**: "Voice enabled" status
4. **Speak**: "Hello Grace"
5. **Listen**: Grace should respond

---

## 🆘 Common Issues

### Issue: No chat button visible
**Fix**: 
- Clear browser cache (Cmd+Shift+R)
- Check browser console for errors
- Verify `AIChat` component is imported in `App.tsx`

### Issue: Chat opens but no voice
**Fix**:
- Check ElevenLabs API key is correct
- Verify Agent ID is correct
- Check browser microphone permissions
- Look for errors in console

### Issue: "Agent ID not configured" message
**Fix**:
- Verify `.env` has `VITE_ELEVENLABS_AGENT_ID`
- Restart dev server after changing `.env`

---

## ✅ Success Checklist

- [ ] Chat button visible bottom-right
- [ ] Chat opens when clicked
- [ ] Can type messages
- [ ] Bot responds to messages
- [ ] Microphone icon visible
- [ ] Voice chat connects (if ElevenLabs configured)
- [ ] Grace responds with voice

---

**Try opening the app now and let me know what you see!**
