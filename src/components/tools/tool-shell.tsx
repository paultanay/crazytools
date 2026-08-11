import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Cog, ArrowLeft } from "lucide-react";
import type { Tool } from "@/lib/tools/catalog";
import type { LucideIcon } from "lucide-react";
import { FavoriteButton } from "./favorite-button";

interface Props {
  tool: Omit<Tool, "icon"> & { icon?: LucideIcon };
  icon?: LucideIcon;
  children: ReactNode;
}

export function ToolShell({ tool, icon, children }: Props) {
  const Icon = icon ?? tool.icon ?? Cog;
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 lg:px-8">
      <Link
        to="/tools"
        className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
        All tools
      </Link>

      <header className="mt-6 flex flex-col gap-6 border-hairline pb-8 hairline-b sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-accent">
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {tool.categories.join(" · ")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
        <div className="flex-none">
          <FavoriteButton toolSlug={tool.slug} />
        </div>
      </header>

      <div className="mt-10">{children}</div>
    </main>
  );
}
