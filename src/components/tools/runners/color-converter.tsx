import { useMemo, useState } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function ColorConverterRunner() {
  const [hex, setHex] = useState("#3b82f6");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div
          className="h-32 w-32 flex-none rounded-2xl border border-hairline"
          style={{ background: hex }}
        />
        <div className="flex-1 space-y-3">
          <label className="mono block text-[11px] uppercase tracking-widest text-muted-foreground">
            Hex
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={rgb ? hex : "#000000"}
              onChange={(e) => setHex(e.target.value)}
              className="h-10 w-16 rounded border border-hairline bg-card"
            />
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="mono flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>
        </div>
      </div>
      {!rgb ? (
        <p className="mono text-[12px] text-destructive">Invalid hex color</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="RGB" value={`rgb(${rgb.join(", ")})`} />
          <Row label="HSL" value={`hsl(${hsl![0]}, ${hsl![1]}%, ${hsl![2]}%)`} />
          <Row label="HEX" value={rgbToHex(...rgb)} />
          <Row label="CSS var" value={`--color: ${rgbToHex(...rgb)};`} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-card p-3">
      <p className="mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <code className="mono mt-1 block text-[13px]">{value}</code>
    </div>
  );
}
