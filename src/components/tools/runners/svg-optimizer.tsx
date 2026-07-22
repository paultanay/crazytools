import { useMemo, useState } from "react";
import { optimize } from "svgo/browser";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <!-- optional comment -->
  <circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#000" stroke-width="2"/>
</svg>`;

export function SvgOptimizerRunner() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const { output, error, savings } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", savings: 0 };
    try {
      const result = optimize(input, {
        multipass: true,
        plugins: ["preset-default"],
      });
      const out = (result as { data: string }).data;
      const saved = input.length - out.length;
      return { output: out, error: "", savings: saved };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : String(e), savings: 0 };
    }
  }, [input]);

  const pct = input.length ? Math.max(0, Math.round((savings / input.length) * 100)) : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied");
  };
  const download = () => {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Input · {input.length} B
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mono min-h-[380px] w-full rounded-md border border-hairline bg-background p-3 text-[12px] outline-none focus:border-primary/50"
          spellCheck={false}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Optimized · {output.length} B{savings > 0 && ` · −${pct}%`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
            </button>
            <button
              onClick={download}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent disabled:opacity-50"
            >
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>
        {error ? (
          <pre className="mono min-h-[380px] w-full rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[12px] text-destructive">
            {error}
          </pre>
        ) : (
          <pre className="mono min-h-[380px] w-full overflow-auto rounded-md border border-hairline bg-background p-3 text-[12px]">
            {output}
          </pre>
        )}
        {output && (
          <div className="rounded-md border border-hairline bg-surface/40 p-4">
            <div className="mono mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              Preview
            </div>
            <div
              className="flex min-h-[100px] items-center justify-center [&_svg]:max-h-[200px]"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
