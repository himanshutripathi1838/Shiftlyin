import React, { useState, useEffect } from 'react';
import '../../styles/DotCard.css';

export default function DotCard({
  target = 777000,
  duration = 2000,
  label = "Views",
  suffix = "+",
  color = "#2563eb"
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) {
      setCount(end);
      return;
    }
    const stepTime = 40;
    const steps = duration / stepTime;
    const increment = Math.ceil(range / steps);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  const formatDisplay = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${suffix}`;
    }
    if (num >= 1000) {
      return `${num}${suffix}`;
    }
    return `${num}${suffix}`;
  };

  return (
    <div className="dot-card-outer" style={{ '--accent-glow': color }}>
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
