import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, TOOLS, type CategorySlug, searchTools } from "@/lib/tools/catalog";
import { ToolCard } from "@/components/site/tool-card";

const SITE_URL = "https://crazytools.js.org";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "All Tools — CrazyTools" },
      {
        name: "description",
        content:
          "Browse all 25+ free browser-based tools in the CrazyTools catalog. Filter by category: PDF, image, developer, text, converters, generators, and security.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "All Tools — CrazyTools" },
      {
        property: "og:description",
        content: "25+ free, browser-based utility tools. Nothing leaves your machine.",
      },
      { property: "og:url", content: `${SITE_URL}/tools` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/tools` }],
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategorySlug | "all">("all");

  const filtered = useMemo(() => {
    let list = q ? searchTools(q) : TOOLS;
    if (cat !== "all") list = list.filter((t) => t.categories.includes(cat));
    return list;
  }, [q, cat]);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-16 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">All tools</h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
          Every tool in the catalog. Filter by category or search across the index.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <label htmlFor="tools-search" className="sr-only">
            Search tools
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            id="tools-search"
            aria-label="Search tools"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools"
            className="w-full rounded-md border border-hairline bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-foreground/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-card py-16 text-center text-sm text-muted-foreground">
          No tools match this query
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <ToolCard key={t.slug} tool={t} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-hairline text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
