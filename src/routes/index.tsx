import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Receipt, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import hero from "@/assets/hero.jpg";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ownable — Build it. Ship it. Own it." },
      { name: "description", content: "Your AI guide to building real apps with open-source tools — with the full cost shown upfront." },
      { property: "og:title", content: "Ownable — Build it. Ship it. Own it." },
      { property: "og:description", content: "Your AI guide to building real apps with open-source tools — with the full cost shown upfront." },
    ],
  }),
  component: Index,
});

const POINTS = [
  { icon: Footprints, title: "One step at a time", body: "A patient guide explains why before how. No jargon, no rush." },
  { icon: Receipt, title: "Every euro upfront", body: "See exactly what your app costs to run — usually €0, plus an optional domain." },
  { icon: KeyRound, title: "Yours to keep", body: "Your code, your GitHub, your hosting. No subscriptions, no lock-in." },
];

function Index() {
  const { session } = useAuth();
  return (
    <div className="bg-warm-glow min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pt-6 md:pt-10">
        <HeroSection
          eyebrow="Free & open-source tools · No credit anxiety"
          title={
            <>
              Build it.
              <br />
              Ship it.
              <br />
              <em className="text-primary">Own it.</em>
            </>
          }
          subtitle="Your AI guide to building real apps with open-source tools — with the full cost shown upfront."
          actions={
            <>
              <Button asChild size="lg" className="h-13 rounded-2xl px-7 text-base shadow-lift">
                <Link to={session ? "/start" : "/login"}>
                  Start my build <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link to="/demo" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                or see an example plan
              </Link>
            </>
          }
          image={hero}
          imageAlt="A cozy desk with a laptop and a hand-drawn roadmap"
          footer={[
            { label: "Phases", value: "5 guided steps" },
            { label: "Tools", value: "Open source" },
            { label: "Lock-in", value: "None" },
          ]}
          badge={
            <div className="rounded-2xl border bg-card px-4 py-3 shadow-soft">
              <div className="text-[11px] tracking-wider text-muted-foreground uppercase">Your launch cost</div>
              <div className="font-display text-2xl">€12<span className="text-sm text-muted-foreground">/year</span></div>
            </div>
          }
        />
        <FeatureGrid
          eyebrow="Why Ownable"
          title="A mentor, not a magic button"
          body="You do the building. We make sure every step makes sense — and that nothing costs more than you expect."
          features={POINTS}
        />
      </main>
    </div>
  );
}
