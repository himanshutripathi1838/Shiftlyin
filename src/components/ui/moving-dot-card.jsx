import React, { useState, useEffect, useRef } from 'react';
import '../../styles/DotCard.css';

export default function DotCard({
  target = 5000,
  duration = 2200,
  label = "Views",
  suffix = "+",
  color = "#2563eb"
}) {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Trigger count-up animation only when scrolled into view
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Smooth ease-out count-up animation from 0 to target
  useEffect(() => {
    if (!hasStarted) return;

    const end = Number(target) || 0;
    if (end <= 0) {
      setCount(end);
      return;
    }

    const fps = 60;
    const totalFrames = Math.round((duration / 1000) * fps);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Smooth ease-out cubic formula so it slows down gently near the target number
      const progress = frame / totalFrames;
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.min(Math.round(end * easeOutCubic), end);

      setCount(currentCount);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  const formatDisplay = (num) => {
    return `${num.toLocaleString()}${suffix}`;
  };

  return (
    <div ref={cardRef} className="dot-card-outer" style={{ '--accent-glow': color }}>
      <div className="dot-card-ray"></div>
      <div className="dot-card-inner">
        <div className="dot-card-dot"></div>
        <div className="dot-card-text" style={{ color: color }}>
          {formatDisplay(count)}
        </div>
        <div className="dot-card-label">{label}</div>
      </div>
    </div>
  );
}

const DemoOne = () => {
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", padding: "40px" }}>
      <DotCard target={5000} label="Students" color="#2563eb" />
    </div>
  );
};

export { DemoOne };
