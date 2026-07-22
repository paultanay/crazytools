import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { DropZone } from "./image-to-pdf";
import { formatBytes } from "./pdf-compress";

export function ImageCompressRunner() {
  const [original, setOriginal] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [maxWidth, setMaxWidth] = useState(2400);
  const [busy, setBusy] = useState(false);
  const [previewOrig, setPreviewOrig] = useState<string | null>(null);
  const [previewComp, setPreviewComp] = useState<string | null>(null);

  const onFiles = (files: FileList | File[]) => {
    const f = Array.from(files)[0];
    if (!f) return;
    setOriginal(f);
    setCompressed(null);
    if (previewOrig) URL.revokeObjectURL(previewOrig);
    if (previewComp) URL.revokeObjectURL(previewComp);
    setPreviewOrig(URL.createObjectURL(f));
    setPreviewComp(null);
  };

  const run = async () => {
    if (!original) return;
    setBusy(true);
    try {
      const out = await imageCompression(original, {
        maxSizeMB: 25,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality,
      });
      setCompressed(out);
      setPreviewComp(URL.createObjectURL(out));
      toast.success("Image compressed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!compressed) return;
    const url = URL.createObjectURL(compressed);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed-" + (original?.name ?? "image");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!original && (
        <DropZone
          accept="image/*"
          multiple={false}
          label="Drop an image or click to select"
          onFiles={onFiles}
        />
      )}
      {original && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <PreviewPanel title="Original" src={previewOrig} size={original.size} />
            <PreviewPanel
              title="Compressed"
              src={previewComp}
              size={compressed?.size ?? null}
              highlight
            />
          </div>
          <div className="rounded-lg border border-hairline bg-surface/40 p-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <RangeField
                label={`Quality — ${(quality * 100).toFixed(0)}%`}
                min={0.2}
                max={1}
                step={0.05}
                value={quality}
                onChange={setQuality}
              />
              <RangeField
                label={`Max dimension — ${maxWidth}px`}
                min={640}
                max={4096}
                step={64}
                value={maxWidth}
                onChange={setMaxWidth}
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setOriginal(null)}
                className="rounded-md border border-hairline px-4 py-2 text-sm hover:bg-accent"
              >
                Reset
              </button>
              <button
                onClick={run}
                disabled={busy}
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Compressing…" : "Compress"}
              </button>
              {compressed && (
                <button
                  onClick={download}
                  className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewPanel({
  title,
  src,
  size,
  highlight,
}: {
  title: string;
  src: string | null;
  size: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        highlight ? "border-primary/40" : "border-hairline"
      } bg-surface/40`}
    >
      <div className="flex items-center justify-between border-hairline px-3 py-2 hairline-b">
        <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        <span className="mono text-[11px] text-muted-foreground">
          {size !== null ? formatBytes(size) : "—"}
        </span>
      </div>
      <div className="flex aspect-video items-center justify-center bg-black/40">
        {src ? (
          <img src={src} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="mono text-xs text-muted-foreground">Pending</span>
        )}
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[oklch(0.82_0.14_215)]"
      />
    </label>
  );
}
