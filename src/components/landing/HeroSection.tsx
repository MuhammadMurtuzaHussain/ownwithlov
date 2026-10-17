// Adapted from 21st.dev "Hero Section" by ravikatiyar162
import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  actions: React.ReactNode;
  preview: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

const container: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const item: Variants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } } };

export function HeroSection({ eyebrow, title, subtitle, actions, preview, footer, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className={cn("relative grid w-full items-center gap-10 py-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12", className)}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={container}
    >
      <div className="flex min-w-0 flex-col justify-between gap-10">
        <div>
          <motion.p variants={item} className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {eyebrow}
          </motion.p>
          <motion.h1 variants={item} className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            {title}
          </motion.h1>
          <motion.div variants={item} className="my-6 h-1 w-20 rounded-full bg-primary" />
          <motion.p variants={item} className="max-w-md text-lg text-muted-foreground">
            {subtitle}
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            {actions}
          </motion.div>
        </div>
        <motion.div variants={item}>{footer}</motion.div>
      </div>
      <motion.div
        className="mx-auto w-full min-w-0 max-w-lg"
        variants={item}
      >
        {preview}
      </motion.div>
    </motion.section>
  );
}
