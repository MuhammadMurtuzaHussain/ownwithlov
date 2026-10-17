import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/landing/Sections";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ownable — a mentor for building apps you own" },
      { name: "description", content: "Why we built Ownable: helping non-technical people build real apps with free, open-source tools." },
      { property: "og:title", content: "About Ownable" },
      { property: "og:description", content: "Helping non-technical people build real apps with free, open-source tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-warm-glow">
      <SiteHeader />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-16 text-lg">
        <h1 className="text-5xl">About Ownable</h1>
        <p>Ownable is a patient AI mentor for people who want to build a real app but don't write code for a living.</p>
        <p className="text-muted-foreground">
          It never builds the app for you. Instead it explains each step in plain English, shows you exactly what to type, and tells you what every
          piece costs before you start — so what you end up with is genuinely yours: your code, your GitHub, your hosting.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
