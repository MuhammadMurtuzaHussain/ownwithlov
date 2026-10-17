import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Receipt, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import hero from "@/assets/hero.jpg";

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
      <main className="mx-auto max-w-6xl px-5">
        <section className="grid items-center gap-10 py-10 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="phase-enter">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              Free & open-source tools · No credit anxiety
            </p>
            <h1 className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Build it.
              <br />
              Ship it.
              <br />
              <em className="text-primary">Own it.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Your AI guide to building real apps with open-source tools — with the full cost shown upfront.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-13 rounded-2xl px-7 text-base shadow-lift">
                <Link to={session ? "/start" : "/login"}>
                  Start my build <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link to="/demo" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                or see an example plan
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="A cozy desk with a laptop and a hand-drawn roadmap"
              width={1280}
              height={960}
              className="aspect-[4/3] w-full rounded-[2rem] border object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-5 rounded-2xl border bg-card px-4 py-3 shadow-soft">
              <div className="text-[11px] tracking-wider text-muted-foreground uppercase">Your launch cost</div>
              <div className="font-display text-2xl">€12<span className="text-sm text-muted-foreground">/year</span></div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="rounded-3xl border bg-card p-6 shadow-soft">
              <p.icon className="size-6 text-primary" />
              <h3 className="mt-4 text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
