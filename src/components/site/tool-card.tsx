import { Link } from "@tanstack/react-router";
import { Cog } from "lucide-react";
import type { Tool } from "@/lib/tools/catalog";

interface Props {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool }: Props) {
  const Icon = tool.icon ?? Cog;
  const content = (
    <div
      className={`group flex h-full items-start gap-4 rounded-xl border border-hairline bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-accent/40 ${
        !tool.available ? "opacity-60" : ""
      }`}
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-accent">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight">{tool.name}</h3>
          {!tool.available && (
            <span className="mono rounded border border-hairline px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              Soon
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          {tool.short}
        </p>
      </div>
    </div>
  );

  if (!tool.available) return <div className="pointer-events-none">{content}</div>;
  return (
    <Link to="/tools/$slug" params={{ slug: tool.slug }} className="block h-full">
      {content}
    </Link>
  );
}
