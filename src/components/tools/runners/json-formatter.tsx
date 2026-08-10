import { useMemo, useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function JsonFormatterRunner() {
  const [input, setInput] = useState(`{"crazytools":{"version":1,"tools":8,"pricing":"free"}}`);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const { formatted, error } = useMemo(() => {
    if (!input.trim()) return { formatted: "", error: null as string | null };
    try {
      const parsed = JSON.parse(input);
      return { formatted: JSON.stringify(parsed, null, indent), error: null };
    } catch (e) {
      return {
        formatted: "",
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  }, [input, indent]);

  const minify = () => {
    if (!formatted) return;
    setInput(JSON.stringify(JSON.parse(input)));
    toast.success("Minified");
  };

  const copy = async () => {
    if (!formatted) return;
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col">
        <div className="mono flex items-center justify-between px-1 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Input</span>
          <span>{input.length} chars</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="mono min-h-[420px] w-full flex-1 resize-none rounded-lg border border-hairline bg-surface/40 p-4 text-[13px] leading-relaxed outline-none focus:border-primary/50"
          placeholder="Paste JSON here"
        />
      </div>
      <div className="flex flex-col">
        <div className="mono flex items-center justify-between px-1 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Formatted</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              Indent
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="rounded border border-hairline bg-background px-1.5 py-0.5 text-[11px]"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={0}>Tab</option>
              </select>
            </label>
            <button
              onClick={minify}
              disabled={!!error}
              className="hover:text-foreground disabled:opacity-40"
            >
              Minify
            </button>
            <button
              onClick={copy}
              disabled={!!error || !formatted}
              className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-40"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
        </div>
        <div
          className={`mono relative flex-1 overflow-auto rounded-lg border p-4 text-[13px] leading-relaxed ${
            error ? "border-destructive/40 bg-destructive/5" : "border-hairline bg-surface/40"
          }`}
          style={{ minHeight: 420 }}
        >
          {error ? (
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <pre className="whitespace-pre-wrap">{error}</pre>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-foreground">{formatted}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
