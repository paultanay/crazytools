import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export function JsonValidatorRunner() {
  const [input, setInput] = useState(
    `{"name":"CrazyTools","version":1,"tools":["json-validator","json-formatter"],"open":true}`,
  );

  const parsed = useMemo(() => {
    if (!input.trim()) return { ok: false as const, error: "Empty input", value: null };
    try {
      return { ok: true as const, value: JSON.parse(input) as JsonValue };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid JSON",
        value: null,
      };
    }
  }, [input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col">
        <label
          htmlFor="json-validator-input"
          className="mono flex items-center justify-between px-1 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          <span>JSON input</span>
          <span>{input.length} chars</span>
        </label>
        <textarea
          id="json-validator-input"
          aria-label="JSON input to validate"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="mono min-h-[420px] w-full flex-1 resize-none rounded-lg border border-hairline bg-surface/40 p-4 text-[13px] leading-relaxed outline-none focus:border-primary/50"
          placeholder="Paste JSON here to validate"
        />
      </div>
      <div className="flex flex-col">
        <div className="mono flex items-center justify-between px-1 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Validation & tree</span>
          {parsed.ok ? (
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />
              Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              Invalid
            </span>
          )}
        </div>
        <div
          className={`mono relative flex-1 overflow-auto rounded-lg border p-4 text-[13px] leading-relaxed ${
            parsed.ok
              ? "border-hairline bg-surface/40"
              : "border-destructive/40 bg-destructive/5"
          }`}
          style={{ minHeight: 420 }}
        >
          {parsed.ok ? (
            <TreeNode name="root" value={parsed.value} depth={0} defaultOpen />
          ) : (
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <pre className="whitespace-pre-wrap">{parsed.error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  name,
  value,
  depth,
  defaultOpen,
}: {
  name: string;
  value: JsonValue;
  depth: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? depth < 2);

  if (value === null) return <Leaf name={name} valueLabel="null" tone="muted" />;
  if (typeof value === "string") return <Leaf name={name} valueLabel={`"${value}"`} tone="string" />;
  if (typeof value === "number") return <Leaf name={name} valueLabel={String(value)} tone="number" />;
  if (typeof value === "boolean") return <Leaf name={name} valueLabel={String(value)} tone="bool" />;

  const isArray = Array.isArray(value);
  const entries: Array<[string, JsonValue]> = isArray
    ? (value as JsonValue[]).map((v, i) => [String(i), v])
    : Object.entries(value as { [k: string]: JsonValue });

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        <ChevronRight className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className="text-foreground">{name}</span>
        <span className="text-muted-foreground">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>
      {open && (
        <div className="border-l border-hairline/60">
          {entries.map(([k, v]) => (
            <TreeNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Leaf({
  name,
  valueLabel,
  tone,
}: {
  name: string;
  valueLabel: string;
  tone: "string" | "number" | "bool" | "muted";
}) {
  const toneClass =
    tone === "string"
      ? "text-emerald-500"
      : tone === "number"
        ? "text-sky-500"
        : tone === "bool"
          ? "text-amber-500"
          : "text-muted-foreground";
  return (
    <div className="pl-4">
      <span className="text-foreground">{name}</span>
      <span className="text-muted-foreground">: </span>
      <span className={toneClass}>{valueLabel}</span>
    </div>
  );
}
