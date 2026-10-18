import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import { PlanPreview } from "@/components/landing/PlanPreview";
import { HeroSection } from "@/components/landing/HeroSection";
import { Audience, Faq, FinalCta, HowItWorks, PaperStrip, PhaseLine, ProblemSection, SeeItInAction, SiteFooter } from "@/components/landing/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ownable — Build it. Ship it. Own it." },
      { name: "description", content: "Your AI guide to building real apps with open-source tools — with the full cost shown upfront." },
      { property: "og:title", content: "Ownable — Build it. Ship it. Own it." },
      { property: "og:description", content: "Your AI guide to building real apps with open-source tools — with the full cost shown upfront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

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
          preview={<PlanPreview />}
          footer={<PhaseLine />}
        />
        <div className="space-y-28 py-24">
          <ProblemSection />
          <HowItWorks />
          <SeeItInAction />
          <Audience />
          <PaperStrip />
          <Faq />
          <FinalCta to={session ? "/start" : "/login"} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
