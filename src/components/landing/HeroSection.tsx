// Adapted from 21st.dev "Hero Section" by ravikatiyar162
import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  actions: React.ReactNode;
  image: string;
  imageAlt: string;
  footer: { label: string; value: string }[];
  badge?: React.ReactNode;
  className?: string;
};

const container: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const item: Variants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } } };

export function HeroSection({ eyebrow, title, subtitle, actions, image, imageAlt, footer, badge, className }: Props) {
  return (
    <motion.section
      className={cn("relative flex w-full flex-col overflow-hidden rounded-[2rem] border bg-card shadow-lift md:flex-row", className)}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <div className="flex w-full flex-col justify-between gap-10 p-8 md:w-3/5 md:p-12 lg:p-16">
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
        <motion.div variants={item} className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          {footer.map((f) => (
            <div key={f.label}>
              <div className="text-[11px] tracking-wider text-muted-foreground uppercase">{f.label}</div>
              <div className="font-display text-lg">{f.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div
        className="relative min-h-[300px] w-full md:min-h-full md:w-2/5"
        initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
        animate={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 0% 100%)" }}
        transition={{ duration: 1.2, ease: "circOut" }}
      >
        <img src={image} alt={imageAlt} className="absolute inset-0 size-full object-cover" />
        {badge && <div className="absolute right-5 bottom-5">{badge}</div>}
      </motion.div>
    </motion.section>
  );
}
