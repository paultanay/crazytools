import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { AnimatedSearchHero } from "@/components/site/animated-search-hero";
import { ToolCard } from "@/components/site/tool-card";
import { CATEGORIES, AVAILABLE_TOOLS, TOOLS } from "@/lib/tools/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crazy Tools — Free browser-based tools for developers" },
      {
        name: "description",
        content:
          "Free, browser-based tools for developers and designers. PDF, image, code, and text utilities. Nothing leaves your machine.",
      },
      { property: "og:title", content: "Crazy Tools — Free browser-based tools" },
      {
        property: "og:description",
        content:
          "Free, browser-based tools for developers and designers. Nothing leaves your machine.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-4xl px-5 pt-24 pb-16 text-center lg:px-8 sm:pt-32">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Wrench className="h-8 w-8" strokeWidth={1.6} />
          </div>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight sm:text-6xl">
            Crazy Tools — Free browser-based tools for developers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Free, browser-based tools for developers and designers. Nothing leaves your
            machine.
          </p>
          <div className="mt-10">
            <AnimatedSearchHero />
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
          <header className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
          </header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-xl border border-hairline bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-accent/40"
              >
                <h3 className="text-[15px] font-semibold tracking-tight">{c.name}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ALL TOOLS */}
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <header className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">All Tools</h2>
            <p className="mono text-[12px] text-muted-foreground">{TOOLS.length} tools</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_TOOLS.map((t, i) => (
              <ToolCard key={t.slug} tool={t} index={i} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>

  );
}
