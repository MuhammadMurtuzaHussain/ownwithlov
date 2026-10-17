import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Circle, Terminal } from "lucide-react";
import demo from "@/lib/demo-plan.json";
import { PHASES, totalYearlyCost } from "@/lib/plan-schema";
import { cn } from "@/lib/utils";

export function PlanPreview() {
  const step = demo.setup.steps[3];
  return (
    <Link to="/demo" aria-label="Open the Lotus Booking example plan" className="block w-full rounded-lg border bg-card text-card-foreground shadow-lift transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
        <span className="font-display text-xl">Ownable <span className="ml-2 font-sans text-xs text-muted-foreground">Example plan</span></span>
        <ArrowUpRight className="size-5 text-primary" aria-hidden />
      </div>
      <div className="px-6 py-5">
        <h2 className="text-2xl">{demo.title.split(" — ")[0]}</h2>
        <p className="mt-1 text-sm text-muted-foreground">A booking app for a local yoga studio</p>
        <ol className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-b pb-5 text-sm">
          {PHASES.map((phase, i) => (
            <li key={phase.key} className={cn("flex items-center gap-1.5", i === 1 ? "font-semibold text-primary" : "text-muted-foreground")}>
              {i === 0 ? <Check className="size-4 text-success" aria-label="Complete" /> : <span className={cn("grid size-5 place-items-center rounded-full font-mono text-xs", i === 1 && "bg-primary text-primary-foreground")}>{i + 1}</span>}
              {phase.label}
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary">
          <Circle className="size-2.5 fill-current" aria-hidden /> YOU ARE HERE · SET UP
        </div>
        <h3 className="mt-2 text-xl">{step?.title}</h3>
        <p className="mt-2 text-sm leading-relaxed">{step?.explain}</p>
        <div className="mt-4 overflow-hidden rounded-md bg-terminal p-4 text-terminal-foreground">
          <div className="mb-2 flex items-center gap-2 text-xs text-terminal-muted"><Terminal className="size-3.5" aria-hidden /> Terminal</div>
          <code className="block break-words font-mono text-sm leading-relaxed">{step?.command}</code>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-success"><Check className="size-4 shrink-0" aria-hidden /> Expected: {step?.expected}</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/40 px-6 py-4">
        <div><span className="text-xs text-muted-foreground">Launch cost</span><div className="font-display text-2xl">€{totalYearlyCost(demo)}<span className="font-sans text-sm text-muted-foreground"> / year</span></div></div>
        <span className="flex items-center gap-2 text-sm font-semibold text-primary">Explore the plan <ArrowUpRight className="size-4" aria-hidden /></span>
      </div>
    </Link>
  );
}