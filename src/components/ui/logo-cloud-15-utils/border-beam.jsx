import * as React from "react";

export function BorderBeam({
  className = "",
  size = 100,
  duration = 8,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}) {
  return (
    <div
      style={{
        "--size": `${size}px`,
        "--duration": `${duration}s`,
        "--anchor": `${anchor}%`,
        "--border-width": `${borderWidth}px`,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `${delay}s`,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute inset-0 rounded-[inherit] [background:radial-gradient(var(--size)_circle_at_var(--anchor),var(--color-from)_0%,var(--color-to)_50%,transparent_100%)] [animation:border-beam_var(--duration)_linear_infinite] [animation-delay:var(--delay)]"
      />
    </div>
  );
}
