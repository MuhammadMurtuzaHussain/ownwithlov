import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { PlanView } from "@/components/PlanView";
import { Logo } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { planSchema } from "@/lib/plan-schema";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/plans/$planId")({
  head: () => ({
    meta: [
      { title: "Your build plan — ownwithlov" },
      { name: "description", content: "Your personalised five-phase build plan." },
      { property: "og:title", content: "Your build plan — ownwithlov" },
      { property: "og:description", content: "Your personalised five-phase build plan." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { planId } = Route.useParams();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["plan", planId],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("plan,is_demo").eq("id", planId).single();
      if (error) throw error;
      return { plan: planSchema.parse(data.plan), isDemo: data.is_demo };
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between border-b bg-card px-5 py-3">
        <Logo />
        <Link to="/plans" className="text-sm text-muted-foreground hover:text-foreground">My plans</Link>
      </div>
      {error ? (
        <div className="p-10 text-center text-muted-foreground">We couldn't find that plan.</div>
      ) : isLoading || !data ? (
        <div className="p-10 text-center text-muted-foreground">Loading your plan…</div>
      ) : (
        <PlanView plan={data.plan} planId={planId} isDemo={data.isDemo} />
      )}
    </div>
  );
}
