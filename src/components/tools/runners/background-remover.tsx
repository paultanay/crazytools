import { useEffect, useRef, useState } from "react";
import { Upload, Download, Loader2, ArrowLeftRight, Eraser } from "lucide-react";
import { toast } from "sonner";

type ProgressHandler = (label: string, pct: number) => void;

const MODEL_CONFIG = {
  model: "isnet_quint8",
  output: { format: "image/png", quality: 0.9 },
} as const;

let modelPreload: Promise<void> | null = null;
let progressHandler: ProgressHandler | null = null;

const reportProgress = (key: string, current: number, total: number) => {
  if (!progressHandler) return;
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  if (key.startsWith("compute:")) {
    progressHandler("Removing background…", pct);
  } else {
    progressHandler("Downloading AI model…", pct);
  }
};

function ensureModel() {
  if (!modelPreload) {
    modelPreload = import("@imgly/background-removal")
      .then(({ preload }) => preload({ ...MODEL_CONFIG, progress: reportProgress }))
      .catch((e) => {
        modelPreload = null;
        throw e;
      });
  }
  return modelPreload;
}

export function BackgroundRemoverRunner() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);
  const urlsRef = useRef({ imageUrl: "", resultUrl: "" });
  urlsRef.current = { imageUrl, resultUrl };

  useEffect(() => {
    progressHandler = (label, pct) => setProgress({ label, pct });
    ensureModel()
      .then(() => setProgress(null))
      .catch(() => setProgress(null));
    return () => {
      progressHandler = null;
      URL.revokeObjectURL(urlsRef.current.imageUrl);
      URL.revokeObjectURL(urlsRef.current.resultUrl);
    };
  }, []);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setResultUrl("");
    setShowOriginal(false);
  };

  const run = async () => {
    if (!file || !imageUrl) return;
    setBusy(true);
    setShowOriginal(false);
    try {
      await ensureModel();
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(imageUrl, { ...MODEL_CONFIG, progress: reportProgress });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast.success("Background removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Background removal failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `bg-removed-${file?.name?.replace(/\.[^.]+$/, ".png") ?? "image.png"}`;
    a.click();
  };

  const copy = async () => {
    if (!resultUrl) return;
    const resp = await fetch(resultUrl);
    const blob = await resp.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentDisplay = showOriginal ? imageUrl : resultUrl || imageUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setHover(true);
          }}
          onDragLeave={() => setHover(false)}
          onDrop={(e) => {
            e.preventDefault();
            setHover(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors ${
            hover
              ? "border-primary bg-primary/5"
              : "border-hairline bg-surface/40 hover:border-foreground/40"
          }`}
        >
          {imageUrl ? (
            <img
              src={currentDisplay}
              alt={showOriginal ? "Original" : "Result"}
              className="max-h-[360px] rounded-md"
            />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">
                Drop or select an image (PNG, JPG, WebP)
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={run}
              disabled={!file || busy}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
              {busy ? "Processing…" : "Remove background"}
            </button>
          </div>
          {progress && (
            <div className="w-full max-w-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {progress.label}
                </span>
                <span className="mono">{progress.pct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                First run downloads a small AI model (~40 MB, cached afterwards)
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {resultUrl ? (showOriginal ? "Original" : "Result") : "Preview"}
          </div>
          <div className="flex items-center gap-2">
            {resultUrl && (
              <>
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  {showOriginal ? "Result" : "Original"}
                </button>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent disabled:opacity-50"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={download}
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs hover:bg-accent"
                >
                  <Download className="h-3 w-3" /> Download
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex min-h-[420px] items-center justify-center rounded-md border border-hairline bg-background p-3">
          {imageUrl ? (
            <img
              src={currentDisplay}
              alt={showOriginal ? "Original" : "Result"}
              className="max-h-[400px] rounded-md object-contain"
            />
          ) : (
            <span className="text-sm text-muted-foreground">Result will appear here…</span>
          )}
        </div>
      </div>
    </div>
  );
}
