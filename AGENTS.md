<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# ownwithlov — agent rules
- Build Plan JSON shape lives in src/lib/plan-schema.ts (zod); AI output is validated against it before saving — keep demo-plan.json and the generation prompt in sync with it.
- Phase themes are CSS classes (.phase-*) in src/styles.css that override tokens; components use semantic tokens only so they re-theme per phase.
- AI calls are server-only: plan generation via createServerFn (src/lib/plan.functions.ts), step help via streaming route /api/help that verifies the user's bearer token.
- Step progress: database for signed-in owners, localStorage for the public demo plan.
- The landing plan preview renders demo-plan data as browser text, not a screenshot, so it remains readable and links directly to the public example.
