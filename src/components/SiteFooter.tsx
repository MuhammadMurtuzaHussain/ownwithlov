import { Link } from "@tanstack/react-router";
import { Coffee, CupSoda, Heart } from "lucide-react";

const KOFI_URL = "https://ko-fi.com/muhammadmurtuzahussain";
const BMC_URL = "https://buymeacoffee.com/muhammadmurtuza";

const TEAM = [
  { name: "Muhammad Murtuza Hussain", photo: "/team/murtuza.jpg", linkedin: "https://www.linkedin.com/in/muhammadmurtuzahussain/" },
  { name: "Aksharaa Guha", photo: "/team/aksharaa.jpg", linkedin: "https://www.linkedin.com/in/aksharaag/" },
  { name: "Abbineshkar Loganathan", photo: "/team/abbinesh.jpg", linkedin: "https://www.linkedin.com/in/abbineshkar/" },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function SupportCard() {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 font-display text-xl text-foreground">
        <Heart className="size-5 text-primary" /> Keep Ownable free
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Ownable is free and runs on open-source AI. If it helped you ship, a coffee keeps the lights on.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <Coffee className="size-4" /> Ko-fi
        </a>
        <a
          href={BMC_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#FFDD00] px-4 py-2.5 text-sm font-medium text-[#1a1a1a] transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <CupSoda className="size-4" /> Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 text-sm text-muted-foreground md:grid-cols-[1fr_1.3fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-primary-foreground">o</span>
            <span className="font-display text-lg text-foreground">Ownable</span>
          </div>
          <p>Build it. Ship it. Own it. A patient AI mentor for building real apps with open-source tools.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/demo" className="hover:text-foreground">Example plan</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="https://github.com/MuhammadMurtuzaHussain/Ownable" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          </nav>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-foreground">The team behind Ownable</div>
          <ul className="mt-4 space-y-3">
            {TEAM.map((m) => (
              <li key={m.linkedin}>
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl p-1.5 pr-3 transition hover:bg-muted"
                >
                  <img
                    src={m.photo}
                    alt={m.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="size-11 rounded-full object-cover ring-2 ring-background shadow-sm"
                  />
                  <span className="flex-1 font-medium text-foreground">{m.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-[#0a66c2]">
                    <LinkedInIcon /> LinkedIn
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <SupportCard />
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Ownable · Made by Muhammad Murtuza Hussain, Aksharaa Guha &amp; Abbineshkar Loganathan</span>
          <span>Built at the Lovable hackathon, Galway, 2026 · AI by open-weight models</span>
        </div>
      </div>
    </footer>
  );
}
