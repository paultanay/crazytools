import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getTool, getToolIcon, type ToolData } from "@/lib/tools/catalog";
import { RUNNERS } from "@/components/tools/runners";
import { ToolShell } from "@/components/tools/tool-shell";
import { Cog } from "lucide-react";

const SITE_URL = "https://crazytools.js.org";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    const { icon: _, ...rest } = tool;
    return { tool: rest satisfies ToolData };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Tool — CrazyTools" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { tool } = loaderData;
    const url = `${SITE_URL}/tools/${params.slug}`;
    const primaryCategory = tool.categories[0] ?? "developer";
    const appCategoryMap: Record<string, string> = {
      developer: "DeveloperApplication",
      pdf: "BusinessApplication",
      image: "MultimediaApplication",
      text: "UtilitiesApplication",
      converters: "UtilitiesApplication",
      generators: "UtilitiesApplication",
      security: "SecurityApplication",
    };
    return {
      meta: [
        { title: `${tool.name} — Free Online Tool | CrazyTools` },
        { name: "description", content: `${tool.description} Free, browser-based, no sign-up required.` },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: `${tool.name} — CrazyTools` },
        { property: "og:description", content: tool.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            description: tool.description,
            applicationCategory: appCategoryMap[primaryCategory] ?? "UtilitiesApplication",
            operatingSystem: "Web Browser",
            url,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
      ],
    };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="text-3xl font-semibold">Tool not found</h1>
      <p className="mt-3 text-muted-foreground">
        This tool is not part of the current catalog.
      </p>
      <Link
        to="/tools"
        className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
      >
        Browse all tools
      </Link>
    </div>
  ),
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Icon = getToolIcon(tool.slug);
  const Runner = RUNNERS[tool.slug];

  return (
    <ToolShell tool={tool} icon={Icon}>
      {Runner ? (
        <Runner />
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface/40 p-16 text-center">
          <Cog className="mx-auto h-8 w-8 text-primary" strokeWidth={1.2} />
          <p className="mono mt-4 text-[11px] uppercase tracking-[0.25em] text-primary">
            On the roadmap
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            This tool is in active development
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {tool.description} Follow CrazyTools to be notified when {tool.name} ships.
          </p>
          <Link
            to="/tools"
            className="mt-6 inline-flex rounded-md border border-hairline px-5 py-2 text-sm hover:bg-accent"
          >
            Explore available tools
          </Link>
        </div>
      )}
    </ToolShell>
  );
}
