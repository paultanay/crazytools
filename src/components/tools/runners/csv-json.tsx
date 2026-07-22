import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

function csvToJson(csv: string): unknown[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const parseLine = (l: string) => {
    const out: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (inQ) {
        if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === ",") { out.push(cur); cur = ""; }
        else if (c === '"') inQ = true;
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cols = parseLine(l);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
    return row;
  });
}

function jsonToCsv(json: unknown): string {
  if (!Array.isArray(json) || json.length === 0) return "";
  const headers = Array.from(
    new Set(json.flatMap((r) => (r && typeof r === "object" ? Object.keys(r as object) : []))),
  );
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...json.map((r) => headers.map((h) => esc((r as Record<string, unknown>)?.[h])).join(",")),
  ].join("\n");
}

export function CsvJsonRunner() {
  const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");
  const [input, setInput] = useState("name,age\nAda,36\nGrace,85");

  const output = useMemo(() => {
    try {
      if (mode === "csv2json") return JSON.stringify(csvToJson(input), null, 2);
      return jsonToCsv(JSON.parse(input));
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  }, [mode, input]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("csv2json"); setInput("name,age\nAda,36\nGrace,85"); }}
          className={`rounded-md border px-3 py-1.5 text-sm ${mode === "csv2json" ? "border-foreground bg-foreground text-background" : "border-hairline"}`}
        >
          CSV → JSON
        </button>
        <button
          onClick={() => { setMode("json2csv"); setInput('[{"name":"Ada","age":36},{"name":"Grace","age":85}]'); }}
          className={`rounded-md border px-3 py-1.5 text-sm ${mode === "json2csv" ? "border-foreground bg-foreground text-background" : "border-hairline"}`}
        >
          JSON → CSV
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="mono min-h-[360px] w-full resize-none rounded-lg border border-hairline bg-card p-3 text-[13px] outline-none focus:border-foreground/40"
        />
        <div className="relative">
          <pre className="mono min-h-[360px] overflow-auto rounded-lg border border-hairline bg-card p-3 text-[13px]">
            {output}
          </pre>
          <button
            onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}
            className="absolute right-2 top-2 rounded-md border border-hairline bg-background p-1.5 hover:bg-accent"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
