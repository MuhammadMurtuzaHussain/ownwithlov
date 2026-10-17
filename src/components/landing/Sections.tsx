import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Cpu, GitBranch, GraduationCap, Hammer, Lightbulb, Map as MapIcon, Minus, Printer, QrCode, Rocket, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TerminalStep } from "@/components/TerminalStep";
import { CostPanel } from "@/components/CostPanel";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { planSchema } from "@/lib/plan-schema";
import demoJson from "@/lib/demo-plan.json";
import { Reveal } from "./Reveal";

const demo = planSchema.parse(demoJson);

export const PHASE_STEPS = [
  { icon: MapIcon, label: "Plan", line: "Agree what you're making, in plain English." },
  { icon: Cpu, label: "Set up", line: "Install a few free tools, once." },
  { icon: Hammer, label: "Build", line: "Guide an AI helper, one prompt at a time." },
  { icon: GitBranch, label: "Save to GitHub", line: "Keep every version safe — in your account." },
  { icon: Rocket, label: "Launch", line: "Put it online for everyone to use." },
];

function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <div className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</div>
      <h2 className="mt-2 text-4xl sm:text-5xl">{title}</h2>
      {body && <p className="mt-3 text-lg text-muted-foreground">{body}</p>}
    </Reveal>
  );
}

/** Animated thin line of the five phases, used under the hero. */
export function PhaseLine() {
  const reduce = useReducedMotion();
  return (
    <div aria-label="Five phases: Plan, Set up, Build, Save to GitHub, Launch">
      <div className="relative h-px w-full bg-border">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: reduce ? "100%" : "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.4, delay: 0.8, ease: "easeInOut" }}
        />
      </div>
      <ol className="mt-3 flex justify-between gap-2 text-xs text-muted-foreground">
        {PHASE_STEPS.map((p, i) => (
          <motion.li
            key={p.label}
            className="flex items-center gap-1.5"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 + i * 0.4 }}
          >
            <span className="font-mono text-primary">{i + 1}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function ProblemSection() {
  const rows = [
    ["Credits run out mid-build", "Open-source tools that never run out"],
    ["Hosting tied to the platform", "Your own GitHub and your own hosting"],
    ["Costs hard to predict", "Every euro shown upfront"],
  ];
  return (
    <section className="space-y-8">
      <Heading eyebrow="The problem" title="Great for a prototype. Then what?" body="AI builders are a brilliant way to start. Ownable is the next step — when you want something that's truly yours." />
      <Reveal>
        <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-soft md:grid-cols-2">
          <div className="p-8 md:p-10">
            <div className="font-display text-2xl text-muted-foreground">Typical AI builder</div>
            <ul className="mt-6 space-y-4">
              {rows.map(([a]) => (
                <li key={a} className="flex gap-3"><Minus className="mt-1 size-4 shrink-0 text-muted-foreground" />{a}</li>
              ))}
            </ul>
          </div>
          <div className="border-t bg-secondary/60 p-8 md:border-t-0 md:border-l md:p-10">
            <div className="font-display text-2xl text-primary">With Ownable</div>
            <ul className="mt-6 space-y-4">
              {rows.map(([, b]) => (
                <li key={b} className="flex gap-3 font-medium"><Check className="mt-1 size-4 shrink-0 text-success" />{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="space-y-10">
      <Heading eyebrow="How it works" title="Five phases, one at a time" />
      <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
        <div className="absolute top-6 bottom-6 left-6 w-px bg-border md:top-6 md:right-[10%] md:bottom-auto md:left-[10%] md:h-px md:w-auto" aria-hidden />
        {PHASE_STEPS.map((p, i) => (
          <motion.li
            key={p.label}
            className="relative flex gap-4 md:flex-col md:items-center md:text-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
          >
            <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 border-primary bg-card text-primary shadow-soft">
              <p.icon className="size-5" />
            </span>
            <div>
              <div className="font-mono text-xs text-muted-foreground">Phase {i + 1}</div>
              <div className="font-display text-xl">{p.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.line}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function SeeItInAction() {
  const [done, setDone] = useState(false);
  const step = demo.setup.steps[3] ?? demo.setup.steps[0]!;
  const progress = new Set(["plan-read", ...demo.setup.steps.map((s) => s.id)]);
  return (
    <section className="space-y-8">
      <Heading eyebrow="See it in action" title="The real thing, not a screenshot" body="These are the same pieces you'll use in your own plan. Try them." />
      <Reveal>
        <Tabs defaultValue="terminal" className="w-full">
          <TabsList className="h-auto flex-wrap rounded-full p-1">
            <TabsTrigger value="terminal" className="rounded-full px-4 py-1.5">Terminal steps</TabsTrigger>
            <TabsTrigger value="map" className="rounded-full px-4 py-1.5">Your map</TabsTrigger>
            <TabsTrigger value="cost" className="rounded-full px-4 py-1.5">Your costs</TabsTrigger>
          </TabsList>
          <div className="mt-5 rounded-[2rem] border bg-background/60 p-4 shadow-soft sm:p-8">
            <TabsContent value="terminal" className="mt-0">
              <TerminalStep index={4} title={step.title} explain={step.explain} command={step.command} expected={step.expected} done={done} onToggle={setDone} onHelp={() => {}} />
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              <ArchitectureSection plan={demo} done={progress} onGoToPhase={() => {}} />
            </TabsContent>
            <TabsContent value="cost" className="mt-0 max-w-md">
              <CostPanel plan={demo} />
            </TabsContent>
          </div>
        </Tabs>
      </Reveal>
    </section>
  );
}

export function Audience() {
  const cards = [
    { icon: Lightbulb, title: "Founders with an idea", body: "You know what you want to make. We'll show you how — without hiring a team." },
    { icon: Wallet, title: "People who've hit a credit wall", body: "Your prototype got you this far. Now move it onto tools that don't charge per prompt." },
    { icon: GraduationCap, title: "Learners who want real skills", body: "Use the same tools professionals use, and understand why each one is there." },
  ];
  return (
    <section className="space-y-8">
      <Heading eyebrow="Built for people who" title="Want to make something real" />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1}>
            <div className="h-full rounded-[1.5rem] border bg-card p-7 shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><c.icon className="size-5" /></span>
              <div className="mt-5 font-display text-2xl">{c.title}</div>
              <p className="mt-2 text-muted-foreground">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function PaperStrip() {
  return (
    <Reveal>
      <section className="flex flex-col items-start gap-6 rounded-[2rem] border border-dashed bg-card p-8 sm:flex-row sm:items-center md:p-10">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary"><Printer className="size-6" /></span>
        <div className="flex-1">
          <h2 className="text-3xl">Prefer paper?</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every plan prints as a large, clear booklet — tick boxes for each step, and a QR code for every tool so you can open it from your phone.
          </p>
        </div>
        <QrCode className="hidden size-16 text-muted-foreground sm:block" aria-hidden />
      </section>
    </Reveal>
  );
}

export function Faq() {
  const items: [string, string][] = [
    ["Do I need to know how to code?", "No. Ownable explains every step in plain English and tells you exactly what to type and what you should see. You'll pick up real skills along the way."],
    ["Is it really free?", "The tools are free and open source. The only likely cost is an optional web address (a domain), around €10–15 a year. Every cost is shown before you start."],
    ["What if my laptop is old?", "Tell us how much memory it has and we'll pick an AI model that fits. Most laptops from the last few years work fine."],
    ["What happens if I get stuck?", "Every step has a \"Something went wrong?\" button. Paste what you see and your guide explains what happened and what to try next."],
  ];
  return (
    <section className="space-y-8">
      <Heading eyebrow="Questions" title="Good questions" />
      <Reveal>
        <Accordion type="single" collapsible className="rounded-[1.5rem] border bg-card px-6 shadow-soft">
          {items.map(([q, a]) => (
            <AccordionItem key={q} value={q} className="last:border-b-0">
              <AccordionTrigger className="py-5 text-left font-display text-lg">{q}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

export function FinalCta({ to }: { to: "/start" | "/login" }) {
  return (
    <Reveal>
      <section className="rounded-[2rem] bg-primary px-8 py-14 text-center text-primary-foreground shadow-lift md:py-20">
        <h2 className="text-4xl sm:text-5xl">Your idea deserves to be yours.</h2>
        <Button asChild size="lg" variant="secondary" className="mt-8 h-13 rounded-2xl px-7 text-base">
          <Link to={to}>Start my build <ArrowRight className="size-4" /></Link>
        </Button>
      </section>
    </Reveal>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-primary-foreground">o</span>
          <span className="font-display text-lg text-foreground">Ownable</span>
        </div>
        <nav className="flex flex-wrap gap-6">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </nav>
        <div>Built at the Lovable hackathon, Galway, 2026</div>
      </div>
    </footer>
  );
}
