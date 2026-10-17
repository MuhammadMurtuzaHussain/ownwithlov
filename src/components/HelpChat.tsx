import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { ArrowUp, LifeBuoy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type HelpContext = { title: string; detail: string } | null;

export function HelpChat({ ctx, onClose, planId }: { ctx: HelpContext; onClose: () => void; planId: string | null }) {
  return (
    <Sheet open={!!ctx} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <LifeBuoy className="size-5 text-primary" /> Let's fix it together
          </SheetTitle>
          <SheetDescription>Stuck on: {ctx?.title}</SheetDescription>
        </SheetHeader>
        {ctx && <ChatBody key={ctx.title} ctx={ctx} planId={planId} />}
      </SheetContent>
    </Sheet>
  );
}

function ChatBody({ ctx, planId }: { ctx: NonNullable<HelpContext>; planId: string | null }) {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const contextText = `${ctx.title}\n${ctx.detail}`;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/help",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
        body: { context: contextText },
      }),
    [contextText],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onFinish: async ({ message }) => {
      if (!session) return;
      const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      await supabase.from("chat_messages").insert({
        user_id: session.user.id,
        plan_id: planId,
        context: `help:${ctx.title}`,
        role: "assistant",
        content: text,
      });
    },
  });

  useEffect(() => {
    ref.current?.focus();
  }, [status]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!session) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Sign in so your guide can help with this step.
        <Button asChild className="mt-4 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const send = async () => {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    setInput("");
    sendMessage({ text });
    await supabase.from("chat_messages").insert({
      user_id: session.user.id,
      plan_id: planId,
      context: `help:${ctx.title}`,
      role: "user",
      content: text,
    });
  };

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="rounded-2xl bg-muted p-4 text-sm">
          Don't worry — this happens to everyone. Paste the error you see (or describe what happened) and I'll walk you
          through it, one step at a time.
        </div>
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground"
                  : "prose prose-sm max-w-none text-sm text-foreground [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-terminal [&_pre]:p-3 [&_pre]:text-terminal-foreground [&_p]:my-2"
              }
            >
              {m.parts.map((p, i) =>
                p.type === "text" ? (
                  m.role === "user" ? <span key={i}>{p.text}</span> : <ReactMarkdown key={i}>{p.text}</ReactMarkdown>
                ) : null,
              )}
            </div>
          </div>
        ))}
        {status === "submitted" && <div className="animate-pulse text-sm text-muted-foreground">Thinking…</div>}
        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error.message || "Something went wrong."}</div>}
        <div ref={endRef} />
      </div>
      <form
        className="border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border bg-background p-2">
          <Textarea
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Paste your error here…"
            className="max-h-40 min-h-11 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={!input.trim()}>
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </form>
    </>
  );
}
