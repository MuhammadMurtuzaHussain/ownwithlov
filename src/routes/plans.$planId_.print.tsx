import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { PHASES, planSchema, totalYearlyCost, type BuildPlan } from "@/lib/plan-schema";
import { useAuth } from "@/lib/auth";
import { toolLinks } from "@/lib/tool-links";

export const Route = createFileRoute("/plans/$planId_/print")({
  head: () => ({
    meta: [
      { title: "Printable build plan — ownwithlov" },
      { name: "description", content: "A large-print, paper-friendly copy of your ownwithlov build plan." },
      { property: "og:title", content: "Printable build plan — ownwithlov" },
      { property: "og:description", content: "A large-print, paper-friendly copy of your ownwithlov build plan." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintPage,
});

const printCss = (name: string) => `
@page { size: A4; margin: 18mm 16mm 20mm;
  @bottom-left { content: "${name}"; font: 10pt Figtree, sans-serif; color: #333; }
  @bottom-center { content: "Page " counter(page) " of " counter(pages); font: 10pt Figtree, sans-serif; color: #333; }
  @bottom-right { content: "Made with ownwithlov"; font: 10pt Figtree, sans-serif; color: #333; }
}
.print-doc { background: #fff; color: #111; font-size: 13pt; line-height: 1.6; }
.print-doc h1, .print-doc h2, .print-doc h3 { color: #000; line-height: 1.2; }
.print-doc section { break-before: page; }
.print-doc section:first-of-type { break-before: auto; }
.print-doc .avoid { break-inside: avoid; }
@media screen { .print-doc { max-width: 210mm; margin: 0 auto; padding: 16mm; box-shadow: 0 0 0 1px #ddd; } }
@media print { .no-print { display: none !important; } body { background: #fff !important; } }
`;

function PrintPage() {
  const { planId } = Route.useParams();
  const { session, loading } = useAuth();
  const { data, error } = useQuery({
    queryKey: ["plan-print", planId],
    enabled: !loading,
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("plan,is_demo").eq("id", planId).single();
      if (error) throw error;
      return { plan: planSchema.parse(data.plan), isDemo: data.is_demo as boolean };
    },
  });
  const [done, setDone] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (!data) return;
    if (session && !data.isDemo) {
      supabase.from("step_progress").select("step_id, done").eq("plan_id", planId)
        .then(({ data: rows }) => setDone(new Set((rows ?? []).filter((r) => r.done).map((r) => r.step_id))));
    } else {
      try { const raw = localStorage.getItem(`ownwithlov-progress-${planId}`) ?? localStorage.getItem(`ownable-progress-${planId}`); setDone(new Set(JSON.parse(raw ?? "[]"))); } catch { setDone(new Set()); }
    }
  }, [data, session, planId]);

  if (error) return <p className="p-10 text-center text-lg">We couldn't find that plan.</p>;
  if (!data || !done) return <p className="p-10 text-center text-lg">Getting your plan ready to print…</p>;
  return <PrintDoc plan={data.plan} done={done} planId={planId} isDemo={data.isDemo} />;
}

function PrintDoc({ plan, done, planId, isDemo }: { plan: BuildPlan; done: Set<string>; planId: string; isDemo: boolean }) {
  const cost = totalYearlyCost(plan);
  const links = useMemo(() => toolLinks(plan), [plan]);
  const lists: Record<number, string[]> = {
    2: plan.setup.steps.map((s) => s.id), 3: plan.build.prompts.map((p) => p.id),
    4: plan.github.steps.map((s) => s.id), 5: plan.launch.steps.map((s) => s.id),
  };
  const complete = (p: number) => (p === 1 ? done.has("plan-read") : (lists[p] ?? []).length > 0 && (lists[p] ?? []).every((id) => done.has(id)));
  let current = 6;
  for (let p = 1; p <= 5; p++) if (!complete(p)) { current = p; break; }
  const nameOf = new Map(plan.architecture.nodes.map((n) => [n.id, n.name]));
  const date = new Date().toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });

  const stepGroups = [
    { title: "Phase 2 · Set up your tools", items: plan.setup.steps.map((s) => ({ id: s.id, title: s.title, line: s.explain, block: s.command, expected: s.expected })) },
    { title: "Phase 3 · Build your app", items: plan.build.prompts.map((p) => ({ id: p.id, title: p.title, line: p.why, block: p.prompt, expected: p.expected })) },
    { title: "Phase 4 · Save to GitHub", items: plan.github.steps.map((s) => ({ id: s.id, title: s.title, line: s.explain, block: s.command, expected: s.expected })) },
    { title: "Phase 5 · Launch", items: plan.launch.steps.map((s) => ({ id: s.id, title: s.title, line: s.explain, block: s.command, expected: s.expected })) },
  ];

  return (
    <div className="min-h-screen bg-white py-8 print:py-0">
      <style>{printCss((plan.title.split(" — ")[0] ?? plan.title).replace(/["\\<>]/g, "").slice(0, 60))}</style>
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <Link to={isDemo ? "/demo" : "/plans/$planId"} params={{ planId }} className="text-lg underline">← Back to my plan</Link>
        <button onClick={() => window.print()} className="rounded-xl border-2 border-black px-5 py-2.5 text-lg font-semibold">
          Print or save as PDF
        </button>
      </div>

      <article className="print-doc">
        {/* 1. Cover */}
        <section className="flex min-h-[230mm] flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl border-2 border-black font-display text-2xl">o</span>
            <span className="font-display text-3xl">ownwithlov</span>
          </div>
          <div>
            <div className="text-base font-semibold tracking-widest uppercase">Your Build Plan</div>
            <h1 className="mt-3 text-[34pt]">{plan.title}</h1>
            <p className="mt-4 max-w-[150mm] text-[16pt]">{plan.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-5">
            <div><div className="text-sm font-semibold uppercase">Printed on</div><div className="text-[16pt]">{date}</div></div>
            <div><div className="text-sm font-semibold uppercase">Your launch cost</div><div className="text-[20pt] font-bold">€{cost}/year</div></div>
          </div>
        </section>

        {/* 2. Journey */}
        <section>
          <h2 className="text-[24pt]">Your journey</h2>
          <p className="mt-2">Five phases, one after the other. {current > 5 ? "You've finished them all!" : "The arrow shows where you are now."}</p>
          <ol className="avoid mt-10 grid grid-cols-5 gap-2">
            {PHASES.map((p, i) => {
              const n = i + 1;
              const here = n === current;
              return (
                <li key={p.key} className="relative text-center">
                  {here && <div className="mb-2 text-sm font-bold">▼ You are here</div>}
                  {!here && <div className="mb-2 text-sm">&nbsp;</div>}
                  <div className="flex items-center">
                    <div className={`h-1 flex-1 ${i === 0 ? "" : "bg-black"}`} />
                    <div className={`grid size-12 place-items-center rounded-full border-2 border-black text-[16pt] font-bold ${here ? "border-[4px]" : ""}`}>
                      {complete(n) ? "✓" : n}
                    </div>
                    <div className={`h-1 flex-1 ${i === 4 ? "" : "bg-black"}`} />
                  </div>
                  <div className="mt-2 font-semibold">{p.label}</div>
                  <div className="text-sm">{complete(n) ? "Done" : here ? "In progress" : "Coming up"}</div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* 3. Architecture */}
        <section>
          <h2 className="text-[24pt]">How your app fits together</h2>
          <p className="mt-2">Each box is one piece of your app. Read from top to bottom, in the order you'll build them. Dashed boxes are optional.</p>
          <div className="avoid mt-6 space-y-2">
            {[...new Set(plan.architecture.nodes.map((n) => n.phase))].sort().map((ph, idx) => (
              <div key={ph}>
                {idx > 0 && <div className="py-1 text-center text-[18pt] leading-none">↓</div>}
                <div className="text-sm font-semibold uppercase">Phase {ph} · {PHASES[ph - 1]?.label}</div>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  {plan.architecture.nodes.filter((n) => n.phase === ph).map((n) => (
                    <div key={n.id} className={`rounded-lg border-2 border-black p-3 ${n.required ? "" : "border-dashed"}`}>
                      <div className="text-xs font-semibold uppercase">{n.label}</div>
                      <div className="text-[14pt] font-bold">{n.name}</div>
                      <div className="text-[12pt]">{n.techName}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <h3 className="mt-8 text-[16pt]">What talks to what</h3>
          <ul className="mt-2 list-disc pl-6">
            {plan.architecture.edges.map((e, i) => (
              <li key={i}><b>{nameOf.get(e.from)}</b> → <b>{nameOf.get(e.to)}</b>: {e.label}</li>
            ))}
          </ul>
          <h3 className="mt-8 text-[16pt]">Each part, in plain English</h3>
          <dl className="mt-2 space-y-4">
            {plan.architecture.nodes.map((n) => (
              <div key={n.id} className="avoid">
                <dt className="font-bold">{n.name} <span className="font-normal">({n.techName}{n.required ? "" : ", optional"} · {n.cost})</span></dt>
                <dd>{n.purpose}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 4. Steps */}
        <section>
          <h2 className="text-[24pt]">Step by step</h2>
          <p className="mt-2">Tick each box with a pen when you finish the step. Type commands exactly as shown in the boxes.</p>
          {stepGroups.map((g) => (
            <div key={g.title} className="mt-8">
              <h3 className="text-[18pt]">{g.title}</h3>
              <ol className="mt-3 space-y-5">
                {g.items.map((s, i) => (
                  <li key={s.id} className="avoid flex gap-3">
                    <span className="mt-1 grid size-6 shrink-0 place-items-center border-2 border-black text-sm font-bold">{done.has(s.id) ? "✓" : ""}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14pt] font-bold">{i + 1}. {s.title}</div>
                      <p>{s.line}</p>
                      <pre className="mt-2 rounded-md border-2 border-black bg-white p-3 font-mono text-[11.5pt] leading-relaxed whitespace-pre-wrap break-words">{s.block}</pre>
                      <p className="mt-1"><b>You should see:</b> {s.expected}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        {/* 5. Costs */}
        <section>
          <h2 className="text-[24pt]">Your costs</h2>
          <table className="avoid mt-4 w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-black"><th className="py-2 pr-3">What</th><th className="py-2 pr-3">Cost</th><th className="py-2">When this might start costing money</th></tr>
            </thead>
            <tbody>
              {plan.costs.map((c) => (
                <tr key={c.item} className="border-b border-black/40 align-top">
                  <td className="py-2 pr-3 font-semibold">{c.item}{c.optional && <span className="font-normal"> (optional)</span>}</td>
                  <td className="py-2 pr-3 font-mono whitespace-nowrap">{c.label}</td>
                  <td className="py-2">{c.note}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-black font-bold"><td className="py-2">Total</td><td className="py-2 font-mono">€{cost}/year</td><td /></tr>
            </tbody>
          </table>
        </section>

        {/* 6. Links */}
        <section>
          <h2 className="text-[24pt]">Useful links</h2>
          <p className="mt-2">Point your phone's camera at a code to open the official website.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {links.map((l) => (
              <div key={l.name} className="avoid flex items-center gap-4 rounded-lg border-2 border-black p-4">
                <QRCodeSVG value={l.url} size={96} level="M" bgColor="#ffffff" fgColor="#000000" />
                <div className="min-w-0">
                  <div className="text-[14pt] font-bold">{l.name}</div>
                  <div className="text-[12pt]">{l.what}</div>
                  <div className="mt-1 font-mono text-[11pt] break-all">{l.url.replace("https://", "")}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
