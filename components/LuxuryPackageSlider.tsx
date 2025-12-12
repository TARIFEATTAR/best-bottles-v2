import React, { useRef, useState, useCallback, useEffect } from "react";

// Define the data structure for a single "Scene"
type Scene = {
    before: string;
    after: string;
    labelBefore?: string;
    labelAfter?: string;
}

type Props = {
    scenes: Scene[];
    autoPlayDuration?: number; // seconds
    initialPosition?: number; // percentage
}

export const LuxuryPackageSlider: React.FC<Props> = ({
    scenes,
    autoPlayDuration = 3,
    initialPosition = 50,
}) => {
    // --- State Management ---
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fallback if no scenes provided
    const activeScene = scenes[currentSceneIndex] || { before: "", after: "", labelBefore: "", labelAfter: "" };

    // --- Autoplay Logic ---
    useEffect(() => {
        if (scenes.length <= 1 || isDragging || isHovering) return;

        const timer = setInterval(() => {
            setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
        }, autoPlayDuration * 1000);

        return () => clearInterval(timer);
    }, [scenes.length, isDragging, isHovering, autoPlayDuration]);

    // --- Drag Logic ---
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

    const updatePosition = useCallback((clientX: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = clientX - rect.left;
        const pct = (x / rect.width) * 100;
        setPosition(clamp(pct, 0, 100));
    }, []);

    const startDrag = (clientX: number) => {
        setIsDragging(true);
        updatePosition(clientX);
    };

    const moveDrag = (clientX: number) => {
        if (isDragging) requestAnimationFrame(() => updatePosition(clientX));
    };

    const stopDrag = () => setIsDragging(false);

    // --- Visual Calculations ---
    const crossfade = clamp((position - 40) / 20, 0, 1);
    const handleScale = isDragging ? 1.05 : 1;

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); stopDrag(); }}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                touchAction: "none",
                backgroundColor: "#F3F3F3", // Fallback background
            }}
            onPointerDown={(e) => startDrag(e.clientX)}
            onPointerMove={(e) => moveDrag(e.clientX)}
            onPointerUp={stopDrag}
            onTouchStart={(e) => startDrag(e.touches[0].clientX)}
            onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
            onTouchEnd={stopDrag}
        >
            {/* Render all scenes stacked, fading opacity to show active one */}
            {scenes.map((scene, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: index === currentSceneIndex ? 1 : 0,
                        transition: "opacity 0.8s ease-in-out",
                        pointerEvents: "none",
                    }}
                >
                    {/* The Full "After" Image (Background Layer - Right Side Visible) */}
                    <img
                        src={scene.after}
                        alt="Product Idea"
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            position: "absolute",
                            inset: 0,
                            padding: "32px", // Added padding to zoom out
                        }}
                    />

                    {/* The "Before" Image (Clipped Layer - Left Side Visible) */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            clipPath: `inset(0 ${100 - position}% 0 0)`,
                            willChange: "clip-path",
                            // We remove transition during drag for responsiveness, add it back for snap effects if needed
                            transition: isDragging ? "none" : "clip-path 0.1s linear", 
                        }}
                    >
                        <img
                            src={scene.before}
                            alt="Empty Bottle"
                            draggable={false}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                padding: "32px", // Added padding to zoom out
                            }}
                        />
                    </div>
                </div>
            ))}

            {/* --- UI ELEMENTS (Slider, Handle, Labels) --- */}
            
            {/* The Divider Line */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: `${position}%`,
                    width: "2px",
                    height: "100%",
                    background: "linear-gradient(to bottom, #c9b37a 0%, #b08d52 50%, #d4b677 100%)",
                    transform: "translateX(-50%)",
                    willChange: "left",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
                }}
            />

            {/* The Handle */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: `${position}%`,
                    transform: `translate(-50%, -50%) scale(${handleScale})`,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f1e0b4 0%, #b68d4f 100%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)",
                    border: "2px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    transition: "transform 0.15s ease-out",
                }}
            >
                {/* Simple arrows icon */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4E2B2B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4E2B2B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{transform: "rotate(180deg)"}}>
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </div>

            {/* Label: Before (Left) */}
            <div
                style={{
                    position: "absolute",
                    top: "24px",
                    left: "24px",
                    backgroundColor: "rgba(78, 43, 43, 0.9)", // Dark Brown branding
                    color: "#F5F1E8",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: 600,
                    opacity: crossfade,
                    transition: "opacity 0.2s ease-out",
                    backdropFilter: "blur(4px)"
                }}
            >
                {activeScene.labelBefore || "Before"}
            </div>

            {/* Label: After (Right) */}
            <div
                style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    color: "#4E2B2B", // Dark Brown text
                    padding: "6px 14px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: 700,
                    opacity: 1 - crossfade,
                    transition: "opacity 0.2s ease-out",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}
            >
                {activeScene.labelAfter || "After"}
            </div>
        </div>
    );
}