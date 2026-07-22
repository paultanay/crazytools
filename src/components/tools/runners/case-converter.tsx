import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

function words(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-\.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const T = {
  camel: (s: string) => {
    const w = words(s);
    return w.map((x, i) => (i === 0 ? x.toLowerCase() : x[0].toUpperCase() + x.slice(1).toLowerCase())).join("");
  },
  pascal: (s: string) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(""),
  snake: (s: string) => words(s).map((x) => x.toLowerCase()).join("_"),
  kebab: (s: string) => words(s).map((x) => x.toLowerCase()).join("-"),
  constant: (s: string) => words(s).map((x) => x.toUpperCase()).join("_"),
  title: (s: string) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(" "),
  sentence: (s: string) => {
    const w = words(s).map((x) => x.toLowerCase());
    if (w.length) w[0] = w[0][0].toUpperCase() + w[0].slice(1);
    return w.join(" ");
  },
  upper: (s: string) => s.toUpperCase(),
  lower: (s: string) => s.toLowerCase(),
};

export function CaseConverterRunner() {
  const [text, setText] = useState("Crazy Tools case converter");

  const results = useMemo(
    () => ({
      camelCase: T.camel(text),
      PascalCase: T.pascal(text),
      snake_case: T.snake(text),
      "kebab-case": T.kebab(text),
      CONSTANT_CASE: T.constant(text),
      "Title Case": T.title(text),
      "Sentence case": T.sentence(text),
      UPPERCASE: T.upper(text),
      lowercase: T.lower(text),
    }),
    [text],
  );

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="min-h-[120px] w-full resize-none rounded-lg border border-hairline bg-card p-3 text-sm outline-none focus:border-foreground/40"
      />
      <div className="space-y-2">
        {Object.entries(results).map(([k, v]) => (
          <div key={k} className="flex items-center gap-3 rounded-lg border border-hairline bg-card px-3 py-2">
            <span className="mono w-40 text-[11px] uppercase tracking-widest text-muted-foreground">{k}</span>
            <code className="mono flex-1 break-all text-[13px]">{v}</code>
            <button onClick={() => { navigator.clipboard.writeText(v); toast.success("Copied"); }} className="rounded-md p-1.5 hover:bg-accent">
              <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
