import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const answersSchema = z.object({
  idea: z.string().min(1).max(2000),
  audience: z.string().max(1000),
  needs: z.string().max(500),
  os: z.string().max(50),
  ram: z.string().max(50),
  comfort: z.string().max(100),
  domain: z.string().max(100),
});

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => answersSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { streamText } = await import("ai");
    const { createGateway, AI_MODEL, openaiOptions, MENTOR_TONE, friendlyAiError } = await import("./ai.server");
    const { planSchema } = await import("./plan-schema");
    const example = (await import("./demo-plan.json")).default;

    const prompt = `Create a personalised Build Plan as JSON for this person.

Answers:
- Idea: ${data.idea}
- Who it's for: ${data.audience}
- Needs (accounts/database/payments/uploads): ${data.needs}
- Computer: ${data.os}, ${data.ram} RAM
- Comfort with tech: ${data.comfort}
- Custom domain: ${data.domain}

Rules:
- Commands must match their operating system (${data.os}). On Windows use winget; on Mac use Homebrew; on Linux use apt.
- Pick an open-weight coding model sized for ${data.ram} RAM (8GB: a 3B model like qwen2.5-coder:3b and honestly suggest a free cloud model; 16GB: 7B; 32GB+: 14B–32B). Explain in modelAdvice.
- If they've never opened a terminal, add an extra first setup step explaining how to open one.
- 4–7 build prompts, small feature-sized, copy-ready, written to a coding agent.
- Cost items: AI model, Coding agent, GitHub, Hosting, Database${data.domain.toLowerCase().startsWith("y") ? ", Domain (amount 12, optional true)" : ""}. amount is euros per year (number). Each note explains in plain words when it would start costing money.
- Step ids must be unique short slugs.
- Output ONLY the JSON object, no markdown fences, in exactly the same shape as this example:
${JSON.stringify(example)}`;

    let text = "";
    try {
      const result = streamText({
        model: createGateway().responses(AI_MODEL),
        system: MENTOR_TONE,
        prompt,
        providerOptions: openaiOptions,
      });
      text = await result.text;
    } catch (err) {
      console.error(err);
      throw new Error(friendlyAiError(err));
    }

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let plan;
    try {
      plan = planSchema.parse(JSON.parse(text.slice(start, end + 1)));
    } catch (err) {
      console.error("Plan parse failed", err);
      throw new Error("The plan came back in an odd shape. Please try once more.");
    }

    const { data: row, error } = await context.supabase
      .from("plans")
      .insert({ user_id: context.userId, title: data.idea.slice(0, 80), answers: data, plan })
      .select("id")
      .single();
    if (error) throw new Error("Couldn't save your plan. Please try again.");
    return { id: row.id as string };
  });
