import { useEffect, useRef, useState } from "react";

export default function ParticleHeroBackground() {
  const canvasRef = useRef(null);
  const [isGoldMode, setIsGoldMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;

    function createParticle(randomY = false) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 60,
        length: Math.random() * 3 + 1,
        speed: Math.random() * 0.28 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      const bounds = container.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const particleCount = Math.min(150, Math.max(42, Math.floor((width * height) / 8500)));
      particles = Array.from({ length: particleCount }, () => createParticle(true));
    }

    function draw(timestamp = 0) {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        const shimmer = reducedMotion ? 1 : 0.7 + Math.sin(timestamp / 900 + particle.phase) * 0.3;
        const color = isGoldMode ? "251, 191, 36" : "178, 245, 229";
        context.fillStyle = `rgba(${color}, ${particle.opacity * shimmer})`;
        context.fillRect(particle.x, particle.y, 1, particle.length);

        if (!reducedMotion) {
          particle.y -= particle.speed;
          particle.x += Math.sin(timestamp / 1500 + index) * 0.025;
          if (particle.y < -particle.length) {
            Object.assign(particle, createParticle());
          }
        }
      });

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    draw();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isGoldMode]);

  return (
    <div className={`particle-hero-background${isGoldMode ? " gold-mode" : ""}`}>
      <button
        className="particle-color-switch"
        type="button"
        aria-label={isGoldMode ? "Use teal hero lights" : "Use gold hero lights"}
        aria-pressed={isGoldMode}
        onClick={() => setIsGoldMode((current) => !current)}
      >
        <span aria-hidden="true" />
      </button>
      <div className="particle-spotlight particle-spotlight-left" />
      <div className="particle-spotlight particle-spotlight-center" />
      <div className="particle-spotlight particle-spotlight-right" />
      <div className="particle-accent-lines" />
      <canvas ref={canvasRef} />
    </div>
  );
}
