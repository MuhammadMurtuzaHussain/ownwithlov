import { createOpenAI } from "@ai-sdk/openai";

export const AI_MODEL = "openai/gpt-6-astra";

export function createGateway() {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");
  let runId: string | undefined;
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });
}

export const openaiOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function friendlyAiError(err: unknown): string {
  const status = (err as { statusCode?: number })?.statusCode;
  if (status === 429) return "Lots of people are building right now — please try again in a minute.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in Settings → Plans & credits.";
  if (status === 403) return "AI access isn't available for this workspace right now.";
  return "The AI guide couldn't respond. Please try again.";
}

export const MENTOR_TONE = `You are ownwithlov, a patient mentor for non-technical builders who want to build real apps with free, open-source tools (Ollama, open-weight models, terminal coding agents like OpenCode or Qwen Code, Git, GitHub, Cloudflare Pages/Netlify/Vercel, Supabase). Tone: encouraging, plain English, never condescending, one idea at a time, always explain "why" before "how". Avoid jargon; if you must use a term, explain it in a few words. Costs are in euros.`;
