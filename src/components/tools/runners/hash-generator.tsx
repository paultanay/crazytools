import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

async function digest(algo: string, text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashGeneratorRunner() {
  const [text, setText] = useState("Hello, Crazy Tools");
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Record<string, string> = {};
      for (const a of ALGOS) out[a] = await digest(a, text);
      if (!cancelled) setResults(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success("Copied");
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="mono min-h-[120px] w-full resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
      />
      <div className="space-y-3">
        {ALGOS.map((a) => (
          <div
            key={a}
            className="flex items-center gap-3 rounded-lg border border-hairline bg-card p-3"
          >
            <span className="mono w-20 text-[11px] uppercase tracking-widest text-muted-foreground">
              {a}
            </span>
            <code className="mono flex-1 break-all text-[12px]">{results[a] || "…"}</code>
            <button
              onClick={() => copy(results[a] ?? "")}
              className="rounded-md p-1.5 hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
