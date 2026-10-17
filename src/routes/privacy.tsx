import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/landing/Sections";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Ownable" },
      { name: "description", content: "What Ownable stores about you and why." },
      { property: "og:title", content: "Privacy — Ownable" },
      { property: "og:description", content: "What Ownable stores about you and why." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-warm-glow">
      <SiteHeader />
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-16 text-lg">
        <h1 className="text-5xl">Privacy</h1>
        <p>We keep only what's needed to guide you:</p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Your email address, so you can sign in.</li>
          <li>Your answers and the Build Plan made from them.</li>
          <li>Which steps you've ticked off, and your help chats.</li>
        </ul>
        <p className="text-muted-foreground">We don't sell your data or show ads. Your app's code lives on your own computer and GitHub account, not with us.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
