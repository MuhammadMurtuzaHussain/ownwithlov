import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { BuildPlan } from "@/lib/plan-schema";
import { totalYearlyCost } from "@/lib/plan-schema";
import { cn } from "@/lib/utils";

export function CostPanel({ plan }: { plan: BuildPlan }) {
  const [open, setOpen] = useState(false);
  const total = totalYearlyCost(plan);
  return (
    <aside className="rounded-2xl border bg-card p-5 shadow-soft">
      <button className="flex w-full items-center justify-between text-left lg:pointer-events-none" onClick={() => setOpen(!open)}>
        <div>
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Your launch cost</div>
          <div className="mt-1 font-display text-3xl">
            €{total}
            <span className="text-base text-muted-foreground">/year</span>
          </div>
        </div>
        <ChevronDown className={cn("size-5 text-muted-foreground transition-transform lg:hidden", open && "rotate-180")} />
      </button>
      <ul className={cn("mt-4 space-y-3 border-t pt-4", !open && "hidden lg:block")}>
        {plan.costs.map((c) => (
          <li key={c.item}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm">
                <span>
                  {c.item}
                  {c.optional && <span className="ml-1 text-xs text-muted-foreground">(optional)</span>}
                </span>
                <span className="font-mono text-xs">{c.label}</span>
              </summary>
              <p className="mt-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">When would this start costing money? </span>
                {c.note}
              </p>
            </details>
          </li>
        ))}
        <li className="pt-1 text-xs text-muted-foreground">Tap any line to see when it might cost money.</li>
      </ul>
    </aside>
  );
}
