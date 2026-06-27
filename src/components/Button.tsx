"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children" | "className"> {
  variant?: "primary" | "ghost";
  children?: ReactNode;
  className?: string;
}

export default function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-medium tracking-wide transition-shadow overflow-hidden",
        variant === "primary" && "bg-white text-black shadow-glow-white hover:opacity-90",
        variant === "ghost" && "border border-white/20 text-white/80 hover:border-white/50 hover:text-white bg-white/[0.03]",
        className
      )}
      {...props}
    >
      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-full" />
      {children}
    </motion.button>
  );
}
