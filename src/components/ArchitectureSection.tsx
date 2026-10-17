import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, Handle, Position, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Check, CircleDashed, List, MapPin, Network } from "lucide-react";
import { PHASES, type ArchNode, type BuildPlan, type PhaseKey } from "@/lib/plan-schema";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Status = "done" | "current" | "upcoming";

type NodeData = { arch: ArchNode; status: Status; [key: string]: unknown };

const ROLE_LABEL: Record<ArchNode["role"], string> = {
  client: "Client",
  service: "Service",
  data: "Data",
  external: "External",
  operations: "Operations",
};

function ArchCard({ data }: NodeProps<Node<NodeData>>) {
  const { arch, status } = data;
  return (
    <div
      className={cn(
        "relative w-56 rounded-2xl border-2 bg-card px-4 py-3 text-left shadow-soft transition-all",
        !arch.required && "border-dashed",
        status === "done" && "border-success",
        status === "current" && "arch-pulse border-primary",
        status === "upcoming" && "opacity-55 grayscale",
      )}
    >
      {status === "current" && (
        <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap text-primary-foreground shadow-lift">
          <MapPin className="size-3" /> You are here
        </div>
      )}
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-muted-foreground/50" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          {arch.label} · {ROLE_LABEL[arch.role]}
          {!arch.required && " · Optional"}
        </span>
        {status === "done" && (
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="size-3" />
          </span>
        )}
      </div>
      <div className="mt-1 font-display text-base leading-tight font-semibold">{arch.name}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{arch.techName}</div>
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-muted-foreground/50" />
    </div>
  );
}

const nodeTypes = { arch: ArchCard };

const PHASE_SENTENCES: Record<number, { done: string; next: string }> = {
  1: { done: "", next: "First, you're agreeing the plan for what we're making." },
  2: { done: "You've read the plan.", next: "You're setting up your tools — the builder and the assistant." },
  3: { done: "Your tools are ready.", next: "You're building the website people will see and the data behind it." },
  4: { done: "Your app is built.", next: "You're saving every version safely to GitHub." },
  5: { done: "Your work is safe on GitHub.", next: "You're putting it on the internet for everyone." },
};

export function ArchitectureSection({
  plan,
  done,
  onGoToPhase,
}: {
  plan: BuildPlan;
  done: Set<string>;
  onGoToPhase: (phase: PhaseKey) => void;
}) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ArchNode | null>(null);
  const [view, setView] = useState<"diagram" | "list">("diagram");
  const arch = plan.architecture;

  // Completion of each phase 1–5 from real step progress
  const phaseComplete = useMemo(() => {
    const lists: Record<number, string[]> = {
      2: plan.setup.steps.map((s) => s.id),
      3: plan.build.prompts.map((p) => p.id),
      4: plan.github.steps.map((s) => s.id),
      5: plan.launch.steps.map((s) => s.id),
    };
    return (p: number) => {
      if (p === 1) return done.has("plan-read");
      const ids = lists[p] ?? [];
      return ids.length > 0 && ids.every((id) => done.has(id));
    };
  }, [plan, done]);

  const currentPhase = useMemo(() => {
    for (let p = 1; p <= 5; p++) if (!phaseComplete(p)) return p;
    return 6; // everything done
  }, [phaseComplete]);

  const statusOf = (node: ArchNode): Status => {
    if (phaseComplete(node.phase)) return "done";
    return node.phase === currentPhase ? "current" : "upcoming";
  };

  const sentence =
    currentPhase > 5
      ? "Everything is built and live — the whole map is yours. 🎉"
      : `${PHASE_SENTENCES[currentPhase]?.done ?? ""} ${PHASE_SENTENCES[currentPhase]?.next ?? ""}`.trim();

  const { nodes, edges } = useMemo(() => {
    // Left-to-right columns by phase, stacked vertically within a phase
    const byPhase = new Map<number, ArchNode[]>();
    for (const n of arch.nodes) {
      const list = byPhase.get(n.phase) ?? [];
      list.push(n);
      byPhase.set(n.phase, list);
    }
    const nodes: Node<NodeData>[] = [];
    for (const [phase, list] of byPhase) {
      list.forEach((n, i) => {
        nodes.push({
          id: n.id,
          type: "arch",
          position: { x: (phase - 1) * 300, y: i * 150 + ((phase % 2) * 60) },
          data: { arch: n, status: statusOf(n) },
        });
      });
    }
    const edges: Edge[] = arch.edges.map((e, i) => ({
      id: `e${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      labelStyle: { fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" },
      labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
      style: { stroke: "var(--muted-foreground)", strokeOpacity: 0.5 },
      animated: false,
    }));
    return { nodes, edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arch, currentPhase, done]);

  const goTo = (node: ArchNode) => {
    setSelected(null);
    const target = PHASES[node.phase - 1];
    if (target) onGoToPhase(target.key);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold tracking-widest text-primary uppercase">The map</div>
        <h2 className="mt-1 text-3xl sm:text-4xl">How the pieces fit</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {sentence} Click any piece to see what it does and why your app needs it. Dashed borders are optional extras.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-full border bg-muted p-1 w-fit">
        <button
          onClick={() => setView("diagram")}
          aria-pressed={view === "diagram"}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors",
            view === "diagram" ? "bg-card font-medium shadow-soft" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Network className="size-4" /> Diagram
        </button>
        <button
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors",
            view === "list" ? "bg-card font-medium shadow-soft" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="size-4" /> List view
        </button>
      </div>

      {view === "diagram" ? (
        <div className="h-[480px] overflow-hidden rounded-2xl border bg-card shadow-soft">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onNodeClick={(_, node) => setSelected((node.data as NodeData).arch)}
          >
            <Background gap={22} size={1} color="var(--border)" />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
        </div>
      ) : (
        <ol className="space-y-3">
          {arch.nodes.map((n) => {
            const status = statusOf(n);
            return (
              <li key={n.id}>
                <button
                  onClick={() => setSelected(n)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border-2 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/50",
                    !n.required && "border-dashed",
                    status === "done" && "border-success",
                    status === "current" && "border-primary",
                    status === "upcoming" && "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
                      status === "done" && "bg-success text-success-foreground",
                      status === "current" && "bg-primary text-primary-foreground",
                      status === "upcoming" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {status === "done" ? <Check className="size-4" /> : status === "current" ? <MapPin className="size-4" /> : <CircleDashed className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      {n.label} · {ROLE_LABEL[n.role]}
                      {!n.required && " · Optional"}
                    </span>
                    <span className="mt-0.5 block font-display text-lg font-semibold">{n.name}</span>
                    <span className="block text-sm text-muted-foreground">{n.techName} — {n.purpose}</span>
                    <span className="mt-1 block text-xs font-medium">
                      {status === "done" ? "✓ Done" : status === "current" ? "📍 You are here" : "Coming up"} · Phase {n.phase} · {n.cost}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b p-5">
                <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {selected.label} · {ROLE_LABEL[selected.role]} · {selected.required ? "Required" : "Optional"}
                </div>
                <SheetTitle className="font-display text-2xl">{selected.name}</SheetTitle>
                <SheetDescription>{selected.techName}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 p-5 text-sm">
                <div>
                  <div className="font-semibold">What it is</div>
                  <p className="mt-1 text-muted-foreground">{selected.purpose}</p>
                </div>
                <div>
                  <div className="font-semibold">How it connects</div>
                  <p className="mt-1 text-muted-foreground">{selected.connects}</p>
                </div>
                <div>
                  <div className="font-semibold">What needs to exist first</div>
                  <p className="mt-1 text-muted-foreground">{selected.prerequisites}</p>
                </div>
                <div>
                  <div className="font-semibold">Other options</div>
                  <p className="mt-1 text-muted-foreground">{selected.alternatives}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl bg-muted p-3">
                    <div className="text-xs text-muted-foreground">Cost</div>
                    <div className="font-mono font-semibold">{selected.cost}</div>
                  </div>
                  <div className="flex-1 rounded-xl bg-muted p-3">
                    <div className="text-xs text-muted-foreground">You build it in</div>
                    <div className="font-semibold">Phase {selected.phase}: {PHASES[selected.phase - 1]?.label}</div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => goTo(selected)}>
                  Go to this step →
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
