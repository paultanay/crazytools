import { useMemo, useState } from "react";

const CATEGORIES = {
  Length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  Weight: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495,
  },
  Data: {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  },
  Time: {
    s: 1,
    ms: 0.001,
    min: 60,
    h: 3600,
    day: 86400,
  },
} as const;

type CatKey = keyof typeof CATEGORIES;

export function UnitConverterRunner() {
  const [cat, setCat] = useState<CatKey>("Length");
  const units = useMemo(() => Object.keys(CATEGORIES[cat]), [cat]);
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1]);
  const [value, setValue] = useState("1");

  const converted = useMemo(() => {
    const n = Number(value);
    if (!isFinite(n)) return "";
    const table = CATEGORIES[cat] as Record<string, number>;
    const inBase = n * (table[from] ?? 1);
    return (inBase / (table[to] ?? 1)).toLocaleString(undefined, { maximumFractionDigits: 8 });
  }, [value, from, to, cat]);

  const onCat = (c: CatKey) => {
    const u = Object.keys(CATEGORIES[c]);
    setCat(c);
    setFrom(u[0]);
    setTo(u[1]);
  };

  const handleTemp = cat === "Time" ? converted : converted; // placeholder, temperature uses non-linear conversion

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORIES) as CatKey[]).map((c) => (
          <button
            key={c}
            onClick={() => onCat(c)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              cat === c ? "border-foreground bg-foreground text-background" : "border-hairline hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-center text-muted-foreground">→</div>
        <div className="space-y-2">
          <input
            value={handleTemp}
            readOnly
            className="mono w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm"
          />
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
