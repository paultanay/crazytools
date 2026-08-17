import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { CATEGORIES, TOOLS, searchTools } from "@/lib/tools/catalog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => searchTools(query).slice(0, 12), [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    setTimeout(() => navigate({ to: path }), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 bg-surface border border-hairline shadow-xl [&>button.absolute]:hidden">
        <DialogTitle className="sr-only">Search tools</DialogTitle>
        <Command
          label="Tool search"
          shouldFilter={false}
          className="[&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-hairline"
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search tools, formats, categories…"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="mono hidden rounded-md border border-hairline bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
              No tools match "{query}".
            </Command.Empty>

            {!query && (
              <Command.Group
                heading="Categories"
                className="[&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {CATEGORIES.map((c) => (
                  <Command.Item
                    key={c.slug}
                    value={`cat-${c.slug}`}
                    onSelect={() => go(`/category/${c.slug}`)}
                    className="group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                      <span>{c.name}</span>
                      <span className="mono text-xs text-muted-foreground">{c.tagline}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading={query ? "Tools" : "Featured tools"}
              className="[&_[cmdk-group-heading]]:mono [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {(query ? results : TOOLS.filter((t) => t.featured)).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Command.Item
                    key={tool.slug}
                    value={tool.slug + " " + tool.name + " " + tool.keywords.join(" ")}
                    onSelect={() => go(`/tools/${tool.slug}`)}
                    className="group flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm aria-selected:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-background">
                        <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{tool.name}</span>
                        <span className="mono text-xs text-muted-foreground">{tool.short}</span>
                      </div>
                    </div>
                    {!tool.available && (
                      <span className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Roadmap
                      </span>
                    )}
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
          <div className="hairline-t flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground">
            <div className="mono">
              <span className="text-foreground">{TOOLS.length}</span> tools indexed
            </div>
            <div className="mono flex items-center gap-3">
              <span>↵ open</span>
              <span>↑↓ move</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
