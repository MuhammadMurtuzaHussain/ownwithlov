import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generatePlan } from "@/lib/plan.functions";
import type { Answers } from "@/lib/plan-schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Start your build — Ownable" },
      { name: "description", content: "Answer a few friendly questions and get a personalised build plan." },
      { property: "og:title", content: "Start your build — Ownable" },
      { property: "og:description", content: "Answer a few friendly questions and get a personalised build plan." },
    ],
  }),
  component: Start,
});

type Q = { key: keyof Answers; ask: string; chips?: string[]; multi?: boolean; placeholder?: string };
const QUESTIONS = [
  { key: "idea", ask: "Hi! I'm your build guide. Let's start with the fun part — what do you want to build? Describe it like you'd tell a friend.", placeholder: "e.g. A booking app for my yoga studio" },
  { key: "audience", ask: "Lovely. Who is it for? Knowing the people helps us keep it simple for them.", placeholder: "e.g. My students and me" },
  { key: "needs", ask: "Does it need any of these? Pick all that apply — it's fine to pick none.", chips: ["User accounts", "A database", "Payments", "File uploads"], multi: true },
  { key: "os", ask: "What kind of computer will you build on? Commands differ a little between them.", chips: ["Mac", "Windows", "Linux"] },
  { key: "ram", ask: "Roughly how much memory (RAM) does it have? This decides which free AI model can run on it. Not sure? Pick 8GB — we'll be safe.", chips: ["8GB", "16GB", "32GB+"] },
  { key: "comfort", ask: "How comfortable are you with tech? No wrong answer — I'll adjust how much I explain.", chips: ["Never opened a terminal", "A little", "Comfortable"] },
  { key: "domain", ask: "Last one: would you like your own web address, like yourname.com? It's optional and costs about €10–15 a year.", chips: ["Yes", "Not now"] },
] as [Q, ...Q[]];

type Msg = { role: "assistant" | "user"; text: string };

function Start() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const gen = useServerFn(generatePlan);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: QUESTIONS[0].ask }]);
  const [input, setInput] = useState("");
  const [multi, setMulti] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[step] as Q;

  const answer = (value: string) => {
    if (!value.trim() || !q) return;
    const next = { ...answers, [q.key]: value.trim() };
    setAnswers(next);
    const nextStep = step + 1;
    const nextMsgs: Msg[] = [...messages, { role: "user", text: value.trim() }];
    nextMsgs.push(
      nextStep < QUESTIONS.length
        ? { role: "assistant", text: QUESTIONS[nextStep]!.ask }
        : { role: "assistant", text: "Thank you — that's everything I need. When you're ready, I'll put together your personalised Build Plan, with every step and every euro laid out." },
    );
    setMessages(nextMsgs);
    setStep(nextStep);
    setInput("");
    setMulti([]);
  };

  const create = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await supabase.from("chat_messages").insert(
        messages.map((m) => ({ user_id: session.user.id, context: "onboarding", role: m.role, content: m.text })),
      );
      const { id } = await gen({ data: answers as Answers });
      await supabase.from("chat_messages").update({ plan_id: id }).eq("context", "onboarding").is("plan_id", null);
      navigate({ to: "/plans/$planId", params: { planId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="phase-plan bg-warm-glow flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6">
        <div className="mb-4 flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("phase-enter flex", m.role === "user" && "justify-end")}>
              {m.role === "assistant" ? (
                <div className="flex max-w-[90%] gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary font-display text-primary-foreground">o</span>
                  <p className="pt-1 text-[15px] leading-relaxed">{m.text}</p>
                </div>
              ) : (
                <p className="max-w-[80%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-[15px] text-background">{m.text}</p>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-4 mt-6">
          {done ? (
            <Button size="lg" className="h-14 w-full rounded-2xl text-base shadow-lift" onClick={create} disabled={busy}>
              {busy ? (<><Loader2 className="size-4 animate-spin" /> Drawing up your plan… (about a minute)</>) : "Create my Build Plan"}
            </Button>
          ) : q.chips ? (
            <div className="rounded-2xl border bg-card p-3 shadow-soft">
              <div className="flex flex-wrap gap-2">
                {q.chips.map((c) => {
                  const on = multi.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => (q.multi ? setMulti(on ? multi.filter((x) => x !== c) : [...multi, c]) : answer(c))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary",
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              {q.multi && (
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={() => answer(multi.length ? multi.join(", ") : "None of these")}>
                    {multi.length ? "Continue" : "None of these"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); answer(input); }}
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-soft"
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); answer(input); }
                }}
                placeholder={q.placeholder}
                className="max-h-40 min-h-11 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={!input.trim()}>
                <ArrowUp className="size-4" />
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
