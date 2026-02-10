# Alignment Strategies: Scaling the Paper Doll

You asked if we can use an **X,Y Coordinate System** or **Auto-Detection** to avoid manual Photoshop work. 

**YES, it is possible.** Here are the three ways to handle alignment at scale, ranked by complexity and quality.

---

## Strategy A: The "Coordinate System" (Browser Calibrator)
*Best for: Clients who hate Photoshop but are willing to click a web interface.*

Instead of moving pixels in Photoshop, we move them using code (`transform: translate(x, y)`).

### How it works:
1.  **Upload Raw Images:** Upload the bottles/caps exactly as they are (even if they are on the floor).
2.  **The "Calibrator" Tool:** We build a simple internal webpage (Admin only).
    *   You select a Bottle and a Cap.
    *   You **drag the cap** with your mouse until it sits perfectly on the bottle.
    *   You click "Save".
3.  **Sanity Data:** The system saves the coordinates (e.g., `x: 20, y: -150`) to the Cap's document in Sanity.
4.  **Frontend:** The website reads these numbers and applies them effectively: `<img style={{ transform: 'translate(20px, -150px)' }} />`.

*   **Pros:** Zero Photoshop required. "Fix it in the browser."
*   **Cons:** We have to build this "Calibrator Tool" (approx. 1-2 days of dev).

---

## Strategy B: "Auto-Detect" Automation (Computer Vision)
*Best for: High-volume catalogs (1,000+ items) where "good enough" is acceptable.*

We write a script (using `sharp` or `OpenCV`) to analyze the pixel data of every image.

### How it works:
1.  **Auto-Trim:** The script finds the "Bounding Box" of the object and crops all transparent whitespace.
2.  **Auto-Center:** The script places the object in the exact center of a 1000x1000 canvas.
3.  **Anchor Logic:**
    *   For **Bottles**: Center Horizontally, Align to Bottom.
    *   For **Caps**: Center Horizontally, Align to Bottom (of the canvas, so it sits on top of the bottle layer).

*   **Pros:** Zero human effort.
*   **Cons:** **"Center of Mass" ≠ "Visual Center"**.
    *   If an image has a shadow on the left, the computer thinks the object is wider and will offset it to the right.
    *   Transparent glass is hard for computers to "see" accurately.
    *   **Result:** You will likely still have 10-20% of images looking "wobbly" or slightly off.

---

## Strategy C: The "Master Template" (Current)
*Best for: Pixel-perfect quality for Premium Brands.*

Designer manually centers the object on a standardized canvas.

*   **Pros:** Flawless visual result. No complex code or offsets.
*   **Cons:** Requires 5 minutes of Photoshop per New Shape.

---

## Recommendation
If the client absolutely refuses to touch Photoshop, **Strategy A (The Browser Calibrator)** is the safest bet. It gives them a visual interface to fix alignment without needing image editing software.
