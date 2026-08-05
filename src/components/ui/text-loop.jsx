import React, { useEffect, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
} from "motion/react";

export default function TextLoop({
  staticText = "Find Part-Time Jobs",
  rotatingTexts = ["Near You", "Smarter", "Faster", "Securely", "Limitlessly"],
  className = "",
  interval = 2500,
  transition = { duration: 0.45, ease: "easeInOut" },
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [rotatingTexts.length, interval]);

  return (
    <LazyMotion features={domAnimation}>
      <span className={`text-loop-container ${className}`} style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem" }}>
        <span style={{
          color: "var(--text, #0f172a)",
          fontWeight: 900,
          fontSize: "inherit",
          lineHeight: 1.15
        }}>
          {staticText}
        </span>
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            <m.span
              key={rotatingTexts[index]}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={transition}
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(124, 58, 237, 0.18) 100%)",
                border: "1px solid rgba(37, 99, 235, 0.25)",
                lineHeight: 1.15
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "inherit",
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}
              >
                {rotatingTexts[index]}
              </span>
            </m.span>
          </AnimatePresence>
        </span>
      </span>
    </LazyMotion>
  );
}
