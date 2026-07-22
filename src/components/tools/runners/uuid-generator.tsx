import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function UuidGeneratorRunner() {
  const [count, setCount] = useState(10);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 10 }, () => crypto.randomUUID()));

  const generate = () => setIds(Array.from({ length: count }, () => crypto.randomUUID()));
  const copyAll = () => {
    navigator.clipboard.writeText(ids.join("\n"));
    toast.success("Copied");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
          className="w-24 rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
        <button
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.6} /> Generate
        </button>
        <button
          onClick={copyAll}
          className="inline-flex items-center gap-2 rounded-md border border-hairline px-4 py-2 text-sm hover:bg-accent"
        >
          <Copy className="h-4 w-4" strokeWidth={1.6} /> Copy all
        </button>
      </div>
      <pre className="mono min-h-[240px] max-h-[420px] overflow-auto rounded-lg border border-hairline bg-card p-4 text-[12px] leading-relaxed">
        {ids.join("\n")}
      </pre>
    </div>
  );
}
