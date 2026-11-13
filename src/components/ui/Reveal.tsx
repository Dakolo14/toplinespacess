"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Masked line reveal: each line slides up from behind its own clip when it enters the viewport.
export function Lines({ lines, delay = 0, className, as = "div" }: { lines: string[]; delay?: number; className?: string; as?: "div" | "h1" | "h2" | "h3" | "p" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial="h" whileInView="v" viewport={{ once: true, margin: "-8% 0px" }}>
      {lines.map((l, i) => (
        <span className="ln" key={i}>
          <motion.span
            variants={{ h: { y: "110%" }, v: { y: "0%", transition: { duration: 0.9, ease: EASE, delay: delay + 0.08 + i * 0.06 } } }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// Soft fade-up for blocks.
export function Fade({ delay = 0, y = 16, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    />
  );
}
