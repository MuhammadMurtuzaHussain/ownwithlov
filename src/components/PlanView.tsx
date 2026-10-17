import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Cpu, GitBranch, Hammer, Map as MapIcon, Rocket, Star } from "lucide-react";
import { toast } from "sonner";
import { PHASES, allStepIds, type BuildPlan, type PhaseKey } from "@/lib/plan-schema";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TerminalStep } from "./TerminalStep";
import { CostPanel } from "./CostPanel";
import { HelpChat, type HelpContext } from "./HelpChat";
import { cn } from "@/lib/utils";

const ICONS: Record<PhaseKey, typeof MapIcon> = { plan: MapIcon, setup: Cpu, build: Hammer, github: GitBranch, launch: Rocket };

export function PlanView({ plan, planId, isDemo }: { plan: BuildPlan; planId: string; isDemo: boolean }) {
  const { session } = useAuth();
  const [phase, setPhase] = useState<PhaseKey>("plan");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [help, setHelp] = useState<HelpContext>(null);
  const useDb = !!session && !isDemo;
  const storageKey = `ownable-progress-${planId}`;

  useEffect(() => {
    if (useDb) {
      supabase
        .from("step_progress")
        .select("step_id, done")
        .eq("plan_id", planId)
        .then(({ data }) => setDone(new Set((data ?? []).filter((r) => r.done).map((r) => r.step_id))));
    } else {
      try {
        setDone(new Set(JSON.parse(localStorage.getItem(storageKey) ?? "[]")));
      } catch {
        /* ignore */
      }
    }
  }, [useDb, planId, storageKey]);

  const toggle = useCallback(
    async (stepId: string, value: boolean) => {
      setDone((prev) => {
        const next = new Set(prev);
        if (value) next.add(stepId);
        else next.delete(stepId);
        if (!useDb) localStorage.setItem(storageKey, JSON.stringify([...next]));
        return next;
      });
      if (useDb && session) {
        const { error } = await supabase
          .from("step_progress")
          .upsert(
            { user_id: session.user.id, plan_id: planId, step_id: stepId, done: value, updated_at: new Date().toISOString() },
            { onConflict: "user_id,plan_id,step_id" },
          );
        if (error) toast.error("Couldn't save your progress.");
      }
    },
    [useDb, session, planId, storageKey],
  );

  const ids = useMemo(() => allStepIds(plan), [plan]);
  const phaseProgress = (k: PhaseKey) => {
    if (k === "plan") return done.has("plan-read") ? 1 : 0;
    const list = ids[k];
    return list.length ? list.filter((id) => done.has(id)).length / list.length : 0;
  };
  const overall = PHASES.reduce((s, p) => s + phaseProgress(p.key), 0) / PHASES.length;
  const theme = PHASES.find((p) => p.key === phase)!.theme;

  const stepProps = (s: { id: string; title: string; explain: string; command: string; expected: string }, i: number, label?: string) => ({
    index: i + 1,
    title: s.title,
    explain: s.explain,
    command: s.command,
    expected: s.expected,
    label,
    done: done.has(s.id),
    onToggle: (v: boolean) => toggle(s.id, v),
    onHelp: () => setHelp({ title: s.title, detail: `Phase: ${phase}\nWhat it does: ${s.explain}\nCommand: ${s.command}\nExpected: ${s.expected}\nUser's setup: see plan "${plan.title}"` }),
  });

  return (
    <div className={cn(theme, "min-h-screen bg-background text-foreground transition-colors duration-500")}>
      {/* Progress across phases */}
      <div className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate pr-4 font-medium text-foreground">{plan.title}</span>
            <span className="shrink-0">{Math.round(overall * 100)}% complete</span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {PHASES.map((p) => (
              <div key={p.key} className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${phaseProgress(p.key) * 100}%` }} />
              </div>
            ))}
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {PHASES.map((p, i) => {
              const Icon = ICONS[p.key];
              const complete = phaseProgress(p.key) === 1;
              return (
                <button
                  key={p.key}
                  onClick={() => setPhase(p.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    phase === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
                  <span className="hidden sm:inline">{i + 1}.</span> {p.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_300px]">
        <div className="order-2 lg:order-1">
          <div key={phase} className="phase-enter space-y-6">
            {phase === "plan" && <PlanPhase plan={plan} read={done.has("plan-read")} onRead={() => toggle("plan-read", true)} onNext={() => setPhase("setup")} />}

            {phase === "setup" && (
              <>
                <PhaseIntro n={2} title="Set up your workshop" body="We'll install a few free tools, once. Tick each step off as you go — your progress is saved." />
                <div className="rounded-2xl border bg-accent p-5 text-sm text-accent-foreground">
                  <div className="mb-1 font-semibold">Your AI model</div>
                  {plan.setup.modelAdvice}
                </div>
                {plan.setup.steps.map((s, i) => <TerminalStep key={s.id} {...stepProps(s, i)} />)}
                <NextButton onClick={() => setPhase("build")} label="Next: start building" />
              </>
            )}

            {phase === "build" && (
              <>
                <PhaseIntro n={3} title="Your coding space" body={plan.build.intro} />
                {plan.build.prompts.map((p, i) => (
                  <div key={p.id} className="space-y-2">
                    <p className="pl-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Why this step: </span>{p.why}</p>
                    <TerminalStep {...stepProps({ id: p.id, title: p.title, explain: "Paste this into your coding agent.", command: p.prompt, expected: p.expected }, i, "prompt → coding agent")} />
                  </div>
                ))}
                <NextButton onClick={() => setPhase("github")} label="Next: save it safely" />
              </>
            )}

            {phase === "github" && (
              <>
                <PhaseIntro n={4} title="Save to GitHub" body="Before we go further, let's make sure your work can never be lost." />
                <div className="grid gap-3 sm:grid-cols-3">
                  {plan.github.explainer.map((e, i) => (
                    <div key={i} className="rounded-2xl border bg-card p-4 text-sm shadow-soft">{e}</div>
                  ))}
                </div>
                {plan.github.steps.map((s, i) => <TerminalStep key={s.id} {...stepProps(s, i)} />)}
                <NextButton onClick={() => setPhase("launch")} label="Next: launch it" />
              </>
            )}

            {phase === "launch" && <LaunchPhase plan={plan} stepProps={stepProps} />}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-36">
            <CostPanel plan={plan} />
            {isDemo && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                This is an example plan. Your ticks are saved in this browser only.
              </p>
            )}
          </div>
        </div>
      </div>

      <HelpChat ctx={help} onClose={() => setHelp(null)} planId={isDemo ? null : planId} />
    </div>
  );
}

function PhaseIntro({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-semibold tracking-widest text-primary uppercase">Phase {n}</div>
      <h2 className="mt-1 text-3xl sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{body}</p>
    </div>
  );
}

function NextButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={() => { onClick(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full rounded-2xl border border-dashed p-4 text-sm font-medium text-primary transition-colors hover:bg-muted">
      {label} →
    </button>
  );
}

function PlanPhase({ plan, read, onRead, onNext }: { plan: BuildPlan; read: boolean; onRead: () => void; onNext: () => void }) {
  return (
    <>
      <PhaseIntro n={1} title="The plan" body="Before any code, let's agree on what we're making and why. Read it through — you can always come back." />
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <h3 className="text-2xl">{plan.title}</h3>
          <p className="mt-3 leading-relaxed">{plan.summary}</p>
          <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">For: </span>{plan.audience}</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h4 className="font-sans font-semibold">Core features</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2"><Star className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h4 className="font-sans font-semibold">How someone uses it</h4>
          <ol className="mt-3 space-y-3 text-sm">
            {plan.userFlow.map((f, i) => (
              <li key={i} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent font-mono text-xs text-accent-foreground">{i + 1}</span>{f}</li>
            ))}
          </ol>
        </div>
      </div>
      <div>
        <h4 className="font-sans font-semibold">The tools we'll use — and why</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {plan.stack.map((s) => (
            <div key={s.name} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="text-xs text-muted-foreground">{s.role}</div>
              <div className="font-display text-lg">{s.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.why}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => { onRead(); onNext(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="w-full rounded-2xl bg-primary p-4 font-medium text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
      >
        {read ? "Continue to set up →" : "Looks good — let's set up →"}
      </button>
    </>
  );
}

function LaunchPhase({ plan, stepProps }: { plan: BuildPlan; stepProps: (s: BuildPlan["launch"]["steps"][number], i: number) => React.ComponentProps<typeof TerminalStep> }) {
  const groups = [...new Set(plan.launch.options.map((o) => o.category))];
  return (
    <>
      <PhaseIntro n={5} title="Launch day 🎉" body="Time to put it on the internet. Here's how the options compare for you." />
      {groups.map((g) => (
        <div key={g} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="border-b bg-muted px-5 py-3 font-semibold">{g}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="px-5 py-2 font-medium">Option</th><th className="px-3 py-2 font-medium">Free tier</th><th className="px-3 py-2 font-medium">Cost</th><th className="px-5 py-2 font-medium">Best for</th></tr>
              </thead>
              <tbody>
                {plan.launch.options.filter((o) => o.category === g).map((o) => (
                  <tr key={o.name} className={cn("border-t", o.recommended && "bg-accent/60")}>
                    <td className="px-5 py-3 font-medium">
                      {o.name}
                      {o.recommended && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">Our pick</span>}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{o.freeTier}</td>
                    <td className="px-3 py-3 font-mono text-xs">{o.cost}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <div className="rounded-2xl border-2 border-primary/40 bg-card p-5">
        <div className="text-xs font-semibold tracking-wider text-primary uppercase">Why we recommend this</div>
        <p className="mt-1">{plan.launch.recommendation}</p>
      </div>
      {plan.launch.steps.map((s, i) => <TerminalStep key={s.id} {...stepProps(s, i)} label="steps" />)}
    </>
  );
}
