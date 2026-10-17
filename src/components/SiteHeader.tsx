import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-primary font-display text-lg text-primary-foreground">
        o
      </span>
      <span className="font-display text-xl">ownwithlov</span>
    </Link>
  );
}

export function SiteHeader() {
  const { session } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/demo" className="hidden rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground sm:block">
          Example plan
        </Link>
        {session ? (
          <>
            <Link to="/plans" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground">
              My plans
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          </>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
