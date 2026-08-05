import React from "react";
import { cn } from "@/lib/utils";

export function Component({ text = "Ready to Start Your Journey?", className = "" }) {
  return (
    <h2 className={cn("slide-glow-heading", className)}>
      <span className="actual-text">{text}</span>
      <span aria-hidden="true" className="hover-text">{text}</span>
    </h2>
  );
}

export { Component as SlideGlowButton };
export default Component;
