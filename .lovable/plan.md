# Ownable — build plan

## Look and feel
- Warm, welcoming direction: off-white paper background, deep ink text, a terracotta/amber primary, rounded cards, generous space.
- Fonts: Fraunces (headings) + Figtree (body); JetBrains Mono for terminal blocks.
- Each phase sets its own theme tokens: Plan (warm whiteboard), Set up (calm sage checklist), Build (dark IDE), GitHub (clean slate), Launch (bright celebratory).
- Subtle fade/slide motion between phases.

## Pages
- `/` Landing: hero "Build it. Ship it. Own it.", subhead, single "Start my build" button, a short 3-point explainer, and a "See an example" link to the yoga demo.
- `/login` Simple email + password sign-in / sign-up.
- `/demo` The seeded "Booking app for a local yoga studio" plan, viewable without signing in (read-only progress).
- `/start` Onboarding chat (signed in): AI asks the 7 questions one at a time with quick-reply chips where options exist; at the end, "Create my Build Plan".
- `/plans` List of the user's plans.
- `/plans/$planId` Plan view: five-phase progress bar on top, phase cards, sticky cost panel (right on desktop, collapsible drawer on mobile).
  - Phase tabs render Plan summary/features/flow/stack, setup checklist with RAM-based model advice, copy-ready build prompts, Git/GitHub explainer + commands, and a hosting/backend/domain comparison table with recommendation.

## Terminal step block
- Numbered step, plain-English one-liner, styled command, Copy button, "Expected result" preview, tick-off checkbox (saved), and "Something went wrong?" which opens a help chat panel pre-filled with that step's context.

## Cost panel
- Line items (model, agent, GitHub, hosting, database, domain) with amount and a "When would this start costing money?" note; headline yearly total.

## AI
- Onboarding chat: streamed, encouraging tone, one question at a time.
- Plan generation: structured JSON (phases, steps, commands, prompts, stack, costs) validated before saving.
- Help chat: per-step context, streamed answers.

## Data (Lovable Cloud)
- Email sign-in.
- Tables: plans (owner, title, answers, plan JSON), step progress, chat messages (onboarding + help), with each user only seeing their own.
- Demo plan seeded in the database as a public example.

## Technical details
- TanStack Start routes as above; protected routes under an authenticated layout.
- Server functions for AI calls via Lovable AI Gateway (default model, streaming, AI SDK), with clear messages for rate-limit/credit errors.
- Zod schema for the plan JSON; progress keyed by step id.
