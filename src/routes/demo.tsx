import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PlanView } from "@/components/PlanView";
import { Logo } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { planSchema } from "@/lib/plan-schema";

const DEMO_ID = "00000000-0000-0000-0000-000000000001";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Example plan: a yoga studio booking app — Ownable" },
      { name: "description", content: "See a full five-phase Ownable build plan for a local yoga studio booking app." },
      { property: "og:title", content: "Example plan: a yoga studio booking app — Ownable" },
      { property: "og:description", content: "See a full five-phase Ownable build plan for a local yoga studio booking app." },
    ],
  }),
  component: Demo,
});

function Demo() {
  const { data, isLoading } = useQuery({
    queryKey: ["plan", DEMO_ID],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("plan").eq("id", DEMO_ID).single();
      if (error) throw error;
      return planSchema.parse(data.plan);
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between border-b bg-card px-5 py-3">
        <Logo />
        <Button asChild size="sm"><Link to="/login">Start my own build</Link></Button>
      </div>
      {isLoading || !data ? (
        <div className="p-10 text-center text-muted-foreground">Loading the example…</div>
      ) : (
        <PlanView plan={data} planId={DEMO_ID} isDemo />
      )}
    </div>
  );
}
