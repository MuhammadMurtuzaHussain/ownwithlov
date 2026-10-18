import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Asks the model for a plan and validates it, retrying once if the JSON comes back malformed.
async function generateValidPlan(prompt: string, shapeError: string) {
  const { generateText } = await import("ai");
  const { AI_MODEL, aiOptions, MENTOR_TONE, friendlyAiError } = await import("./ai.server");
  const { planSchema } = await import("./plan-schema");

  for (let attempt = 0; attempt < 2; attempt++) {
    let text: string;
    try {
      ({ text } = await generateText({ model: AI_MODEL, system: MENTOR_TONE, prompt, providerOptions: aiOptions }));
    } catch (err) {
      console.error(err);
      throw new Error(friendlyAiError(err));
    }
    try {
      return planSchema.parse(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)));
    } catch (err) {
      console.error(`Plan parse failed (attempt ${attempt + 1})`, err);
    }
  }
  throw new Error(shapeError);
}

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
- "architecture": a map of how the pieces of THEIR app fit together, built from the stack you chose for them. 5–9 nodes. Each node: id (short slug), name (plain English, e.g. "Your website"), techName (e.g. "React on Cloudflare Pages"), label (short uppercase nickname, e.g. "THE FRONT DOOR"), role (client | service | data | external | operations), required (boolean), purpose (one plain sentence), connects (how it talks to the others, plain English), prerequisites (what must exist first, plain English), alternatives (other options they could have used), cost ("€0" or an amount in euros), phase (1=plan, 2=set up, 3=build, 4=github, 5=launch — the phase where they create this piece). Edges: from/to node ids with a short plain-English label like "sends sign-in" or "saves bookings". Optional pieces (custom domain, error monitoring, payments) get required:false.
- Output ONLY the JSON object, no markdown fences, in exactly the same shape as this example:
${JSON.stringify(example)}`;

    const plan = await generateValidPlan(prompt, "The plan came back in an odd shape. Please try once more.");

    const { data: row, error } = await context.supabase
      .from("plans")
      .insert({ user_id: context.userId, title: data.idea.slice(0, 80), answers: data, plan })
      .select("id")
      .single();
    if (error) throw new Error("Couldn't save your plan. Please try again.");
    return { id: row.id as string };
  });

export const revisePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ planId: z.string().uuid(), notes: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {

    const { data: row, error: loadError } = await context.supabase
      .from("plans")
      .select("answers, plan, is_demo")
      .eq("id", data.planId)
      .single();
    if (loadError || !row || row.is_demo) throw new Error("We couldn't find that plan.");

    const prompt = `Revise this Build Plan as JSON, keeping the same overall shape.

Original answers:
${JSON.stringify(row.answers)}

Current plan:
${JSON.stringify(row.plan)}

${data.notes?.trim() ? `The person asked for these changes:\n${data.notes.trim()}\n\nApply their requests. Keep everything else that still makes sense.` : "No specific changes requested — improve clarity, fix anything weak, and make sure every step is correct and friendly."}

Rules:
- Keep the same JSON shape exactly. Step ids may change if steps change.
- Commands must still match their operating system; costs stay in euros per year.
- Output ONLY the JSON object, no markdown fences.`;

    const plan = await generateValidPlan(prompt, "The revised plan came back in an odd shape. Please try once more.");

    const { error } = await context.supabase.from("plans").update({ plan }).eq("id", data.planId);
    if (error) throw new Error("Couldn't save your revised plan. Please try again.");
    return { ok: true };
  });
