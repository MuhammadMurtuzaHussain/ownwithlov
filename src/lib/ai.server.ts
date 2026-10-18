// AI runs on open-weight models through Vercel AI Gateway. On Vercel the gateway
// authenticates via OIDC automatically; locally, run `vercel env pull` or set
// AI_GATEWAY_API_KEY.

// Apache-2.0 open-weight model. Fallbacks are open-weight too (MIT / Apache-2.0).
export const AI_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODELS = ["deepseek/deepseek-v4-flash", "alibaba/qwen3-next-80b-a3b-instruct"];

export const aiOptions = {
  gateway: { models: FALLBACK_MODELS, tags: ["ownable"] },
} as const;

export function friendlyAiError(err: unknown): string {
  const status = (err as { statusCode?: number })?.statusCode;
  if (status === 429) return "Lots of people are building right now — please try again in a minute.";
  if (status === 401 || status === 403) return "The AI guide isn't configured right now. Please try again later.";
  if (status === 402) return "The AI guide has used up its budget for now. Please try again later.";
  return "The AI guide couldn't respond. Please try again.";
}

export const MENTOR_TONE = `You are Ownable, a patient mentor for non-technical builders who want to build real apps with free, open-source tools (Ollama, open-weight models, terminal coding agents like OpenCode or Qwen Code, Git, GitHub, Cloudflare Pages/Netlify/Vercel, Supabase). Tone: encouraging, plain English, never condescending, one idea at a time, always explain "why" before "how". Avoid jargon; if you must use a term, explain it in a few words. Costs are in euros.`;
