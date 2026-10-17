import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/plans/")({
  head: () => ({
    meta: [
      { title: "My build plans — ownwithlov" },
      { name: "description", content: "All your ownwithlov build plans in one place." },
      { property: "og:title", content: "My build plans — ownwithlov" },
      { property: "og:description", content: "All your ownwithlov build plans in one place." },
    ],
  }),
  component: Plans,
});

function Plans() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const { data } = useQuery({
    queryKey: ["plans", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data } = await supabase.from("plans").select("id,title,created_at").eq("is_demo", false).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="bg-warm-glow min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">My plans</h1>
          <Button asChild><Link to="/start"><Plus className="size-4" /> New build</Link></Button>
        </div>
        <div className="mt-8 space-y-3">
          {data?.length === 0 && (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
              No plans yet. <Link to="/start" className="text-primary underline">Start your first build</Link>.
            </div>
          )}
          {data?.map((p) => (
            <Link key={p.id} to="/plans/$planId" params={{ planId: p.id }} className="block rounded-2xl border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
              <div className="font-display text-xl">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
