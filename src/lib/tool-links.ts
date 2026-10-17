import type { BuildPlan } from "./plan-schema";

// Official sites for tools the plan generator commonly recommends.
const KNOWN: { match: RegExp; name: string; url: string; what: string }[] = [
  { match: /ollama/i, name: "Ollama", url: "https://ollama.com", what: "Runs the AI model on your computer" },
  { match: /qwen/i, name: "Qwen Coder", url: "https://qwenlm.github.io", what: "The free AI model that helps you code" },
  { match: /opencode/i, name: "OpenCode", url: "https://opencode.ai", what: "Your coding assistant in the terminal" },
  { match: /node/i, name: "Node.js", url: "https://nodejs.org", what: "Lets your computer run the app" },
  { match: /react/i, name: "React", url: "https://react.dev", what: "Builds the screens people see" },
  { match: /vite/i, name: "Vite", url: "https://vite.dev", what: "Starts and packages your app" },
  { match: /tailwind/i, name: "Tailwind CSS", url: "https://tailwindcss.com", what: "Makes the app look good" },
  { match: /supabase/i, name: "Supabase", url: "https://supabase.com", what: "Stores accounts and data" },
  { match: /pocketbase/i, name: "PocketBase", url: "https://pocketbase.io", what: "Stores accounts and data" },
  { match: /github|git\b/i, name: "GitHub", url: "https://github.com", what: "Keeps every version safe" },
  { match: /cloudflare/i, name: "Cloudflare", url: "https://pages.cloudflare.com", what: "Puts your app on the internet" },
  { match: /netlify/i, name: "Netlify", url: "https://www.netlify.com", what: "Puts your app on the internet" },
  { match: /vercel/i, name: "Vercel", url: "https://vercel.com", what: "Puts your app on the internet" },
];

export function toolLinks(plan: BuildPlan) {
  const text = [
    ...plan.stack.map((s) => s.name),
    ...plan.architecture.nodes.map((n) => n.techName),
    ...plan.launch.options.filter((o) => o.recommended).map((o) => o.name),
    ...plan.setup.steps.map((s) => s.command),
  ].join(" \n ");
  return KNOWN.filter((k) => k.match.test(text));
}
