import { Link, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette-state";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";

const CommandPalette = lazy(() =>
  import("./command-palette").then((m) => ({ default: m.CommandPalette })),
);

export function SiteNav() {
  const { open, setOpen } = useCommandPalette();
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const links = [
    { to: "/tools", label: "All tools" },
    { to: "/category/pdf", label: "PDF" },
    { to: "/category/image", label: "Image" },
    { to: "/category/developer", label: "Developer" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 hairline-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((l) => {
                const active = pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`text-[13px] font-medium transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link
                to="/dashboard"
                className="hidden h-9 items-center rounded-md border border-hairline bg-background px-3.5 text-[13px] font-medium transition-colors hover:bg-accent sm:inline-flex"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      {open && (
        <Suspense fallback={null}>
          <CommandPalette open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
