import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

function GradualSpacing({
  text = "",
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className = "",
}) {
  return (
    <div className="flex justify-center space-x-1 flex-wrap">
      <AnimatePresence>
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            exit="hidden"
            variants={framerProps}
            transition={{ duration, delay: i * delayMultiple }}
            className={cn("drop-shadow-sm inline-block", className)}
          >
            {char === " " ? <span>&nbsp;</span> : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export { GradualSpacing };
export default GradualSpacing;
