# Grace - ElevenLabs Setup Quick Reference

## 🎩 Agent Configuration

### Agent Name
```
Grace - Best Bottles Product Expert
```

### First Message
```
Hello, I'm Grace, your Best Bottles product expert! I have knowledge of over 2,000 bottle products and I'm here to help you find the perfect packaging solution. Whether you need perfume bottles, essential oil containers, or specialty packaging, I can guide you to the right choice. What are you looking for today?
```

### System Prompt
📄 **Copy from**: `GRACE_SYSTEM_PROMPT.md`
- Open the file
- Copy the entire content
- Paste into ElevenLabs "System Prompt" or "Instructions" field

### Knowledge Base
📄 **Upload**: `ELEVENLABS_PRODUCT_KNOWLEDGE.md`
- Contains all 2,278 products
- 83KB file size

---

## 🎤 Recommended Voices (British Accent)

### Top Picks:
1. **Charlotte** - Professional British female (BEST for Grace)
2. **Alice** - Warm British female
3. **Lily** - Elegant British female

### Alternative (American):
- **Rachel** - Professional American female
- **Sarah** - Warm American female

**Recommendation**: Use **Charlotte** for the most elegant British sound

---

## ⚙️ Model Settings

- **Model**: GPT-4 Turbo
- **Temperature**: 0.7
- **Max Tokens**: 500
- **Language**: English (UK) if available

---

## ✅ Setup Checklist

- [ ] Agent Name: "Grace - Best Bottles Product Expert"
- [ ] First Message: Copied from above
- [ ] System Prompt: Copied from `GRACE_SYSTEM_PROMPT.md`
- [ ] Knowledge Base: Uploaded `ELEVENLABS_PRODUCT_KNOWLEDGE.md`
- [ ] Voice: Charlotte (British) selected
- [ ] Model: GPT-4 Turbo
- [ ] Temperature: 0.7
- [ ] Test conversation completed
- [ ] Agent ID copied
- [ ] Agent ID added to `.env` file

---

## 🧪 Test Queries

Try these to verify Grace is working:

1. "Hello Grace, what bottles do you have?"
2. "I need essential oil bottles"
3. "What's your bulk pricing?"
4. "Do you have roll-on bottles in amber?"
5. "Tell me about your 10ml perfume bottles"

Grace should:
- ✅ Introduce herself by name
- ✅ Provide specific SKUs
- ✅ Mention pricing
- ✅ Ask follow-up questions
- ✅ Sound natural and helpful
- ✅ Use British spellings (colour, favour)

---

## 📋 After Setup

1. **Copy Agent ID** from ElevenLabs
2. **Add to `.env`**:
   ```env
   VITE_ELEVENLABS_AGENT_ID=agent_your_id_here
   ```
3. **Restart dev server**: `npm run dev`
4. **Test in app**: Click chat button, enable voice

---

## 🎯 Grace's Personality

- **Tone**: Professional, warm, helpful
- **Style**: Elegant and knowledgeable
- **Accent**: British (if using Charlotte/Alice/Lily)
- **Approach**: Consultative, not pushy
- **Goal**: Help customers find perfect bottles

---

**Grace is ready to serve! 🇬🇧✨**
