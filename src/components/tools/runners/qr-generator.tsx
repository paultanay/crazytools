import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function QrGeneratorRunner() {
  const [text, setText] = useState("https://crazytools.app");
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(512);
  const [dark, setDark] = useState("#0a0f1a");
  const [light, setLight] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text || " ", {
      errorCorrectionLevel: ecc,
      width: size,
      margin: 2,
      color: { dark, light },
    }).catch(() => {});
    QRCode.toString(text || " ", {
      type: "svg",
      errorCorrectionLevel: ecc,
      margin: 2,
      color: { dark, light },
    })
      .then(setSvg)
      .catch(() => {});
  }, [text, ecc, size, dark, light]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySvg = async () => {
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("SVG copied");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex items-center justify-center rounded-xl border border-hairline bg-surface/40 p-8">
        <canvas
          ref={canvasRef}
          className="max-h-[440px] max-w-full rounded-md border border-hairline bg-white"
        />
      </div>
      <div className="space-y-5">
        <Field label="Content">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mono min-h-[100px] w-full rounded-md border border-hairline bg-background p-3 text-[13px] outline-none focus:border-primary/50"
            placeholder="URL, text, contact card…"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Error correction">
            <select
              value={ecc}
              onChange={(e) => setEcc(e.target.value as "L" | "M" | "Q" | "H")}
              className="w-full rounded-md border border-hairline bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            >
              <option value="L">L · 7%</option>
              <option value="M">M · 15%</option>
              <option value="Q">Q · 25%</option>
              <option value="H">H · 30%</option>
            </select>
          </Field>
          <Field label={`Size · ${size}px`}>
            <input
              type="range"
              min={256}
              max={1024}
              step={64}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-[oklch(0.82_0.14_215)]"
            />
          </Field>
          <Field label="Foreground">
            <input
              type="color"
              value={dark}
              onChange={(e) => setDark(e.target.value)}
              className="h-9 w-full cursor-pointer rounded border border-hairline bg-transparent"
            />
          </Field>
          <Field label="Background">
            <input
              type="color"
              value={light}
              onChange={(e) => setLight(e.target.value)}
              className="h-9 w-full cursor-pointer rounded border border-hairline bg-transparent"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadPng}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            PNG
          </button>
          <button
            onClick={downloadSvg}
            className="inline-flex items-center gap-2 rounded-md border border-hairline px-4 py-2 text-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            SVG
          </button>
          <button
            onClick={copySvg}
            className="inline-flex items-center gap-2 rounded-md border border-hairline px-4 py-2 text-sm hover:bg-accent"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy SVG
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
