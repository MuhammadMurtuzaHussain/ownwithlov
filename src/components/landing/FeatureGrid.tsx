// Adapted from 21st.dev "Feature Grid Spotlight Cards" by mohammadshehadeh (MIT)
import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Feature = { icon: LucideIcon; title: string; body: string };

function CrossDecor({ position }: { position: "top-start" | "bottom-end" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={cn(
        "pointer-events-none absolute z-10 size-3.5 text-muted-foreground",
        position === "top-start" && "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
        position === "bottom-end" && "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
      )}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function FeatureCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group relative flex h-full flex-col gap-6 bg-card px-6 pt-8 pb-6",
        "bg-[radial-gradient(50%_80%_at_25%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_200px_at_var(--mx)_var(--my),color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="absolute -inset-y-4 -left-px w-px bg-border" />
      <div className="absolute -inset-y-4 -right-px w-px bg-border" />
      <div className="absolute -inset-x-4 -top-px h-px bg-border" />
      <div className="absolute -inset-x-4 -bottom-px h-px bg-border" />
      {children}
    </div>
  );
}

export function FeatureGrid({ eyebrow, title, body, features }: { eyebrow: string; title: string; body: string; features: Feature[] }) {
  return (
    <section className="flex w-full flex-col gap-12 py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Badge variant="outline" className="rounded-full bg-card/70 px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {eyebrow}
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{body}</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((f) => (
          <FeatureCard key={f.title}>
            <CrossDecor position="top-start" />
            <CrossDecor position="bottom-end" />
            <div className="relative z-10 flex w-fit items-center justify-center rounded-md border bg-muted/40 p-3 transition-colors duration-300 group-hover:border-primary/40">
              <f.icon aria-hidden className="size-5 stroke-[1.5] text-primary" />
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="text-xl">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          </FeatureCard>
        ))}
      </div>
    </section>
  );
}
