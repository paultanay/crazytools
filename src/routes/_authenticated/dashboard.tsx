import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFavorites, listHistory } from "@/lib/user-data.functions";
import { getTool, TOOLS, FEATURED_TOOLS } from "@/lib/tools/catalog";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Heart, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — CrazyTools" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const favFn = useServerFn(listFavorites);
  const histFn = useServerFn(listHistory);

  const favs = useQuery({ queryKey: ["favorites"], queryFn: () => favFn() });
  const hist = useQuery({ queryKey: ["history"], queryFn: () => histFn() });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mono text-[11px] uppercase tracking-[0.25em] text-primary">Account</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <button
          onClick={signOut}
          className="mono inline-flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3 w-3" />
          Sign out
        </button>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* Favorites */}
        <section className="rounded-2xl border border-hairline bg-surface/40 p-6">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold">Favorites</h2>
            <span className="mono ml-auto text-[11px] text-muted-foreground">
              {favs.data?.length ?? 0}
            </span>
          </div>
          <div className="mt-4 divide-y divide-hairline">
            {favs.isLoading && (
              <p className="mono py-8 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Loading…
              </p>
            )}
            {favs.data?.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No favorites yet.{" "}
                <Link to="/tools" className="text-primary hover:underline">
                  Browse tools
                </Link>
              </p>
            )}
            {favs.data?.map((f) => {
              const t = getTool(f.tool_slug);
              if (!t) return null;
              const Icon = t.icon;
              return (
                <Link
                  key={f.tool_slug}
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className="group flex items-center gap-3 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-background">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="mono text-[11px] text-muted-foreground">{t.short}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl border border-hairline bg-surface/40 p-6">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold">Recent runs</h2>
            <span className="mono ml-auto text-[11px] text-muted-foreground">
              {hist.data?.length ?? 0}
            </span>
          </div>
          <div className="mt-4 divide-y divide-hairline">
            {hist.isLoading && (
              <p className="mono py-8 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                Loading…
              </p>
            )}
            {hist.data?.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Your recent activity will appear here.
              </p>
            )}
            {hist.data?.slice(0, 8).map((h) => {
              const t = getTool(h.tool_slug);
              if (!t) return null;
              return (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <span className="text-sm">{t.name}</span>
                  <span className="mono text-[11px] text-muted-foreground">
                    {new Date(h.ran_at).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Quick access</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {FEATURED_TOOLS.slice(0, 4).map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group flex items-center gap-3 rounded-lg border border-hairline bg-surface/40 p-4 transition-colors hover:border-primary/40"
              >
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm">{t.name}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
