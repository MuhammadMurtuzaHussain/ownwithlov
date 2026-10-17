import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/help")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Please sign in to ask for help.", { status: 401 });
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
          auth: { persistSession: false },
        });
        const { data: user } = await sb.auth.getUser(token);
        if (!user.user) return new Response("Please sign in to ask for help.", { status: 401 });

        const { streamText, convertToModelMessages } = await import("ai");
        const { createGateway, AI_MODEL, openaiOptions, MENTOR_TONE } = await import("@/lib/ai.server");
        const body = (await request.json()) as { messages: Parameters<typeof convertToModelMessages>[0]; context?: string };

        const result = streamText({
          model: createGateway().responses(AI_MODEL),
          system: `${MENTOR_TONE}\n\nThe user is stuck on a step in their build. Help them fix it. Ask them to paste the exact error if they haven't. Keep answers short, give one fix at a time, and put commands in code blocks.\n\nStep context:\n${(body.context ?? "").slice(0, 4000)}`,
          messages: await convertToModelMessages(body.messages),
          abortSignal: request.signal,
          providerOptions: openaiOptions,
        });
        return result.toUIMessageStreamResponse();
      },
    },
  },
});
