import React, { useEffect, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";

export default function TextLoop({
  staticText = "Shift",
  rotatingTexts = ["Smarter", "Faster", "Better", "Securely", "Limitlessly"],
  className,
  interval = 3000,
  transition = { duration: 0.8, ease: "easeInOut" },
  staticTextClassName,
  rotatingTextClassName,
  backgroundClassName,
  cursorClassName,
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
      <div
        className={cn(
          "flex flex-row items-center justify-start w-fit text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight",
          className
        )}
      >
        <span className={cn("mr-3 whitespace-nowrap", staticTextClassName)}>
          {staticText}
        </span>
        <div className="relative flex items-center">
          <AnimatePresence mode="wait">
            <m.div
              key={rotatingTexts[index]}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={transition}
              className="overflow-hidden whitespace-nowrap relative"
            >
              {/* Background gradient box */}
              <div
                className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-r from-transparent via-blue-200/30 to-blue-200",
                  "dark:from-transparent dark:via-blue-950/30 dark:to-blue-950/60",
                  backgroundClassName
                )}
              />
              <span
                className={cn(
                  "relative bg-clip-text text-transparent",
                  "bg-gradient-to-r from-blue-600 to-indigo-600",
                  "dark:bg-gradient-to-r from-blue-400 to-indigo-400 pr-1",
                  rotatingTextClassName
                )}
              >
                {rotatingTexts[index]}
              </span>
            </m.div>
          </AnimatePresence>
          {/* Cursor Line */}
          <m.div
            className={cn(
              "w-[3px] md:w-[4px] bg-blue-600 h-[1.10em] sm:h-[1em]",
              cursorClassName
            )}
            animate={{ opacity: [1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>
      </div>
    </LazyMotion>
  );
}
