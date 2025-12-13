
import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number; // in seconds
  threshold?: number;
  className?: string;
  effect?: "slide-up" | "fade" | "scale";
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "fit-content", 
  delay = 0, 
  threshold = 0.1,
  className = "",
  effect = "slide-up"
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can stop observing to save resources
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, [threshold]);

  const getEffectStyles = () => {
      const baseTransition = `all 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
      
      if (effect === "scale") {
          return {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1)" : "scale(0.95)",
              transition: baseTransition
          };
      }
      if (effect === "fade") {
        return {
            opacity: isVisible ? 1 : 0,
            transition: baseTransition
        };
    }
      // Default slide-up
      return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(50px)",
          transition: baseTransition
      };
  };

  return (
    <div ref={ref} style={{ width, ...getEffectStyles() }} className={className}>
      {children}
    </div>
  );
};

// Component for splitting text into words and animating them
export const StaggerText: React.FC<{ text: string, className?: string, delay?: number }> = ({ text, className = "", delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDone, setIsDone] = useState(false);
  
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (ref.current) observer.unobserve(ref.current);
          }
        },{ threshold: 0.1 });
  
      if (ref.current) observer.observe(ref.current);
      return () => { if (ref.current) observer.disconnect(); };
    }, []);

    // Timer to remove overflow:hidden after animation to prevent clipping of descenders/ascenders
    useEffect(() => {
        if (isVisible) {
            const wordCount = text.split(" ").length;
            // 0.8s animation duration + stagger delays + buffer
            const duration = (0.8 + (wordCount * 0.05) + delay + 0.2) * 1000;
            const timer = setTimeout(() => {
                setIsDone(true);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, text, delay]);

    const words = text.split(" ");

    return (
        <div 
            ref={ref} 
            className={`${className} ${isVisible ? 'stagger-visible' : ''}`} 
            style={{ 
                // Only hide overflow during animation. 
                // Add padding/negative margin to expand the clipping box slightly for large glyphs/swashes.
                overflow: isDone ? 'visible' : 'hidden',
                paddingTop: '0.2em',
                paddingBottom: '0.2em',
                marginTop: '-0.2em',
                marginBottom: '-0.2em'
            }}
        >
            {words.map((word, i) => (
                <span 
                    key={i} 
                    className="stagger-word inline-block mr-[0.25em]" 
                    style={{ transitionDelay: `${delay + (i * 0.05)}s` }}
                >
                    {word}
                </span>
            ))}
        </div>
    );
};
