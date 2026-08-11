import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  getCategory,
  getToolIcon,
  toolsInCategory,
  type CategorySlug,
  type Tool,
  type ToolData,
} from "@/lib/tools/catalog";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { ToolCard } from "@/components/site/tool-card";
import { ArrowLeft } from "lucide-react";

const SITE_URL = "https://crazytools.eu.cc";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    const tools = toolsInCategory(params.slug as CategorySlug).map(
      ({ icon: _, ...rest }) => rest satisfies ToolData,
    );
    return { category, tools };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category — CrazyTools" }] };
    const { category } = loaderData;
    const url = `${SITE_URL}/category/${params.slug}`;
    return {
      meta: [
        { title: `Free ${category.name} Tools — CrazyTools` },
        { name: "description", content: category.description },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: `Free ${category.name} Tools — CrazyTools` },
        { property: "og:description", content: category.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, tools } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="mx-auto max-w-7xl px-5 pt-16 pb-24 lg:px-8">
          <Link
            to="/tools"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            All tools
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">{category.name}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
            {category.tagline} {category.description}
          </p>
          <p className="mono mt-4 text-[12px] text-muted-foreground">{tools.length} tools</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t, i: number) => (
              <ToolCard key={t.slug} tool={{ ...t, icon: getToolIcon(t.slug) } as Tool} index={i} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
