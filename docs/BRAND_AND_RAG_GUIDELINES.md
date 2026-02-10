# Brand Guidelines & RAG System Configuration
## Best Bottles - Premium Image Direction

### 1. Brand Essence & Mission
**Mission Statement:**
To elevate the packaging experience by providing "Muted Luxury" solutions that blend timeless artisanal craftsmanship with modern sustainable practices. We believe the vessel is as vital as the scent it holds.

**Core Values:**
*   **Muted Luxury:** Sophisticated, understated, and timeless.
*   **Sustainability:** Eco-friendly materials and circular practices.
*   **Craftsmanship:** High-quality glass, precision closures, and attention to detail.
*   **Client-Centricity:** acting as a partner in the client's brand journey.

### 2. Visual Identity & Premium Image Direction
To maintain the "Muted Luxury" aesthetic, all generated content and imagery should adhere to these guidelines:

**Color Palette:**
*   **Primary:**
    *   `#1D1D1F` (Off-Black/Charcoal): Use for primary text, headers, and strong accents. convey solidity and sophistication.
    *   `#F5F3EF` (Warm Off-White/Bone): Use for backgrounds to create a soft, inviting canvas. Avoid harsh pure white (`#FFFFFF`).
*   **Accent:**
    *   `#C5A065` (Muted Gold/Bronze): Use sparingly for buttons, highlights, and icons. It should look metallic and refined, not yellow or gaudy.
    *   `#637588` (Slate Blue/Grey): Use for secondary text and subtle borders.
    *   `#EBE7DD` (Warm Beige): Use for section dividers and card backgrounds.

**Typography:**
*   **Headings:** *Serif font* (e.g., similar to 'Playfair Display' or 'Bodoni'). Elegant, high-contrast strokes. Use for impact and luxury feel.
*   **Body:** *Sans-serif font* (e.g., similar to 'Inter', 'Roboto', or 'Lato'). Clean, legible, and modern.
*   **Styling:** Use uppercase with wide letter spacing (tracking) for labels and small headers (e.g., `TRACKING-WIDEST`).

**Imagery Style (Premium Direction):**
*   **Subject:** Glass bottles, vials, and jars.
*   **Lighting:** Cinematic, dramatic lighting with soft shadows. "Chiaroscuro" effect. Highlights the curvature and clarity of the glass.
*   **Composition:** Minimalist. Clean backgrounds (concrete, marble, linen). Negative space is crucial.
*   **Mood:** Serene, expensive, artisanal.
*   **Key Descriptors for AI Generation:** "photorealistic," "cinematic lighting," "macro shot," "depth of field," "soft finish," "premium glass," "muted tones," "minimalist composition."

### 3. RAG System Context (Programming Guide)
This section defines how the RAG (Retrieval-Augmented Generation) system should interpret user queries and retrieve information to align with the brand.

**System Persona:** "Grace" - The knowledgeable, warm, and professional concierge.

**Retrieval Priority:**
1.  **Product Specifics:** When a user asks about a specific attribute (e.g., "9ml bottle"), prioritize retrieving exact matches from the *Product Database* (SKU, Capacity, Material).
2.  **Brand Alignment:** If a user's request is vague (e.g., "I need something fancy"), prioritize products described as "Premium," "Decorative," "Glass," or those with "Gold/Silver" caps.
3.  **Educational Content:** Use the *FAQ* and *Journal* data to answer questions about usage (e.g., "UV protection" -> Amber glass) and policies.

**Response Formatting Rules:**
*   **Tone Check:** Ensure every response passes the "Muted Luxury" test. No slang, no excessive exclamation points. Polite and polished.
*   **Pricing:** NEVER quote specific prices from the static knowledge base. Dynamics change. Always refer to the "Configurator" or "Bulk Pricing Tiers" generally.
*   **Upsell Strategy:** Always suggest a matching closure or accessory. (e.g., "This 9ml bottle pairs beautifully with our black fine mist sprayer.")

### 4. Knowledge Base Structure for RAG
The `ELEVENLABS_PRODUCT_KNOWLEDGE.md` file is structured to support this RAG system:

*   **Grouped Variants:** Products are clustered by family (Roll-ons, Sprayers) to allow the AI to see the full breadth of options (colors/sizes) in one context window.
*   **Search Guide:** A dedicated section maps common user intents ("By Capacity", "By Material") to specific product counts, helping the AI form quick mental maps of the inventory.
*   **Bulk Guidelines:** Clear rules on pricing tiers (1-11, 12-143, 144+) are provided to generate accurate *estimates* without committing to volatile unit prices.

### 5. Client Presentation Summary
*   **The Problem:** Clients struggle to navigate 2,000+ SKUs.
*   **The Solution:** "Grace" (AI Concierge) + "Muted Luxury" Interface.
*   **The Brand:** Moving from a commodity supplier to a luxury partner.
*   **The Tech:** RAG system powered by structured inventory data, ensuring accurate, consistent, and on-brand responses 24/7.
