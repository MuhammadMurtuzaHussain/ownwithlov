import { z } from "zod";

export const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  explain: z.string(),
  command: z.string(),
  expected: z.string(),
});

export const planSchema = z.object({
  title: z.string(),
  summary: z.string(),
  audience: z.string(),
  features: z.array(z.string()),
  userFlow: z.array(z.string()),
  stack: z.array(z.object({ name: z.string(), role: z.string(), why: z.string() })),
  setup: z.object({ modelAdvice: z.string(), steps: z.array(stepSchema) }),
  build: z.object({
    intro: z.string(),
    prompts: z.array(
      z.object({ id: z.string(), title: z.string(), why: z.string(), prompt: z.string(), expected: z.string() }),
    ),
  }),
  github: z.object({ explainer: z.array(z.string()), steps: z.array(stepSchema) }),
  launch: z.object({
    options: z.array(
      z.object({
        category: z.string(),
        name: z.string(),
        freeTier: z.string(),
        cost: z.string(),
        bestFor: z.string(),
        recommended: z.boolean(),
      }),
    ),
    recommendation: z.string(),
    steps: z.array(stepSchema),
  }),
  costs: z.array(
    z.object({ item: z.string(), amount: z.number(), label: z.string(), note: z.string(), optional: z.boolean() }),
  ),
});

export type BuildPlan = z.infer<typeof planSchema>;
export type PlanStep = z.infer<typeof stepSchema>;

export type Answers = {
  idea: string;
  audience: string;
  needs: string;
  os: string;
  ram: string;
  comfort: string;
  domain: string;
};

export const PHASES = [
  { key: "plan", label: "Plan", theme: "phase-plan" },
  { key: "setup", label: "Set up", theme: "phase-setup" },
  { key: "build", label: "Build", theme: "phase-build" },
  { key: "github", label: "Save to GitHub", theme: "phase-github" },
  { key: "launch", label: "Launch", theme: "phase-launch" },
] as const;
export type PhaseKey = (typeof PHASES)[number]["key"];

export function allStepIds(plan: BuildPlan): Record<PhaseKey, string[]> {
  return {
    plan: [],
    setup: plan.setup.steps.map((s) => s.id),
    build: plan.build.prompts.map((p) => p.id),
    github: plan.github.steps.map((s) => s.id),
    launch: plan.launch.steps.map((s) => s.id),
  };
}

export function totalYearlyCost(plan: BuildPlan) {
  return plan.costs.reduce((sum, c) => sum + (c.amount || 0), 0);
}
