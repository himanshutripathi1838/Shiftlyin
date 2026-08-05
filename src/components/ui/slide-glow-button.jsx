import React from "react";
import { cn } from "@/lib/utils";

export function Component({ text = "READY TO START YOUR JOURNEY?", className = "" }) {
  const formattedText = `\u00A0${text}\u00A0`;
  return (
    <button type="button" className={cn("slide-glow-btn", className)} data-text={text}>
      <span className="actual-text">{formattedText}</span>
      <span aria-hidden="true" className="hover-text">{formattedText}</span>
    </button>
  );
}

export { Component as SlideGlowButton };
export default Component;
